import { NextResponse } from 'next/server';
import { prisma } from '~/lib/prisma';
import { withAdmin } from '~/lib/api-wrapper';
import { createSuccessResponse, createErrorResponse } from '~/lib/api-response';

export const GET = withAdmin(async () => {
  try {
    const courses = await (prisma as any).course.findMany({
      orderBy: { createdAt: 'desc' },
      include: { locationRel: true },
    });
    return NextResponse.json(createSuccessResponse(courses));
  } catch (error) {
    return NextResponse.json(createErrorResponse('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
});

export const POST = withAdmin(async (req) => {
  const { name, image, description, price, locationId, locationName, startDate, publishStatus } = await req.json();
  
  if (!name) {
    return NextResponse.json(createErrorResponse('Missing course name', 'MISSING_NAME'), { status: 400 });
  }
  
  const normalizedName = String(name).trim();
  if (!normalizedName) {
    return NextResponse.json(createErrorResponse('Missing course name', 'MISSING_NAME'), { status: 400 });
  }
  const exist = await prisma.course.findFirst({ where: { name: { equals: normalizedName, mode: 'insensitive' } } as any });
  if (exist) {
    return NextResponse.json(createErrorResponse('Course already exists', 'COURSE_EXISTS'), { status: 409 });
  }
  
  let finalLocationId: string | null = locationId ? String(locationId) : null;
  const desiredLocationName: string | null = locationName ? String(locationName).trim() : null;
  if (!finalLocationId && desiredLocationName) {
    const existing = await (prisma as any).location.findFirst({ where: { name: { equals: desiredLocationName, mode: 'insensitive' } } });
    if (existing) {
      finalLocationId = existing.id;
    } else {
      const created = await (prisma as any).location.create({ data: { name: desiredLocationName } });
      finalLocationId = created.id;
    }
  }

  const course = await (prisma as any).course.create({
    data: ({ 
      name: normalizedName, 
      image: image || null, 
      description: description || null, 
      price: price || "free",
      locationId: finalLocationId,
      startDate: startDate ? new Date(startDate) : null,
      publishStatus 
    } as any)
  });
  
  return NextResponse.json(createSuccessResponse(course));
}); 