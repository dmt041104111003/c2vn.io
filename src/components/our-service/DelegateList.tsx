"use client";

import React from "react";
import { useToastContext } from "~/components/toast-provider";

const BLOCKFROST_API = "https://cardano-mainnet.blockfrost.io/api/v0";
const BLOCKFROST_KEY = process.env.NEXT_PUBLIC_BLOCKFROST_KEY!;

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
        if (!BLOCKFROST_KEY) throw new Error("Missing NEXT_PUBLIC_BLOCKFROST_KEY env var");
        const basePath = drepId
          ? `/governance/dreps/${drepId}/delegators`
          : poolId
          ? `/pools/${poolId}/delegators`
          : null;
        if (!basePath) throw new Error("Missing drepId or poolId");
        const url = new URL(`${BLOCKFROST_API}${basePath}`);
        url.searchParams.set("order", "desc");
        url.searchParams.set("count", "5");
        url.searchParams.set("page", "1");
        const res = await fetch(url.toString(), { headers: { project_id: BLOCKFROST_KEY } });
        if (!res.ok) throw new Error(`Delegators HTTP ${res.status}`);
        const data = await res.json();
        const baseList: DelegatorItem[] = Array.isArray(data) ? data.slice(0, 5) : [];
        const withDetails = await Promise.all(
          baseList.map(async (d) => {
            const addr = (d as any).stake_address || (d as any).address;
            let details: AccountInfo | null = null;
            try {
              if (addr) {
                const a = await fetch(`${BLOCKFROST_API}/accounts/${addr}`, { headers: { project_id: BLOCKFROST_KEY } });
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
    ? `https://cardanoscan.io/drep/${encodeURIComponent(drepId)}`
    : poolId
    ? `https://cardanoscan.io/pool/${encodeURIComponent(poolId as string)}`
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
            <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          ))}
        </div>
      ) : delegators.length === 0 ? (
        <p className="text-sm text-gray-500">No recent delegators found.</p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          {delegators.map((d: any, idx) => {
            const stake = d.stake_address ?? d.address ?? "";
            const power = (d as any).voting_power ?? (d as any).amount ?? (d as any).live_stake;
            const detailHref = explorerUrl;
            const active = d.__details?.active;
            const controlled = d.__details?.controlled_amount;
            return (
              <li key={`${stake}-${idx}`} className="flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-900">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs text-gray-500 w-6 shrink-0">#{idx + 1}</span>
                  <div className="min-w-0">
                    <div
                      className="text-sm text-gray-900 dark:text-gray-100 truncate cursor-pointer select-none"
                      title={stake}
                      onClick={() => stake && copyStakeAddress(stake)}
                    >
                      {shorten(stake)}
                    </div>
                    <div className="text-xs text-gray-500">Power: {formatAda(power)}</div>
                    {controlled && (
                      <div className="text-xs text-gray-500">Controlled: {formatAda(controlled)}</div>
                    )}
                    {active != null && (
                      <div className="text-[11px] text-gray-500">Status: {active ? "Active" : "Inactive"}</div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}


