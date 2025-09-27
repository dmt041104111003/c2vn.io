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


