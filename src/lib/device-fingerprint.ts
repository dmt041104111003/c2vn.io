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
  canvasFingerprint?: string;
}

export function generateDeviceFingerprint(userAgent: string, additionalData?: Partial<DeviceFingerprint>): string {
  const coreFingerprint = {
    platform: additionalData?.platform || 'unknown',
    hardwareConcurrency: additionalData?.hardwareConcurrency || 0,
    screenResolution: additionalData?.screenResolution || 'unknown',
    colorDepth: additionalData?.colorDepth || 0,
    maxTouchPoints: additionalData?.maxTouchPoints || 0,
  };

  const fingerprintString = `p:${coreFingerprint.platform}|hc:${coreFingerprint.hardwareConcurrency}|sr:${coreFingerprint.screenResolution}|cd:${coreFingerprint.colorDepth}|mt:${coreFingerprint.maxTouchPoints}`;
  const hash = crypto.createHash('sha256').update(fingerprintString).digest('hex');
  return hash;
}

export function extractDeviceInfoFromRequest(req: Request): Partial<DeviceFingerprint> {
  const userAgent = req.headers.get('user-agent') || '';
  
  return {
    userAgent,
    platform: extractPlatformFromUserAgent(userAgent),
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
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('Device fingerprint test', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('Device fingerprint test', 4, 17);
        
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
          canvasFingerprint: canvasFingerprint.substring(0, 200) 
        };
      }
      
      window.getDeviceFingerprint = getDeviceFingerprint;
    })();
  `;
}
