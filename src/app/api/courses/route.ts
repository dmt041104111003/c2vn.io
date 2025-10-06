import { NextResponse } from "next/server";
import { prisma } from "~/lib/prisma";
import { createSuccessResponse, createErrorResponse } from "~/lib/api-response";

export async function GET() {
  try {
    const courses = await (prisma as any).course.findMany({
      where: { 
        isActive: true,
        publishStatus: 'PUBLISHED'
      },
      orderBy: { createdAt: 'desc' },
      include: { locationRel: true },
    });
    return NextResponse.json(createSuccessResponse(courses));
  } catch (error) {
    return NextResponse.json(createErrorResponse('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
}
