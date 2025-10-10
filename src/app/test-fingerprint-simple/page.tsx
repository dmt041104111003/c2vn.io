"use client";

import { useState } from 'react';
import { generateDeviceFingerprint } from '~/lib/device-fingerprint';

export default function TestFingerprintSimplePage() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fingerprintInput, setFingerprintInput] = useState('');

  const generateDeviceInfo = () => {
    const deviceInfo = {
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
      deviceMemory: (navigator as any).deviceMemory ?? null,
      vendor: (navigator as any).vendor ?? null,
      webdriver: (navigator as any).webdriver ?? null,
      platformVersion: (navigator as any).userAgentData?.platform ?? null,
      brands: (navigator as any).userAgentData?.brands ?? null,
      languages: (navigator as any).languages ?? [navigator.language],
      timezoneOffset: new Date().getTimezoneOffset(),
      colorScheme: typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      reducedMotion: typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      hdr: typeof window.matchMedia === 'function' && window.matchMedia('(dynamic-range: high)').matches,
      colorGamut: typeof window.matchMedia === 'function' && (['rec2020','p3','srgb'].find(g => window.matchMedia(`(color-gamut: ${g})`).matches) || 'unknown'),
      screenAvail: { width: (screen as any).availWidth, height: (screen as any).availHeight },
      connection: (navigator as any).connection ? {
        effectiveType: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink,
        rtt: (navigator as any).connection.rtt,
        saveData: (navigator as any).connection.saveData,
        type: (navigator as any).connection.type ?? null,
      } : null,
    };
    return deviceInfo;
  };

  const generateAsyncExtras = async () => {
    const extras: any = {};
    try {
      if ((navigator as any).getBattery) {
        const battery = await (navigator as any).getBattery();
        extras.battery = {
          charging: battery.charging,
          level: battery.level,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime,
        };
      }
    } catch {}
    try {
      if (navigator.storage && (navigator.storage as any).estimate) {
        const estimate = await navigator.storage.estimate();
        extras.storage = {
          quota: estimate.quota ?? null,
          usage: estimate.usage ?? null,
        };
      }
    } catch {}
    try {
      if ((navigator as any).permissions && (navigator as any).permissions.query) {
        const names = ['geolocation','notifications','camera','microphone'] as const;
        const results: Record<string, string> = {};
        await Promise.all(names.map(async (name) => {
          try {
            const status = await (navigator as any).permissions.query({ name } as any);
            results[name] = status.state;
          } catch {
            results[name] = 'unsupported';
          }
        }));
        extras.permissions = results;
      }
    } catch {}
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = "14px 'Arial'";
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('fingerprint-canvas', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('fingerprint-canvas', 4, 17);
        extras.canvas = canvas.toDataURL();
      }
    } catch {}
    try {
      const glCanvas = document.createElement('canvas');
      const gl = (glCanvas.getContext('webgl') || glCanvas.getContext('experimental-webgl')) as any;
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        extras.webgl = {
          vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
          renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
          shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
          version: gl.getParameter(gl.VERSION),
          maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
          maxCubeMapSize: gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE),
        };
      }
    } catch {}
    try {
      const ac = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (ac) {
        const audioCtx = new ac();
        extras.audio = { sampleRate: audioCtx.sampleRate, state: audioCtx.state };
        audioCtx.close?.();
      }
    } catch {}
    return extras;
  };

  const testFingerprint = async () => {
    setIsLoading(true);
    try {
      const deviceData = generateDeviceInfo();
      let fp: string | undefined = undefined;
      try {
        fp = await generateDeviceFingerprint(deviceData as any);
      } catch (e) {
      }
      const extras = await generateAsyncExtras();
      const payload = { deviceData: { ...deviceData, extras }, fingerprint: fp || undefined };

      const response = await fetch('/api/test/fingerprint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      setResults(prev => [...prev, {
        timestamp: new Date().toISOString(),
        status: response.status,
        data: result
      }]);
    } catch (error) {
      console.error('Error:', error);
      setResults(prev => [...prev, {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const lookupByFingerprint = async () => {
    if (!fingerprintInput) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/test/fingerprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fingerprint: fingerprintInput }),
      });
      const result = await response.json();
      setResults(prev => [...prev, {
        timestamp: new Date().toISOString(),
        status: response.status,
        data: result
      }]);
    } catch (error) {
      setResults(prev => [...prev, {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Device Fingerprint Test (Simple)</h1>
      
      <div className="mb-4 space-x-2">
        <button
          onClick={testFingerprint}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Fingerprint Generation'}
        </button>
        <input
          value={fingerprintInput}
          onChange={(e) => setFingerprintInput(e.target.value)}
          placeholder="Enter fingerprint to lookup"
          className="border px-2 py-2 rounded w-96"
        />
        <button
          onClick={lookupByFingerprint}
          disabled={isLoading || !fingerprintInput}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isLoading ? 'Looking up...' : 'Lookup by Fingerprint'}
        </button>
        <button
          onClick={clearResults}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Clear Results
        </button>
      </div>

      <div className="space-y-4">
        {results.map((result, index) => (
          <div key={index} className="border p-4 rounded">
            <h3 className="font-bold mb-2">Test #{index + 1} - {result.timestamp}</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
