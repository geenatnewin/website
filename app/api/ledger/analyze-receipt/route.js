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
  },
  required: ['vendor', 'date', 'items'],
  additionalProperties: false,
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
const MAX_BYTES = 10 * 1024 * 1024

export async function POST(request) {
  const formData = await request.formData()
  const file = formData.get('receipt')

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No receipt image provided' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Unsupported image type' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Image is too large (max 10MB)' }, { status: 400 })
  }

  const bytes = Buffer.from(await file.arrayBuffer())

  let receiptKey = null
  try {
    receiptKey = await uploadReceipt(bytes, file.type)
  } catch (err) {
    console.error('Receipt upload to R2 failed', err)
    // Keep going — the photo just won't be saved, but analysis can still fill the form.
  }

  try {
    const base64 = bytes.toString('base64')
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      output_config: { format: { type: 'json_schema', schema: RECEIPT_SCHEMA } },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: file.type, data: base64 } },
            {
              type: 'text',
              text: "This is a photo of a receipt for a freelance photographer/videographer's tax records. Extract the vendor name, purchase date, and each line item with its price. If the receipt only shows one total with no itemized breakdown, return a single item using the total amount and a short description of what was purchased. Leave vendor or date as an empty string if illegible.",
            },
          ],
        },
      ],
    })

    const block = response.content.find((b) => b.type === 'text')
    if (!block) {
      return NextResponse.json({ error: 'Could not read the receipt', receiptKey }, { status: 422 })
    }

    const parsed = JSON.parse(block.text)
    const items = (parsed.items || [])
      .map((it) => ({ description: String(it.description || '').slice(0, 200), amount: Number(it.amount) }))
      .filter((it) => Number.isFinite(it.amount) && it.amount > 0)

    return NextResponse.json({
      vendor: parsed.vendor ? String(parsed.vendor).slice(0, 200) : '',
      date: /^\d{4}-\d{2}-\d{2}$/.test(parsed.date) ? parsed.date : '',
      items,
      receiptKey,
    })
  } catch (err) {
    console.error('Receipt analysis failed', err)
    return NextResponse.json({ error: 'Could not analyze receipt', receiptKey }, { status: 502 })
  }
}
