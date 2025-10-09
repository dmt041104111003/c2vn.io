"use client";

import React, { useEffect, useState } from 'react';
import { useDeviceFingerprint } from '~/hooks/useDeviceFingerprint';

export default function AuthBannedPage() {
  const { deviceData } = useDeviceFingerprint();
  const [banDetails, setBanDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanDetails = async () => {
      if (!deviceData) return;
      
      try {
        const response = await fetch('/api/device/check-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceData })
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setBanDetails(result.data);
            
            // If ban has expired, redirect to home
            if (!result.data.isBanned) {
              window.location.href = '/';
            }
          }
        }
      } catch (error) {
        console.error('Error fetching ban details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanDetails();
    
    // Auto-refresh every 30 seconds to check ban status
    const interval = setInterval(fetchBanDetails, 30000);
    
    return () => clearInterval(interval);
  }, [deviceData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const banEndTime = banDetails?.bannedUntil ? new Date(banDetails.bannedUntil) : new Date();
  const lastAttemptTime = banDetails?.lastAttemptAt ? new Date(banDetails.lastAttemptAt) : new Date();
  const now = new Date();
  const timeRemaining = Math.max(0, banEndTime.getTime() - now.getTime());
  const hoursRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 text-center">

        
        <h1 className="text-2xl font-bold text-red-700 dark:text-red-300 mb-4">
          Authentication Blocked
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          This device has been temporarily blocked from all authentication (login and account creation) 
          due to multiple failed attempts.
        </p>

        {/* Ban Details */}
        {banDetails && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold text-red-800 dark:text-red-200">Failed Attempts:</span>
                <span className="text-red-600 dark:text-red-400">{banDetails.failedAttempts}/5</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-red-800 dark:text-red-200">Last Attempt:</span>
                <span className="text-red-600 dark:text-red-400">
                  {lastAttemptTime.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-red-800 dark:text-red-200">Time Remaining:</span>
                <span className="text-red-600 dark:text-red-400">
                  {hoursRemaining > 0 ? `${hoursRemaining} hours` : 'Expired'}
                </span>
              </div>
            </div>
          </div>
        )}


        
        <div className="space-y-4">
          <button
            onClick={() => window.location.href = '/'}
            disabled={hoursRemaining > 0}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md transition-colors ${
              hoursRemaining > 0 
                ? 'text-gray-400 bg-gray-300 cursor-not-allowed' 
                : 'text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {hoursRemaining > 0 ? 'Access Restricted' : 'Return to Home'}
          </button>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Need help? Contact us:</p>
            <div className="space-y-1 mt-2">
              <p>Email: <a href="mailto:cardano2vn@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">cardano2vn@gmail.com</a></p>
              <p>Telegram: <a href="https://t.me/cardano2vn" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">@cardano2vn</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
