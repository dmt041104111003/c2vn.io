import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '~/lib/api-response';

export const GET = async () => {
  try {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let text = '';
    for (let i = 0; i < 6; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return NextResponse.json(
      createSuccessResponse({ text })
    );
  } catch (error) {
    return NextResponse.json(
      createErrorResponse('Failed to create captcha', 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
};


