import { NextResponse } from "next/server";
import { prisma } from "~/lib/prisma";
import { withAdmin } from "~/lib/api-wrapper";
import { createErrorResponse } from "~/lib/api-response";
import { createSuccessResponse } from "~/lib/api-response";

export const DELETE = withAdmin(async (req) => {
  const id = req.nextUrl.pathname.split("/").pop();

  if (!id) {
    return NextResponse.json(createErrorResponse('Missing video ID', 'MISSING_VIDEO_ID'), { status: 400 });
  }

  const deleted = await prisma.videoSection.delete({
    where: { id },
  });

  return NextResponse.json(createSuccessResponse({ success: true, deleted }));
});

export const PATCH = withAdmin(async (req) => {
  const id = req.nextUrl.pathname.split("/").pop();
  const body = await req.json();
  const { isFeatured, videoUrl, title, channelName, thumbnailUrl, order, description } = body as {
    isFeatured?: boolean;
    videoUrl?: string;
    title?: string;
    channelName?: string;
    thumbnailUrl?: string;
    order?: number;
    description?: string;
  };

  if (!id) {
    return NextResponse.json(createErrorResponse('Missing video ID', 'MISSING_VIDEO_ID'), { status: 400 });
  }

  const data: Record<string, any> = {};

  if (isFeatured === true) {
    const existingFeatured = await prisma.videoSection.findFirst({
      where: {
        isFeatured: true,
        NOT: { id },
      },
    });

    if (existingFeatured) {
      const maxOrder = await prisma.videoSection.findFirst({
        orderBy: { order: 'desc' },
        select: { order: true }
      });
      const nextOrder = maxOrder ? maxOrder.order + 1 : 1;

      await prisma.videoSection.update({
        where: { id: existingFeatured.id },
        data: { 
          isFeatured: false,
          order: nextOrder
        },
      });
    }

    data.isFeatured = true;
    data.order = 0;
  } else if (isFeatured === false) {
    const maxOrder = await prisma.videoSection.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true }
    });
    const nextOrder = maxOrder ? maxOrder.order + 1 : 1;
    
    data.isFeatured = false;
    data.order = nextOrder;
  }
  if (typeof title === "string") {
    data.title = title;
  }
  if (typeof channelName === "string") {
    data.channelName = channelName;
  }
  if (typeof description === "string") {
    data.description = description;
  }
  if (typeof order === "number" && order > 0) {
    const existingOrder = await prisma.videoSection.findFirst({
      where: {
        order: order,
        isFeatured: false,
        NOT: { id },
      },
    });

    if (existingOrder) {
      return NextResponse.json(
        createErrorResponse(`Order ${order} already exists. Please choose a different order number.`, "ORDER_ALREADY_EXISTS"),
        { status: 409 }
      );
    }

    data.order = order;
  }

  if (typeof videoUrl === "string") {
    const trimmedUrl = videoUrl.trim();
    if (!trimmedUrl) {
      return NextResponse.json(
        createErrorResponse("Missing videoUrl", "MISSING_VIDEO_URL"),
        { status: 400 }
      );
    }

    const videoId = extractYouTubeVideoId(trimmedUrl);
    if (!videoId) {
      return NextResponse.json(
        createErrorResponse("Invalid YouTube URL", "INVALID_YOUTUBE_URL"),
        { status: 400 }
      );
    }

    const existing = await prisma.videoSection.findFirst({
      where: {
        videoUrl: trimmedUrl,
        NOT: { id },
      },
    });
    if (existing) {
      return NextResponse.json(
        createErrorResponse("Video already exists", "VIDEO_ALREADY_EXISTS"),
        { status: 409 }
      );
    }

    data.videoUrl = trimmedUrl;
    data.videoId = videoId;
    data.thumbnailUrl =
      typeof thumbnailUrl === "string" && thumbnailUrl.trim()
        ? thumbnailUrl.trim()
        : `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  }

  data.updatedAt = new Date();

  const updated = await prisma.videoSection.update({
    where: { id },
    data,
  });

  return NextResponse.json(createSuccessResponse(updated));
});

function extractYouTubeVideoId(url: string): string | null {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}