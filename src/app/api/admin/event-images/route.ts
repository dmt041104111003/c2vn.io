import { NextResponse } from "next/server";
import { prisma } from "~/lib/prisma";
import { withAdmin } from "~/lib/api-wrapper";
import { createErrorResponse, createSuccessResponse } from "~/lib/api-response";

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
  try {
    const body = await req.json();
    const { title, location, imageUrl, orderNumber } = body as {
      title?: string;
      location?: string;
      imageUrl?: string;
      orderNumber?: number;
    };

    if (
      orderNumber === undefined ||
      orderNumber === null ||
      typeof orderNumber !== "number"
    ) {
      return NextResponse.json(
        createErrorResponse("orderNumber is required", "MISSING_FIELDS"),
        { status: 400 }
      );
    }

    if (!title || !location) {
      return NextResponse.json(
        createErrorResponse("Title and location are required", "MISSING_FIELDS"),
        { status: 400 }
      );
    }

    const existing = await prisma.eventImages.findFirst({
      where: { orderNumber }
    });

    if (existing) {
      const updated = await prisma.eventImages.update({
        where: { id: existing.id },
        data: {
          title,
          location,
          imageUrl: imageUrl ?? existing.imageUrl,
          orderNumber,
        },
      });
      return NextResponse.json(
        createSuccessResponse({
          image: {
            id: updated.id,
            title: updated.title,
            location: updated.location,
            imageUrl: updated.imageUrl,
            orderNumber: updated.orderNumber,
          },
        })
      );
    }

    const created = await prisma.eventImages.create({
      data: {
        title,
        location,
        imageUrl: imageUrl ?? "",
        orderNumber,
      },
    });

    return NextResponse.json(
      createSuccessResponse({
        image: {
          id: created.id,
          title: created.title,
          location: created.location,
          imageUrl: created.imageUrl,
          orderNumber: created.orderNumber,
        },
      })
    );
  } catch (error) {
    return NextResponse.json(
      createErrorResponse("Failed to upsert event", "UPSERT_FAILED"),
      { status: 500 }
    );
  }
});
