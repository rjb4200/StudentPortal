import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const request = (zip: string) => new NextRequest(`https://example.test/api/postal-code?zip=${zip}`);

afterEach(() => vi.unstubAllGlobals());

describe('GET /api/postal-code', () => {
  it('returns normalized city and state for a known ZIP', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      places: [{ 'place name': 'Owingsville', 'state abbreviation': 'KY' }],
    }), { status: 200 })));

    const response = await GET(request('40360'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true, city: 'Owingsville', state: 'KY' });
  });

  it('rejects an invalid ZIP before contacting the provider', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const response = await GET(request('4036'));

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns not found for an unknown ZIP', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 404 })));

    const response = await GET(request('00501'));

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ success: false, error: 'ZIP code not found' });
  });

  it('reports provider unavailability', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));

    const response = await GET(request('90210'));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ success: false, error: 'ZIP lookup is temporarily unavailable' });
  });
});
