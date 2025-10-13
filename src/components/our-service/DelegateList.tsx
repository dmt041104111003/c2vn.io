"use client";

import React from "react";
import { useToastContext } from "~/components/toast-provider";

const BLOCKFROST_PROXY = "/api/blockfrost";

type DelegatorItem = {
  address?: string; 
  stake_address?: string;
  voting_power?: string | number;
  amount?: string | number;
};

type AccountInfo = {
  active?: boolean;
  controlled_amount?: string;
};

export default function DelegateList({ drepId, poolId, title }: { drepId?: string; poolId?: string; title?: string }) {
  const { showError, showSuccess } = useToastContext();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [delegators, setDelegators] = React.useState<DelegatorItem[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const basePath = drepId
          ? `/governance/dreps/${drepId}/delegators`
          : poolId
          ? `/pools/${poolId}/delegators`
          : null;
        if (!basePath) throw new Error("Missing drepId or poolId");
        const url = new URL(`${BLOCKFROST_PROXY}${basePath}`, window.location.origin);
        url.searchParams.set("order", "desc");
        url.searchParams.set("count", "5");
        url.searchParams.set("page", "1");
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`Delegators HTTP ${res.status}`);
        const data = await res.json();
        const baseList: DelegatorItem[] = Array.isArray(data) ? data.slice(0, 5) : [];
        const withDetails = await Promise.all(
          baseList.map(async (d) => {
            const addr = (d as any).stake_address || (d as any).address;
            let details: AccountInfo | null = null;
            try {
              if (addr) {
                const a = await fetch(`${BLOCKFROST_PROXY}/accounts/${addr}`);
                if (a.ok) details = await a.json();
              }
            } catch {}
            return { ...d, __details: details } as DelegatorItem & { __details?: AccountInfo | null };
          })
        );
        if (!cancelled) setDelegators(withDetails);
      } catch (e) {
        const msg = (e as Error).message;
        if (!cancelled) {
          setError(msg);
          showError("Failed to load delegators", msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [drepId, poolId, showError]);

  function shorten(text: string, head = 10, tail = 8) {
    if (!text) return "";
    return text.length <= head + tail + 1 ? text : `${text.slice(0, head)}…${text.slice(-tail)}`;
  }

  function formatAda(value?: string | number) {
    if (value == null) return "-";
    const str = String(value);
    const num = Number(str);
    if (Number.isFinite(num)) {
      return `${(num / 1_000_000).toLocaleString()} ₳`;
    }
    const s = str.replace(/\D/g, "");
    if (s.length <= 6) return `0.${s.padStart(6, '0')} ₳`;
    const head = s.slice(0, -6);
    const tail = s.slice(-6);
    const headWithSep = head.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${headWithSep}.${tail} ₳`;
  }

  async function copyStakeAddress(addr: string) {
    try {
      await navigator.clipboard.writeText(addr);
      showSuccess("Copied address", shorten(addr));
    } catch (e) {
      showError("Copy failed", (e as Error).message);
    }
  }

  const explorerUrl = drepId
    ? `https://beta.cexplorer.io/drep/${encodeURIComponent(drepId)}`
    : poolId
    ? `https://beta.cexplorer.io/pool/${encodeURIComponent(poolId as string)}`
    : undefined;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-base font-semibold text-gray-900 dark:text-white">{title || "Recent Delegators"}</h4>
        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            View all
          </a>
        )}
      </div>
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</div>
      )}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100/70 dark:bg-gray-800/70 rounded-md animate-pulse" />
          ))}
        </div>
      ) : delegators.length === 0 ? (
        <p className="text-sm text-gray-500">No recent delegators found.</p>
      ) : (
        <div
          role="list"
          className="rounded-md ring-1 ring-gray-200/50 dark:ring-gray-700/50 bg-white/40 dark:bg-gray-900/30 backdrop-blur-sm divide-y divide-gray-200/70 dark:divide-gray-700/60 overflow-hidden"
        >
          {delegators.map((d: any, idx) => {
            const stake = d.stake_address ?? d.address ?? "";
            const power = (d as any).voting_power ?? (d as any).amount ?? (d as any).live_stake;
            const active = d.__details?.active;
            const controlled = d.__details?.controlled_amount;
            return (
              <div
                key={`${stake}-${idx}`}
                role="listitem"
                className="group relative flex items-center justify-between py-2 px-3 transition-colors hover:bg-indigo-50/70 dark:hover:bg-indigo-900/40"
              >
                <span className="absolute left-0 top-0 h-full w-0.5 bg-indigo-400/80 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs text-gray-500 w-6 shrink-0">#{idx + 1}</span>
                  <div className="min-w-0">
                    <div
                      className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate cursor-pointer select-none hover:text-indigo-600 dark:hover:text-indigo-400"
                      title={stake}
                      onClick={() => stake && copyStakeAddress(stake)}
                    >
                      {shorten(stake)}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                      <span>Power: {formatAda(power)}</span>
                      {controlled && <span>Controlled: {formatAda(controlled)}</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


