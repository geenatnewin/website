import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { uploadReceipt } from '../../../dashboard/r2'

const client = new Anthropic()

const RECEIPT_SCHEMA = {
  type: 'object',
  properties: {
    vendor: { type: 'string', description: 'Store or business name; empty string if illegible' },
    date: { type: 'string', description: 'Purchase date in YYYY-MM-DD format; empty string if illegible' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          description: { type: 'string' },
          amount: { type: 'number' },
        },
        required: ['description', 'amount'],
        additionalProperties: false,
      },
    },
    tax: { type: 'number', description: 'Sales tax on its own line; 0 if the receipt has no separate tax line' },
    shipping: { type: 'number', description: 'Shipping/delivery charge on its own line; 0 if none' },
  },
  required: ['vendor', 'date', 'items', 'tax', 'shipping'],
  additionalProperties: false,
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, 'application/pdf']
const MAX_BYTES = 10 * 1024 * 1024
const MAX_FILES = 6

// Splits tax/shipping across items by each item's share of the subtotal, in integer
// cents so the allocated amounts always sum exactly back to itemsTotal + extraCents
// (remainder lands on the last item rather than drifting from float rounding).
function allocateExtraCharges(items, extraCents) {
  const subtotalCents = items.reduce((sum, it) => sum + Math.round(it.amount * 100), 0)
  if (extraCents <= 0 || subtotalCents <= 0) return items
  let allocated = 0
  return items.map((it, i) => {
    const itemCents = Math.round(it.amount * 100)
    const isLast = i === items.length - 1
    const shareCents = isLast ? extraCents - allocated : Math.round((itemCents / subtotalCents) * extraCents)
    allocated += shareCents
    return { description: it.description, amount: (itemCents + shareCents) / 100 }
  })
}

export async function POST(request) {
  const formData = await request.formData()
  const files = formData.getAll('receipt').filter((f) => f && typeof f !== 'string')

  if (files.length === 0) {
    return NextResponse.json({ error: 'No receipt file provided' }, { status: 400 })
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `Too many files at once (max ${MAX_FILES})` }, { status: 400 })
  }
  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type — photos (JPEG/PNG/WEBP/HEIC) or PDF only' }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'One of the files is too large (max 10MB each)' }, { status: 400 })
    }
  }

  const uploaded = []
  for (const file of files) {
    const bytes = Buffer.from(await file.arrayBuffer())
    let receiptKey = null
    try {
      receiptKey = await uploadReceipt(bytes, file.type)
    } catch (err) {
      console.error('Receipt upload to R2 failed', err)
      // Keep going — the photo just won't be saved, but analysis can still fill the form.
    }
    uploaded.push({ bytes, type: file.type, receiptKey })
  }
  const receiptKeys = uploaded.map((u) => u.receiptKey).filter(Boolean)

  try {
    // A PDF (e.g. an emailed invoice, or a scanning app's PDF export) uses a
    // "document" content block instead of "image" — everything else about the
    // request is identical, Claude reads either the same way.
    const fileBlocks = uploaded.map((u) => ({
      type: u.type === 'application/pdf' ? 'document' : 'image',
      source: { type: 'base64', media_type: u.type, data: u.bytes.toString('base64') },
    }))
    const response = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 1536,
      output_config: { format: { type: 'json_schema', schema: RECEIPT_SCHEMA } },
      messages: [
        {
          role: 'user',
          content: [
            ...fileBlocks,
            {
              type: 'text',
              text: "These are one or more photos or PDFs of a single receipt for a freelance photographer/videographer's tax records (e.g. a long receipt photographed in multiple parts, a multi-page PDF invoice, or just one file — treat everything together as one receipt, don't double-count anything visible in more than one file). Extract the vendor name, purchase date, and every individual line item with its own price — list every item that appears; do not skip, merge, or summarize multiple items into one. For each item's description, write a short summarized name (a few words — e.g. \"NiSi Magnetic Filter Kit\", not the full verbose product title with every spec in parentheses). Separately: if sales tax is broken out as its own line, put that amount in the \"tax\" field (0 if there's no separate tax line). If there's a separate shipping/delivery charge, put that in the \"shipping\" field (0 if none). Do not include tax, shipping, the subtotal, or the grand total as one of the items — items should only be the actual products/services purchased. If the receipt only shows one total with no itemized breakdown, return a single item using the total amount and a short description of what was purchased, with tax and shipping left as 0. Leave vendor or date as an empty string if illegible.",
            },
          ],
        },
      ],
    })

    const block = response.content.find((b) => b.type === 'text')
    if (!block) {
      return NextResponse.json({ error: 'Could not read the receipt', receiptKeys }, { status: 422 })
    }

    const parsed = JSON.parse(block.text)
    const rawItems = (parsed.items || [])
      .map((it) => ({ description: String(it.description || '').slice(0, 200), amount: Number(it.amount) }))
      .filter((it) => Number.isFinite(it.amount) && it.amount > 0)

    const taxCents = Number.isFinite(parsed.tax) ? Math.round(parsed.tax * 100) : 0
    const shippingCents = Number.isFinite(parsed.shipping) ? Math.round(parsed.shipping * 100) : 0
    const items = allocateExtraCharges(rawItems, Math.max(taxCents, 0) + Math.max(shippingCents, 0))

    return NextResponse.json({
      vendor: parsed.vendor ? String(parsed.vendor).slice(0, 200) : '',
      date: /^\d{4}-\d{2}-\d{2}$/.test(parsed.date) ? parsed.date : '',
      items,
      receiptKeys,
    })
  } catch (err) {
    console.error('Receipt analysis failed', err)
    return NextResponse.json({ error: 'Could not analyze receipt', receiptKeys }, { status: 502 })
  }
}
