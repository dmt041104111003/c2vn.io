import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sheetId = process.env.CONTEST_SHEET_ID || '';
    const range = process.env.CONTEST_SHEET_RANGE || 'Form Responses';
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY || '';
    const pageParam = parseInt(url.searchParams.get('page') || '1', 10);
    const sizeParam = parseInt(url.searchParams.get('pageSize') || '20', 10);

    if (!sheetId || !apiKey) {
      return NextResponse.json({ success: false, error: 'Missing sheetId or API key' }, { status: 400 });
    }

    const encodedRange = encodeURIComponent(range);
    const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodedRange}?key=${apiKey}`;
    const res = await fetch(endpoint);
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ success: false, error: 'Failed to fetch', data }, { status: res.status });
    }

    const values: string[][] = Array.isArray(data?.values) ? data.values : [];
    if (values.length === 0) {
      return NextResponse.json({ success: true, data: { values: [], page: 1, pageSize: sizeParam, totalItems: 0, totalPages: 0 } });
    }

    const headers = values[0].map((h: string) => (h || '').toString());
    const lower = headers.map(h => h.trim().toLowerCase());
    const idxSTT = lower.indexOf('stt');
    const idxEmail = lower.indexOf('your-email');
    const idxScore = lower.indexOf('score');
    const idxDate = lower.indexOf('date');
    const entries = values.slice(1).map((row: string[]) => {
      const scoreRaw = (row[idxScore] ?? '').toString().replace(/,/g, '');
      const score = Number(scoreRaw);
      const dateStr = (row[idxDate] ?? '').toString();
      const d = new Date(dateStr);
      const ts = isNaN(d.getTime()) ? Infinity : d.getTime();
      return {
        stt: (row[idxSTT] ?? '').toString(),
        email: (row[idxEmail] ?? '').toString(),
        score: Number.isFinite(score) ? score : 0,
        dateStr,
        ts,
      };
    });

    entries.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.ts - b.ts;
    });

    const pageSize = Number.isFinite(sizeParam) && sizeParam > 0 ? sizeParam : 20;
    const totalItems = entries.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const page = Math.min(Math.max(1, Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1), totalPages);
    const start = (page - 1) * pageSize;
    const pageEntries = entries.slice(start, start + pageSize);

    const outHeaders = ['stt', 'your-email', 'score', 'Date'];
    const outRows = pageEntries.map(e => [e.stt, e.email, String(e.score), e.dateStr]);
    const outValues = [outHeaders, ...outRows];

    return NextResponse.json({ success: true, data: { values: outValues, page, pageSize, totalItems, totalPages } });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}


