import { NextResponse } from 'next/server';
import { createSuccessResponse } from '~/lib/api-response';

export const POST = async (req: Request) => {
  try {
    const { deviceData } = await req.json();
    
    console.log('=== FINGERPRINT DEBUG ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Raw deviceData:', JSON.stringify(deviceData, null, 2));
    
    const fields = [
      'userAgent',
      'language', 
      'platform',
      'screenResolution',
      'timezone',
      'cookieEnabled',
      'doNotTrack',
      'hardwareConcurrency',
      'maxTouchPoints',
      'colorDepth',
      'pixelRatio'
    ];
    
    const fieldValues: Record<string, any> = {};
    fields.forEach(field => {
      fieldValues[field] = deviceData[field];
      console.log(`${field}:`, deviceData[field]);
    });
    
    console.log('=== END DEBUG ===');
    
    return NextResponse.json(createSuccessResponse({
      timestamp: new Date().toISOString(),
      fieldValues,
      rawData: deviceData
    }));
    
  } catch (error) {
    return NextResponse.json(createSuccessResponse({
      error: error instanceof Error ? error.message : 'Unknown error'
    }));
  }
};