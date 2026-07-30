import { NextResponse } from 'next/server'
import { roundTripMilesFromHome } from '../../../ledger/mileageLookup'

export async function GET(request) {
  const address = request.nextUrl.searchParams.get('address')
  if (!address || !address.trim()) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  try {
    const miles = await roundTripMilesFromHome(address.trim())
    return NextResponse.json({ miles })
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Could not calculate mileage' }, { status: 422 })
  }
}
