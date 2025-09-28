import { NextResponse } from "next/server";
import { prisma } from "~/lib/prisma";
import { withAdmin } from "~/lib/api-wrapper";
import { createSuccessResponse, createErrorResponse } from "~/lib/api-response";

export const GET = withAdmin(async () => {
  try {
    const images = await prisma.eventImages.findMany({
      orderBy: { orderNumber: 'asc' },
    });
    return NextResponse.json(createSuccessResponse(images));
  } catch {
    return NextResponse.json(createErrorResponse('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
});

export const POST = withAdmin(async (req) => {
  const { location, title, imageUrl, orderNumber } = await req.json();
  
  if (!location || !title || !imageUrl) {
    return NextResponse.json(createErrorResponse('Missing required fields', 'MISSING_REQUIRED_FIELDS'), { status: 400 });
  }
  
  const image = await prisma.eventImages.create({
    data: { location, title, imageUrl, orderNumber: orderNumber || 0 }
  });
  
  return NextResponse.json(createSuccessResponse(image));
});
