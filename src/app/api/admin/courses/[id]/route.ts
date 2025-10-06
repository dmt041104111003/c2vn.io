import { NextResponse } from 'next/server';
import { prisma } from '~/lib/prisma';
import { withAdmin } from '~/lib/api-wrapper';
import { createSuccessResponse, createErrorResponse } from '~/lib/api-response';

export const PUT = withAdmin(async (req) => {
  const id = req.nextUrl.pathname.split('/').pop();
  if (!id) {
    return NextResponse.json(createErrorResponse('Missing ID', 'MISSING_ID'), { status: 400 });
  }

  const body = await req.json();
  const { name, image, description, location, startDate, publishStatus } = body;

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

  const finalLocation: string | null = location ? String(location).trim() : null;

  const updatedCourse = await prisma.course.update({
    where: { id },
    data: {
      name: normalizedName,
      image: image || null,
      description: description || null,
      location: finalLocation || null,
      startDate: startDate ? new Date(startDate) : null,
      publishStatus
    }
  });

  return NextResponse.json(createSuccessResponse(updatedCourse));
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