"use client";

import { useState, useEffect } from 'react';
import { Copy, Check, Gift, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface ReferralCodeData {
  referralCode: string;
  shareUrl: string;
}

export default function ReferralCodeCard() {
  const [referralData, setReferralData] = useState<ReferralCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralCode();
  }, []);

  const fetchReferralCode = async () => {
    try {
      const response = await fetch('/api/user/referral-code');
      const data = await response.json();

      if (data.success) {
        setReferralData(data.data);
      } else {
        toast.error('Failed to load referral code');
      }
    } catch (error) {
      toast.error('Failed to load referral code');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'code' | 'url') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${type === 'code' ? 'Referral code' : 'Share URL'} copied to clipboard!`);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const shareReferralCode = async () => {
    if (!referralData) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Cardano2VN with my referral code!',
          text: `Use my referral code: ${referralData.referralCode}`,
          url: referralData.shareUrl,
        });
      } catch (error) {
      }
    } else {
      copyToClipboard(referralData.shareUrl, 'url');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!referralData) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <Gift className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Unable to load referral code</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Gift className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Your Referral Code</h3>
          <p className="text-sm text-gray-600">Share this code to invite friends</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Referral Code
          </label>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-lg font-mono text-gray-900">
              {referralData.referralCode}
            </code>
            <button
              onClick={() => copyToClipboard(referralData.referralCode, 'code')}
              className="p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Copy referral code"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <Copy className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Share URL
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={referralData.shareUrl}
              readOnly
              aria-label="Share URL"
              className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-600"
            />
            <button
              onClick={() => copyToClipboard(referralData.shareUrl, 'url')}
              className="p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Copy share URL"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <Copy className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        <button
          onClick={shareReferralCode}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Share2 className="h-5 w-5" />
          Share Referral Code
        </button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>How it works:</strong> Share your referral code with friends. When they join using your code, you both get benefits!
        </p>
      </div>
    </div>
  );
}
