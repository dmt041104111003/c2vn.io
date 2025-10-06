import { NextResponse } from 'next/server';
import { prisma } from '~/lib/prisma';
import { withAdmin } from '~/lib/api-wrapper';
import { createSuccessResponse, createErrorResponse } from '~/lib/api-response';

export const GET = withAdmin(async () => {
  try {
    const locations = await (prisma as any).location.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(createSuccessResponse(locations));
  } catch (error) {
    return NextResponse.json(createErrorResponse('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
});

export const POST = withAdmin(async (req) => {
  const { name } = await req.json();
  const normalized = String(name || '').trim();
  if (!normalized) {
    return NextResponse.json(createErrorResponse('Missing location name', 'MISSING_NAME'), { status: 400 });
  }
  const exist = await (prisma as any).location.findFirst({ where: { name: { equals: normalized, mode: 'insensitive' } } });
  if (exist) {
    return NextResponse.json(createSuccessResponse(exist));
  }
  const created = await (prisma as any).location.create({ data: { name: normalized } });
  return NextResponse.json(createSuccessResponse(created));
});


