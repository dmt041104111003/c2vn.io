"use client";
import React from 'react';

type KoiosPoolInfo = {
  pool_id_bech32: string;
  ticker?: string;
  live_delegators?: number;
  block_count?: number;
};

const VILAI_POOL = "pool1u7zrgexnxsysctnnwljjjymr70he829fr5n3vefnv80guxr42dv";
const HADA_POOL = "pool16rcqtg9gywenzkp6t5qg8um5tuul6d4dzwauppz7z3ufyaj0ky3";

export default function ServiceContent() {
  const [pools, setPools] = React.useState<Record<string, KoiosPoolInfo>>({});
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const fetchPools = async () => {
      try {
        const res = await fetch("https://api.koios.rest/api/v1/pool_info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pool_bech32_ids: [VILAI_POOL, HADA_POOL] }),
        });
        if (!res.ok) throw new Error("Failed to fetch pool info");
        const data: KoiosPoolInfo[] = await res.json();
        const byId: Record<string, KoiosPoolInfo> = {};
        data.forEach((p) => {
          byId[p.pool_id_bech32] = p;
        });
        setPools(byId);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPools();
  }, []);

  return (
    <div className="w-full px-2 sm:px-4 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-center text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Our DREP: C2VN
          </h3>
          <div className="space-y-2 text-sm sm:text-base">
            <p className="text-gray-900 dark:text-white font-semibold">DRep ID:</p>
            <p className="text-gray-700 dark:text-gray-300 break-all">drep1ygqlu72zwxszcx0kqdzst4k3g6fxx4klwcmpk0fcuujskvg3pmhgs</p>
            <p className="text-gray-900 dark:text-white font-semibold mt-3">Legacy DRep ID (CIP-105):</p>
            <p className="text-gray-700 dark:text-gray-300 break-all">drep1q8l8jsn35qkpnasrg5zad52xjf34dhmkxcdn6w88y59nzyyhrdt</p>
            <div className="flex items-center gap-2 pt-4">
              <span className="text-gray-900 dark:text-white font-semibold">Status:</span>
              <span className="text-green-600 font-semibold">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-900 dark:text-white font-semibold">Voting power:</span>
              <span className="text-gray-700 dark:text-gray-300">₳ 1,205,799</span>
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <a
              href="https://sancho.network"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
              Delegate
            </a>
          </div>
        </div>

        <h4 className="text-center text-base sm:text-lg font-semibold text-gray-900 dark:text-white mt-10 mb-4">
          Our stake pools:
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-center font-semibold text-gray-900 dark:text-white">Ticker: VILAI</p>
            <div className="mt-5 space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">Pool ID:</span> {VILAI_POOL}
              </div>
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">Delegates:</span> {loading ? "…" : pools[VILAI_POOL]?.live_delegators ?? "-"}
              </div>
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">Lifetime Blocks:</span> {loading ? "…" : pools[VILAI_POOL]?.block_count ?? "-"}
              </div>
            </div>
            <div className="mt-6">
              <a
                href={`https://cardanoscan.io/pool/${VILAI_POOL}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex justify-center px-6 py-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
              >
                Delegate
              </a>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-center font-semibold text-gray-900 dark:text-white">Ticker: HADA</p>
            <div className="mt-5 space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">Pool ID:</span> {HADA_POOL}
              </div>
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">Delegates:</span> {loading ? "…" : (pools[HADA_POOL]?.live_delegators ?? "Unavailable")}
              </div>
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">Lifetime Blocks:</span> {loading ? "…" : (pools[HADA_POOL]?.block_count ?? "Unavailable")}
              </div>
            </div>
            <div className="mt-6">
              {pools[HADA_POOL] ? (
                <a
                  href={`https://cardanoscan.io/pool/${HADA_POOL}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex justify-center px-6 py-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                >
                  Delegate
                </a>
              ) : (
                <button
                  className="w-full px-6 py-3 rounded-md bg-gray-300 text-gray-600 font-semibold cursor-not-allowed"
                  aria-disabled
                  title="Pool not found or retired"
                >
                  Delegate
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-600 dark:text-gray-300 mt-10">
          If you need help, drop us a message: <a className="font-semibold text-blue-600 hover:underline" href="https://t.me/cardano2vn" target="_blank" rel="noopener noreferrer">Connect</a>
        </div>
      </div>
    </div>
  );
}
