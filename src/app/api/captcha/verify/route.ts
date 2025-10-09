import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '~/lib/api-response';

export const POST = async (req: Request) => {
  try {
    const { expectedText, userAnswer } = await req.json();
    
    if (!expectedText || !userAnswer) {
      return NextResponse.json(
        createErrorResponse('Missing expected text or user answer', 'BAD_REQUEST'),
        { status: 400 }
      );
    }

    if (userAnswer.toUpperCase() !== expectedText.toUpperCase()) {
      return NextResponse.json(createErrorResponse('Wrong captcha answer', 'WRONG'), { status: 400 });
    }

    return NextResponse.json(createSuccessResponse({ ok: true }));
  } catch (error) {
    return NextResponse.json(
      createErrorResponse('Failed to verify captcha', 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
};


