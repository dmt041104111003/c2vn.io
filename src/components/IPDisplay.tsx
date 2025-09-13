"use client";

import React, { useState, useEffect } from 'react';

interface IPInfo {
  ip: string;
  timestamp: string;
  userAgent: string;
}

export function IPDisplay() {
  const [ipInfo, setIpInfo] = useState<IPInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIPInfo = async () => {
      try {
        const response = await fetch('/api/ip-info');
        if (!response.ok) {
          throw new Error('Failed to fetch IP information');
        }
        const data = await response.json();
        setIpInfo(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchIPInfo();
  }, []);

  if (loading) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-blue-700 dark:text-blue-300 text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-red-700 dark:text-red-300 text-sm">Error: {error}</span>
        </div>
      </div>
    );
  }

  if (!ipInfo) {
    return null;
  }

  return (
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span className="text-green-700 dark:text-green-300 font-medium text-sm">Your connection information:</span>
        </div>
        
        <div className="pl-6 space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-green-600 dark:text-green-400 text-xs font-medium">IP Address:</span>
            <span className="text-green-800 dark:text-green-200 text-xs font-mono bg-green-100 dark:bg-green-800 px-2 py-1 rounded">
              {ipInfo.ip}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-green-600 dark:text-green-400 text-xs font-medium">Time:</span>
            <span className="text-green-800 dark:text-green-200 text-xs">
              {new Date(ipInfo.timestamp).toLocaleString('vi-VN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
