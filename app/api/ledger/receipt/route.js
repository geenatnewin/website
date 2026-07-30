import { NextResponse } from 'next/server'
import { getReceiptUrl } from '../../../dashboard/r2'

export async function GET(request) {
  const key = request.nextUrl.searchParams.get('key')
  if (!key) {
    return NextResponse.json({ error: 'Missing key' }, { status: 400 })
  }
  const url = await getReceiptUrl(key)
  return NextResponse.redirect(url)
}
