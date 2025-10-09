import React from 'react';

interface BannedFormProps {
  failedAttempts: number;
  bannedUntil: string;
  lastAttemptAt: string;
}

export default function BannedForm({ failedAttempts, bannedUntil, lastAttemptAt }: BannedFormProps) {
  const banEndTime = new Date(bannedUntil);
  const lastAttemptTime = new Date(lastAttemptAt);
  const now = new Date();
  const timeRemaining = Math.max(0, banEndTime.getTime() - now.getTime());
  const hoursRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-red-200 dark:border-red-800 overflow-hidden max-w-2xl mx-auto">
      <div className="p-6 text-center">
   

        {/* Title */}
        <h2 className="text-2xl font-bold text-red-700 dark:text-red-300 mb-4">
          Access Temporarily Restricted
        </h2>

        {/* Description */}
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          This device has been temporarily restricted due to multiple failed attempts to use referral codes.
        </p>

        {/* Ban Details */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold text-red-800 dark:text-red-200">Failed Attempts</p>
              <p className="text-red-600 dark:text-red-400">{failedAttempts}/5</p>
            </div>
            <div>
              <p className="font-semibold text-red-800 dark:text-red-200">Last Attempt</p>
              <p className="text-red-600 dark:text-red-400">
                {lastAttemptTime.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="font-semibold text-red-800 dark:text-red-200">Time Remaining</p>
              <p className="text-red-600 dark:text-red-400">
                {hoursRemaining > 0 ? `${hoursRemaining} hours` : 'Expired'}
              </p>
            </div>
          </div>
        </div>


 
        {/* Contact Info */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p className="mb-2">Need help? Contact us:</p>
          <div className="space-y-1">
            <p>Email: <a href="mailto:cardano2vn@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">cardano2vn@gmail.com</a></p>
            <p>Telegram: <a href="https://t.me/cardano2vn" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">@cardano2vn</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
