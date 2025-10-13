import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, score } = await req.json();

    const emailStr = String(email || '').trim();
    if (!emailStr) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailStr)) {
      return NextResponse.json({ success: false, error: 'Invalid email format' }, { status: 400 });
    }

    const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL_3;
    if (!scriptUrl) {
      return NextResponse.json({ success: false, error: 'Missing NEXT_PUBLIC_GOOGLE_SCRIPT_URL_3' }, { status: 500 });
    }

    let nextStt = 1;
    try {
      const sheetId = process.env.CONTEST_SHEET_ID || '';
      const apiKey = process.env.GOOGLE_SHEETS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY || '';
      const range = process.env.CONTEST_SHEET_RANGE || 'Form Responses';
      if (sheetId && apiKey) {
        const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`;
        const res = await fetch(endpoint);
        const data = await res.json();
        const values: unknown[] = Array.isArray(data?.values) ? data.values : [];
        nextStt = Math.max(1, values.length); 
      }
    } catch {}

    const body = new URLSearchParams();
    body.set('stt', `C2VN-${nextStt}`); 
    if (emailStr) body.set('your-email', emailStr);
    if (score != null) body.set('score', String(score));

    const res = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: body.toString(),
    });

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json() : await res.text();

    if (!res.ok) {
      return NextResponse.json({ success: false, error: 'Script error', data }, { status: res.status });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Submit failed' }, { status: 500 });
  }
}


