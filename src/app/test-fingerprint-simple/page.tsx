"use client";

import { useState } from 'react';
import { InlineMath, BlockMath } from "react-katex";

export default function TestFingerprintSimplePage() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [latex, setLatex] = useState<string>("$p=(c+k) \\pmod{26}$");

  if (typeof document !== 'undefined') {
    const id = 'katex-css-cdn-test';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css';
      document.head.appendChild(link);
    }
  }

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
      canvasFingerprint: '',
    };
    return deviceInfo;
  };

  const testFingerprint = async () => {
    setIsLoading(true);
    try {
      const deviceData = generateDeviceInfo();

      const response = await fetch('/api/test/fingerprint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          deviceData: deviceData,
          meta: {
            name: name.trim() || undefined,
            email: email.trim() || undefined,
            notes: notes.trim() || undefined,
          }
        }),
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

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Device Fingerprint Test (Simple)</h1>
      
      {/* Live KaTeX preview */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">LaTeX Input</label>
          <textarea
            value={latex}
            onChange={(e) => setLatex(e.target.value)}
            className="w-full border rounded px-3 py-2 h-28"
            placeholder="Type $inline$ or $$block$$ math"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Preview</label>
          <div className="border rounded px-3 py-2 min-h-28">
            <MathText text={latex} />
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="w-full border rounded px-3 py-2"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full border rounded px-3 py-2"
              placeholder="you@example.com"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isLoading}
            className="w-full border rounded px-3 py-2 h-24"
            placeholder="Any additional info to send with the request"
          />
        </div>
      </div>

      <div className="mb-4 space-x-2">
        <button
          onClick={testFingerprint}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Fingerprint Generation'}
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

// Minimal inline/block LaTeX renderer used for preview
function MathText({ text }: { text: string }) {
  const parts = tokenizeMath(text);
  return (
    <span className="[&_span.katex-display]:my-2">
      {parts.map((p, i) => p.type === 'block'
        ? <BlockMath key={i} math={p.value} />
        : p.type === 'inline'
          ? <InlineMath key={i} math={p.value} />
          : <span key={i}>{p.value}</span>
      )}
    </span>
  );
}

type Token = { type: 'text' | 'inline' | 'block'; value: string };
function tokenizeMath(input: string): Token[] {
  if (!input) return [{ type: 'text', value: '' }];
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    if (input[i] === '$' && input[i + 1] === '$') {
      const end = input.indexOf('$$', i + 2);
      if (end !== -1) {
        tokens.push({ type: 'block', value: input.slice(i + 2, end).trim() });
        i = end + 2;
        continue;
      }
    }
    if (input[i] === '$') {
      const end = input.indexOf('$', i + 1);
      if (end !== -1) {
        tokens.push({ type: 'inline', value: input.slice(i + 1, end).trim() });
        i = end + 1;
        continue;
      }
    }
    const next = nextDollar(input, i);
    tokens.push({ type: 'text', value: input.slice(i, next) });
    i = next;
  }
  return tokens;
}
function nextDollar(s: string, from: number) {
  const i1 = s.indexOf('$', from);
  return i1 === -1 ? s.length : i1;
}