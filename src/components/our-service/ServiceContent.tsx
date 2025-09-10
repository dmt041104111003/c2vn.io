"use client";

import React from "react";
import dynamic from "next/dynamic";
import { cardanoWallet } from "~/lib/cardano-wallet";

const BLOCKFROST_API = "https://cardano-mainnet.blockfrost.io/api/v0";
const BLOCKFROST_KEY = process.env.NEXT_PUBLIC_BLOCKFROST_KEY!;
const KOIOS_PROXY = "/api/koios"; 

const DREP_BECH32 =
  "drep1ygqlu72zwxszcx0kqdzst4k3g6fxx4klwcmpk0fcuujskvg3pmhgs";
const VILAI_POOL = "pool1u7zrgexnxsysctnnwljjjymr70he829fr5n3vefnv80guxr42dv";
const HADA_POOL = "pool16rcqtg9gywenzkp6t5qg8um5tuul6d4dzwauppz7z3ufyaj0ky3";

type PoolInfo = {
  ticker: string;
  delegators: number | null;
  blocks: number | null;
  stake: string | null;
  pledge: string | null;
};


const DelegatePoolButton = dynamic(() => import("./DelegatePoolButton"), { ssr: false });

export default function ServiceContent() {
  const [loading, setLoading] = React.useState(true);
  const [drepStatus, setDrepStatus] = React.useState<string>("Not registered");
  const [votingPower, setVotingPower] = React.useState<string>("₳ 0");
  const [pools, setPools] = React.useState<Record<string, PoolInfo>>({});
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Blockfrost key loaded:", BLOCKFROST_KEY ? "Yes" : "No (check env)"); 
        const drepRes = await fetch(KOIOS_PROXY, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: "drep_info", body: { drep_ids: [DREP_BECH32] } }),
        });
        if (!drepRes.ok) {
          const errorText = await drepRes.text();
          console.error("DRep proxy error:", drepRes.status, errorText);
          throw new Error(`DRep fetch failed: ${drepRes.status} - ${errorText.substring(0, 100)}... (Check if /api/koios route exists)`);
        } else {
          const drepJson = await drepRes.json();
          console.log("DRep info:", drepJson); 
          if (Array.isArray(drepJson) && drepJson.length > 0) {
            setDrepStatus(drepJson[0].status ?? "Active");
          }
        }

        const vpRes = await fetch(KOIOS_PROXY, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: "drep_voting_power_history", body: { drep_ids: [DREP_BECH32], limit: 1 } }),
        });
        if (!vpRes.ok) {
          const errorText = await vpRes.text();
          console.error("Voting power proxy error:", vpRes.status, errorText);
          throw new Error(`Voting power fetch failed: ${vpRes.status} - ${errorText.substring(0, 100)}... (Check if /api/koios route exists)`);
        } else {
          const vpJson = await vpRes.json();
          console.log("Voting power:", vpJson); 
          if (Array.isArray(vpJson) && vpJson.length > 0) {
            const vp = vpJson[0].voting_power;
            setVotingPower(vp ? `₳ ${Number(vp).toLocaleString()}` : "₳ 0");
          }
        }

        async function getPoolInfo(poolId: string) {
          const res = await fetch(`${BLOCKFROST_API}/pools/${poolId}`, {
            headers: { project_id: BLOCKFROST_KEY },
          });
          if (!res.ok) {
            console.error(`Pool ${poolId} error:`, res.status, await res.text());
            return null;
          }
          const data = await res.json();
          console.log(`Pool ${poolId} data:`, data);
          return data;
        }

        const vilaiInfo = await getPoolInfo(VILAI_POOL);
        const hadaInfo = await getPoolInfo(HADA_POOL);

        setPools({
          [VILAI_POOL]: {
            ticker: "VILAI",
            delegators: vilaiInfo?.live_delegators ?? 0,
            blocks: vilaiInfo?.blocks_minted ?? 0,
            stake: vilaiInfo?.live_stake
              ? `₳ ${(Number(vilaiInfo.live_stake) / 1_000_000).toLocaleString()}`
              : null,
            pledge: vilaiInfo?.live_pledge
              ? `₳ ${(Number(vilaiInfo.live_pledge) / 1_000_000).toLocaleString()}`
              : null,
          },
          [HADA_POOL]: {
            ticker: "HADA",
            delegators: hadaInfo?.live_delegators ?? 0,
            blocks: hadaInfo?.blocks_minted ?? 0,
            stake: hadaInfo?.live_stake
              ? `₳ ${(Number(hadaInfo.live_stake) / 1_000_000).toLocaleString()}`
              : null,
            pledge: hadaInfo?.live_pledge
              ? `₳ ${(Number(hadaInfo.live_pledge) / 1_000_000).toLocaleString()}`
              : null,
          },
        });
      } catch (e) {
        console.error("Fetch error:", e);
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  function getSelectedWalletProvider(): any {
    const injected: any =
      (typeof window !== "undefined" && (window as any).cardano) || null;
    if (!injected) throw new Error("No Cardano wallet detected");

    const currentName = cardanoWallet.getCurrentWalletName?.();
    const candidateOrder: string[] = [];
    if (currentName) candidateOrder.push(currentName);

    const preferredAliases = [
      "eternl",
      "nami",
      "lace",
      "yoroi",
      "gerowallet",
      "nufi",
      "typhoncip30",
    ];
    for (const k of preferredAliases)
      if (!candidateOrder.includes(k)) candidateOrder.push(k);

    for (const key of candidateOrder) {
      if (injected[key]) return injected[key];
      const lower = key.toLowerCase();
      const hit = Object.keys(injected).find((k) => k.toLowerCase() === lower);
      if (hit) return injected[hit];
    }

    const firstKey = Object.keys(injected)[0];
    if (firstKey) return injected[firstKey];
    throw new Error("No compatible CIP-30 wallet provider found");
  }

  // moved into client-only component to avoid bundling lucid during SSR

  async function delegateToDRep(drepId: string) {
    try {
      alert(
        "Lucid npm does not yet support CIP-95 delegation. Please use Eternl/Lace to delegate DRep."
      );
      return;
    } catch (err) {
      console.error(err);
      alert("Delegation to DRep failed: " + (err as Error).message);
    }
  }

  return (
    <div className="w-full px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {error}. Check console for details. (CORS/Proxy issue?)
          </div>
        )}
        {loading && <p className="text-center">Loading...</p>}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-center text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Our DREP: C2VN
          </h3>
          <p className="font-semibold">DRep ID:</p>
          <p className="break-all text-gray-700 dark:text-gray-300">
            {DREP_BECH32}
          </p>
          <p className="mt-3 font-semibold">Status:</p>
          <p className="text-gray-700 dark:text-gray-300">
            {loading ? "…" : drepStatus}
          </p>
          <p className="mt-3 font-semibold">Voting Power:</p>
          <p className="text-gray-700 dark:text-gray-300">
            {loading ? "…" : votingPower}
          </p>
          <button
            onClick={() => delegateToDRep(DREP_BECH32)}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Delegate to DRep
          </button>
        </div>

        {pools && Object.keys(pools).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(pools).map(([poolId, info]) => (
              <div
                key={poolId}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {info.ticker}
                </h3>
                <p className="text-sm break-all text-gray-700 dark:text-gray-300">
                  {poolId}
                </p>
                <p className="mt-2">
                  Delegators: {loading ? "…" : info.delegators ?? 0}
                </p>
                <p>Lifetime Blocks: {loading ? "…" : info.blocks ?? 0}</p>
                <p>Live Stake: {loading ? "…" : info.stake ?? "-"}</p>
                <p>Pledge: {loading ? "…" : info.pledge ?? "-"}</p>
                <DelegatePoolButton poolId={poolId} />
              </div>
            ))}
          </div>
        ) : (
          !loading && <p className="text-center text-gray-500">No pool data available (check API key/proxy).</p>
        )}
      </div>
    </div>
  );
}