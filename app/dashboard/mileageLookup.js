// Free, keyless geocoding (Nominatim/OSM) + routing (OSRM demo server) — fine for
// personal, occasional lookups. Home coordinates pre-geocoded once to avoid an
// extra network round trip on every calculation.
const HOME_ADDRESS = '11032 Mac Murray St, Garden Grove, CA 92841'
const HOME_COORDS = { lat: 33.8024396, lon: -117.9779538 }

const METERS_PER_MILE = 1609.344

async function geocodeAddress(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'navinng-ledger/1.0 (personal gig tracker)' },
  })
  if (!res.ok) throw new Error('Geocoding request failed')
  const results = await res.json()
  if (!results.length) throw new Error('Address not found')
  return { lat: Number(results[0].lat), lon: Number(results[0].lon) }
}

async function drivingMilesOneWay(from, to) {
  const url = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Routing request failed')
  const data = await res.json()
  if (data.code !== 'Ok' || !data.routes?.length) throw new Error('No route found')
  return data.routes[0].distance / METERS_PER_MILE
}

export async function roundTripMilesFromHome(venueAddress) {
  const venueCoords = await geocodeAddress(venueAddress)
  const oneWay = await drivingMilesOneWay(HOME_COORDS, venueCoords)
  return Math.round(oneWay * 2 * 10) / 10
}

export { HOME_ADDRESS }
