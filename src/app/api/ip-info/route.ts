import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '~/lib/api-response';
import { getClientInfo } from '~/lib/ip-utils';

export async function GET(req: NextRequest) {
  try {
    const clientInfo = getClientInfo(req);
    
    const ipInfo = {
      ip: clientInfo.ip,
      timestamp: new Date().toISOString(),
      userAgent: clientInfo.userAgent
    };

    return NextResponse.json(createSuccessResponse(ipInfo));
  } catch (error) {
    console.error('IP info error:', error);
    return NextResponse.json(createErrorResponse('Failed to get IP information', 'IP_INFO_ERROR'), { status: 500 });
  }
}
