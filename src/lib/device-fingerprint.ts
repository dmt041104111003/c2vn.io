import crypto from 'crypto';

export interface DeviceFingerprint {
  userAgent: string;
  language: string;
  platform: string;
  screenResolution: string;
  timezone: string;
  cookieEnabled: boolean;
  doNotTrack: string;
  hardwareConcurrency: number;
  maxTouchPoints: number;
  colorDepth: number;
  pixelRatio: number;
}

export function generateDeviceFingerprint(userAgent: string, additionalData?: Partial<DeviceFingerprint>): string {
  const fingerprint: DeviceFingerprint = {
    userAgent: userAgent || '',
    language: additionalData?.language || 'unknown',
    platform: additionalData?.platform || 'unknown',
    screenResolution: additionalData?.screenResolution || 'unknown',
    timezone: additionalData?.timezone || 'unknown',
    cookieEnabled: additionalData?.cookieEnabled || false,
    doNotTrack: additionalData?.doNotTrack || 'unknown',
    hardwareConcurrency: additionalData?.hardwareConcurrency || 0,
    maxTouchPoints: additionalData?.maxTouchPoints || 0,
    colorDepth: additionalData?.colorDepth || 0,
    pixelRatio: additionalData?.pixelRatio || 0,
  };

  // Tạo hash từ fingerprint
  const fingerprintString = JSON.stringify(fingerprint);
  return crypto.createHash('sha256').update(fingerprintString).digest('hex');
}

export function extractDeviceInfoFromRequest(req: Request): Partial<DeviceFingerprint> {
  const userAgent = req.headers.get('user-agent') || '';
  const acceptLanguage = req.headers.get('accept-language') || '';
  const acceptEncoding = req.headers.get('accept-encoding') || '';
  const dnt = req.headers.get('dnt') || '';
  
  return {
    userAgent,
    language: acceptLanguage.split(',')[0] || 'unknown',
    platform: extractPlatformFromUserAgent(userAgent),
    doNotTrack: dnt,
  };
}

function extractPlatformFromUserAgent(userAgent: string): string {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'Mac';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown';
}

export function createClientFingerprintScript(): string {
  return `
    (function() {
      function getDeviceFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Device fingerprint', 2, 2);
        const canvasFingerprint = canvas.toDataURL();
        
        return {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          screenResolution: screen.width + 'x' + screen.height,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          cookieEnabled: navigator.cookieEnabled,
          doNotTrack: navigator.doNotTrack,
          hardwareConcurrency: navigator.hardwareConcurrency || 0,
          maxTouchPoints: navigator.maxTouchPoints || 0,
          colorDepth: screen.colorDepth,
          pixelRatio: window.devicePixelRatio || 1,
          canvasFingerprint: canvasFingerprint.substring(0, 100) // Chỉ lấy 100 ký tự đầu
        };
      }
      
      window.getDeviceFingerprint = getDeviceFingerprint;
    })();
  `;
}
