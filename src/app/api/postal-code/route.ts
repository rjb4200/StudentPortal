import { NextRequest, NextResponse } from 'next/server';
import { usZipCodeSchema } from '@/lib/validation';

const cache = new Map<string, { city: string; state: string; expiresAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000;

type PostalResponse = {
  places?: Array<{ 'place name'?: string; 'state abbreviation'?: string }>;
};

export async function GET(request: NextRequest) {
  const zipCode = request.nextUrl.searchParams.get('zip') ?? '';
  const parsed = usZipCodeSchema.safeParse(zipCode);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Enter a valid ZIP code' }, { status: 400 });
  }

  const zip = parsed.data.slice(0, 5);
  const cached = cache.get(zip);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json({ success: true, city: cached.city, state: cached.state });
  }

  try {
    const response = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (response.status === 404) {
      return NextResponse.json({ success: false, error: 'ZIP code not found' }, { status: 404 });
    }
    if (!response.ok) throw new Error(`Postal provider returned ${response.status}`);

    const data = await response.json() as PostalResponse;
    const place = data.places?.[0];
    const city = place?.['place name']?.trim();
    const state = place?.['state abbreviation']?.trim();
    if (!city || !state) throw new Error('Postal provider response was incomplete');

    cache.set(zip, { city, state, expiresAt: Date.now() + CACHE_TTL_MS });
    return NextResponse.json({ success: true, city, state });
  } catch {
    return NextResponse.json({ success: false, error: 'ZIP lookup is temporarily unavailable' }, { status: 503 });
  }
}
