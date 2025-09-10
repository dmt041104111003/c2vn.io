"use client";

import React from "react";
import { Lucid, Blockfrost } from "lucid-cardano";
import { cardanoWallet } from "~/lib/cardano-wallet";

const BLOCKFROST_API = "https://cardano-mainnet.blockfrost.io/api/v0";
const BLOCKFROST_KEY = process.env.NEXT_PUBLIC_BLOCKFROST_KEY!;

const KOIOS_API = "https://api.koios.rest/api/v1";

// C2VN DRep
const DREP_BECH32 =
  "drep1ygqlu72zwxszcx0kqdzst4k3g6fxx4klwcmpk0fcuujskvg3pmhgs";

// Stake pools
const VILAI_POOL = "pool1u7zrgexnxsysctnnwljjjymr70he829fr5n3vefnv80guxr42dv";
const HADA_POOL = "pool16rcqtg9gywenzkp6t5qg8um5tuul6d4dzwauppz7z3ufyaj0ky3";

type PoolInfo = { ticker: string; delegators: number | null; blocks: number | null };

export default function ServiceContent() {
  const [loading, setLoading] = React.useState(true);
  const [drepStatus, setDrepStatus] = React.useState<string>("Unknown");
  const [votingPower, setVotingPower] = React.useState<string>("-");
  const [pools, setPools] = React.useState<Record<string, PoolInfo>>({});

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const drepRes = await fetch(`${KOIOS_API}/drep_info`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ drep_bech32_ids: [DREP_BECH32] }),
        });
        if (drepRes.ok) {
          const drepJson = await drepRes.json();
          if (Array.isArray(drepJson) && drepJson.length > 0) {
            setDrepStatus(drepJson[0].status ?? "Unknown");
          }
        }

        const vpRes = await fetch(`${KOIOS_API}/drep_voting_power_history`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ drep_bech32_ids: [DREP_BECH32], limit: 1 }),
        });
        if (vpRes.ok) {
          const vpJson = await vpRes.json();
          if (Array.isArray(vpJson) && vpJson.length > 0) {
            const vp = vpJson[0].voting_power;
            setVotingPower(vp ? `₳ ${Number(vp).toLocaleString()}` : "-");
          }
        }

        async function getDelegators(poolId: string) {
          const res = await fetch(`${BLOCKFROST_API}/pools/${poolId}/delegators`, {
            headers: { project_id: BLOCKFROST_KEY },
          });
          return res.ok ? (await res.json()).length : null;
        }

        async function getBlocks(poolId: string) {
          const res = await fetch(`${BLOCKFROST_API}/pools/${poolId}/blocks`, {
            headers: { project_id: BLOCKFROST_KEY },
          });
          return res.ok ? (await res.json()).length : null;
        }

        const vilaiDelegators = await getDelegators(VILAI_POOL);
        const vilaiBlocks = await getBlocks(VILAI_POOL);

        const hadaDelegators = await getDelegators(HADA_POOL);
        const hadaBlocks = await getBlocks(HADA_POOL);

        setPools({
          [VILAI_POOL]: { ticker: "VILAI", delegators: vilaiDelegators, blocks: vilaiBlocks },
          [HADA_POOL]: { ticker: "HADA", delegators: hadaDelegators, blocks: hadaBlocks },
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- Delegate functions ---
  function getSelectedWalletProvider(): any {
    const injected: any = (typeof window !== "undefined" && (window as any).cardano) || null;
    if (!injected) throw new Error("No Cardano wallet detected in browser");

    const currentName = cardanoWallet.getCurrentWalletName?.();
    const candidateOrder: string[] = [];
    if (currentName) candidateOrder.push(currentName);

    const preferredAliases = [
      "eternl",
      "eternal",
      "nami",
      "lace",
      "yoroi",
      "gerowallet",
      "gero",
      "nufi",
      "typhoncip30",
      "typhon",
    ];
    for (const k of preferredAliases) if (!candidateOrder.includes(k)) candidateOrder.push(k);

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

  async function delegateToPool(poolId: string) {
    try {
      const lucid = await Lucid.new(
        new Blockfrost("https://cardano-mainnet.blockfrost.io/api/v0", BLOCKFROST_KEY),
        "Mainnet"
      );

      const provider = getSelectedWalletProvider();
      const api = await provider.enable();
      await lucid.selectWallet(api);

      const stakeAddress = await lucid.wallet.rewardAddress();

      const tx = await lucid.newTx().delegateTo(stakeAddress!, poolId).complete();
      const signedTx = await tx.sign().complete();
      const txHash = await signedTx.submit();

      alert(`Delegated to pool! TxHash: ${txHash}`);
    } catch (err) {
      console.error(err);
      alert("Delegation failed: " + (err as Error).message);
    }
  }

  async function delegateToDRep(drepId: string) {
    try {
      const lucid = await Lucid.new(
        new Blockfrost("https://cardano-mainnet.blockfrost.io/api/v0", BLOCKFROST_KEY),
        "Mainnet"
      );

      const provider = getSelectedWalletProvider();
      const api = await provider.enable();
      await lucid.selectWallet(api);

      const stakeAddress = await lucid.wallet.rewardAddress();

      const txBuilder = lucid.newTx() as any;
      const builder = typeof txBuilder.delegateToDRep === "function"
        ? txBuilder.delegateToDRep(stakeAddress!, drepId)
        : txBuilder.delegateTo(stakeAddress!, drepId);
      const tx = await builder.complete();
      const signedTx = await tx.sign().complete();
      const txHash = await signedTx.submit();

      alert(`Delegated to DRep! TxHash: ${txHash}`);
    } catch (err) {
      console.error(err);
      alert("Delegation to DRep failed: " + (err as Error).message);
    }
  }

  // --- Render UI ---
  return (
    <div className="w-full px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* DRep card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-center text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Our DREP: C2VN
          </h3>
          <p className="font-semibold">DRep ID:</p>
          <p className="break-all text-gray-700 dark:text-gray-300">{DREP_BECH32}</p>
          <p className="mt-3 font-semibold">Status:</p>
          <p className="text-gray-700 dark:text-gray-300">{loading ? "…" : drepStatus}</p>
          <p className="mt-3 font-semibold">Voting Power:</p>
          <p className="text-gray-700 dark:text-gray-300">{loading ? "…" : votingPower}</p>

          <button
            onClick={() => delegateToDRep(DREP_BECH32)}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Delegate to DRep
          </button>
        </div>

        {/* Pool cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(pools).map(([poolId, info]) => (
            <div
              key={poolId}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {info.ticker}
              </h3>
              <p>Pool ID:</p>
              <p className="text-sm break-all text-gray-700 dark:text-gray-300">{poolId}</p>
              <p className="mt-2">Delegators: {loading ? "…" : info.delegators ?? "-"}</p>
              <p>Lifetime Blocks: {loading ? "…" : info.blocks ?? "-"}</p>
              <button
                onClick={() => delegateToPool(poolId)}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                Delegate to Pool
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
