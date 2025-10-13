import { NextResponse } from 'next/server';

const BASE_URL = 'https://cardano-mainnet.blockfrost.io/api/v0';

export async function GET(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_BLOCKFROST_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Missing Blockfrost API key' }, { status: 500 });
    }

    const params = await ctx.params;
    const subPath = Array.isArray(params?.path) ? params.path.join('/') : '';

    const allowed = [
      'pools',
      'accounts',
      'governance/dreps',
      'epochs/latest/parameters',
    ];
    const isAllowed = allowed.some(prefix => subPath.startsWith(prefix));
    if (!isAllowed) {
      return NextResponse.json({ success: false, error: 'Path not allowed' }, { status: 400 });
    }

    const url = new URL(`${BASE_URL}/${subPath}`);
    const reqUrl = new URL(req.url);
    reqUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));

    const res = await fetch(url.toString(), {
      headers: { project_id: apiKey },
    });

    const contentType = res.headers.get('content-type') || '';
    const body = contentType.includes('application/json') ? await res.json() : await res.text();

    return new NextResponse(
      contentType.includes('application/json') ? JSON.stringify(body) : (body as string),
      {
        status: res.status,
        headers: {
          'content-type': contentType || 'application/json',
        },
      }
    );
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Blockfrost proxy error' }, { status: 500 });
  }
}


