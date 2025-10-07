import { NextResponse } from 'next/server';
import { prisma } from '~/lib/prisma';
import { withAdmin } from '~/lib/api-wrapper';
import { createSuccessResponse, createErrorResponse } from '~/lib/api-response';

export const GET = withAdmin(async (req) => {
  const id = req.nextUrl.pathname.split('/').pop();
  if (!id) {
    return NextResponse.json(createErrorResponse('Missing ID', 'MISSING_ID'), { status: 400 });
  }
  try {
    const course = await (prisma as any).course.findUnique({
      where: { id },
      include: { locationRel: true },
    });
    if (!course) {
      return NextResponse.json(createErrorResponse('Course not found', 'COURSE_NOT_FOUND'), { status: 404 });
    }
    return NextResponse.json(createSuccessResponse(course));
  } catch (error) {
    return NextResponse.json(createErrorResponse('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
});

export const PUT = withAdmin(async (req) => {
  try {
    const id = req.nextUrl.pathname.split('/').pop();
    if (!id) {
      return NextResponse.json(createErrorResponse('Missing ID', 'MISSING_ID'), { status: 400 });
    }

    const body = await req.json();
    const { name, image, description, price, location, locationId, locationName, startDate, publishStatus } = body;

    if (!name) {
      return NextResponse.json(createErrorResponse('Name is required', 'MISSING_NAME'), { status: 400 });
    }

    const normalizedName = String(name).trim();
    const existingCourse = await prisma.course.findFirst({
      where: {
        id: { not: id },
        name: { equals: normalizedName, mode: 'insensitive' } as any,
      }
    });

    if (existingCourse) {
      return NextResponse.json(createErrorResponse('Course name already exists', 'COURSE_NAME_ALREADY_EXISTS'), { status: 400 });
    }

    let finalLocation: string | null = location ? String(location).trim() : null;
    let finalLocationId: string | null = locationId ? String(locationId) : null;
    const desiredLocationName: string | null = locationName ? String(locationName).trim() : finalLocation;
    if (!finalLocationId && desiredLocationName) {
      const existing = await (prisma as any).location.findFirst({ where: { name: { equals: desiredLocationName, mode: 'insensitive' } } });
      if (existing) {
        finalLocationId = existing.id;
      } else {
        const created = await (prisma as any).location.create({ data: { name: desiredLocationName } });
        finalLocationId = created.id;
      }
    }

    const updatedCourse = await (prisma as any).course.update({
      where: { id },
      data: {
        name: normalizedName,
        image: image || null,
        description: description || null,
        price: price || "free",
        locationId: finalLocationId,
        startDate: startDate ? new Date(startDate) : null,
        publishStatus
      }
    });

    return NextResponse.json(createSuccessResponse(updatedCourse));
  } catch (error) {
    return NextResponse.json(createErrorResponse('Internal server error', 'INTERNAL_ERROR'), { status: 500 });
  }
});

export const DELETE = withAdmin(async (req) => {
  const id = req.nextUrl.pathname.split('/').pop();
  if (!id) {
    return NextResponse.json(createErrorResponse('Missing ID', 'MISSING_ID'), { status: 400 });
  }

  await prisma.course.delete({
    where: { id }
  });

  return NextResponse.json(createSuccessResponse({ success: true }));
}); 