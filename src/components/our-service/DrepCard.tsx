"use client";

import React from "react";

export default function DrepCard({
  drepId,
  status,
  votingPower,
  loading,
  onCopy,
  onDelegate,
}: {
  drepId: string;
  status: string;
  votingPower: string;
  loading: boolean;
  onCopy: (id: string) => void;
  onDelegate: () => void;
}) {
  const shorten = (id: string) => (id.length <= 20 ? id : `${id.slice(0, 12)}…${id.slice(-8)}`);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-center text-xl font-semibold text-gray-900 dark:text-white mb-6">Our DREP: C2VN</h3>
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200">Wallet Compatibility Notice</h4>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              <strong>Cardano wallets only:</strong> DRep and pool delegation only work with Cardano wallets.
              We recommend <strong>Eternl</strong>, <strong>Lace</strong>, or <strong>Yoroi</strong> for the best experience.
              <br />
              <span className="text-amber-600 dark:text-amber-400">MetaMask and other non-Cardano wallets are not supported for delegation.</span>
            </p>
          </div>
        </div>
      </div>
      <p className="font-semibold">DRep ID:</p>
      <p
        className="text-sm break-all text-gray-700 dark:text-gray-300 cursor-pointer select-none"
        title={drepId}
        onClick={() => onCopy(drepId)}
      >
        {shorten(drepId)}
      </p>
      <p className="mt-3 font-semibold">Status:</p>
      <p className="text-gray-700 dark:text-gray-300">{loading ? "…" : status}</p>
      <p className="mt-3 font-semibold">Voting Power:</p>
      <p className="text-gray-700 dark:text-gray-300">{loading ? "…" : votingPower}</p>
      <button onClick={onDelegate} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
        Delegate to DRep
      </button>
    </div>
  );
}


