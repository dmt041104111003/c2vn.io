import { useState, useEffect } from 'react';

export interface DeviceFingerprintData {
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
  canvasFingerprint: string;
}

export function useDeviceFingerprint() {
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [deviceData, setDeviceData] = useState<DeviceFingerprintData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateFingerprint = async () => {
      try {
        if (typeof window === 'undefined') {
          setError('Not in browser environment');
          setIsLoading(false);
          return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        let canvasFingerprint = '';
        if (ctx) {
          ctx.textBaseline = 'top';
          ctx.font = '14px Arial';
          ctx.fillText('Device fingerprint', 2, 2);
          canvasFingerprint = canvas.toDataURL();
        }

        const deviceInfo: DeviceFingerprintData = {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          screenResolution: `${screen.width}x${screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          cookieEnabled: navigator.cookieEnabled,
          doNotTrack: navigator.doNotTrack || 'unknown',
          hardwareConcurrency: navigator.hardwareConcurrency || 0,
          maxTouchPoints: navigator.maxTouchPoints || 0,
          colorDepth: screen.colorDepth,
          pixelRatio: window.devicePixelRatio || 1,
          canvasFingerprint: canvasFingerprint || '',
        };

        setDeviceData(deviceInfo);

        const response = await fetch('/api/device/fingerprint', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            deviceData: deviceInfo,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate fingerprint');
        }

        const result = await response.json();
        if (result.success && result.data?.fingerprint) {
          setFingerprint(result.data.fingerprint);
        } else {
          throw new Error('Invalid fingerprint response');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    generateFingerprint();
  }, []);

  return {
    fingerprint,
    deviceData,
    isLoading,
    error,
  };
}
