"use client";

import React from "react";

export default function PoolCard({
  poolId,
  ticker,
  delegators,
  blocks,
  stake,
  pledge,
  loading,
  onCopy,
  onDelegate,
}: {
  poolId: string;
  ticker: string;
  delegators: number | null;
  blocks: number | null;
  stake: string | null;
  pledge: string | null;
  loading: boolean;
  onCopy: (id: string) => void;
  onDelegate: () => void;
}) {
  const shorten = (id: string) => (id.length <= 20 ? id : `${id.slice(0, 12)}…${id.slice(-8)}`);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{ticker}</h3>
      <p
        className="text-sm break-all text-gray-700 dark:text-gray-300 cursor-pointer select-none"
        title={poolId}
        onClick={() => onCopy(poolId)}
      >
        {shorten(poolId)}
      </p>
      <p className="mt-2">Delegators: {loading ? "…" : delegators ?? 0}</p>
      <p>Lifetime Blocks: {loading ? "…" : blocks ?? 0}</p>
      <p>Live Stake: {loading ? "…" : stake ?? "-"}</p>
      <p>Pledge: {loading ? "…" : pledge ?? "-"}</p>
      <button onClick={onDelegate} className="mt-3 px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
        Delegate to {ticker}
      </button>
    </div>
  );
}


