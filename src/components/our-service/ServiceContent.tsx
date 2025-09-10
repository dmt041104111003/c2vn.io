"use client";

import React from "react";
import { useToastContext } from "~/components/toast-provider";
import { Lucid, Blockfrost } from "lucid-cardano";
import * as CardanoWasm from "@emurgo/cardano-serialization-lib-asmjs";
import { cardanoWallet } from "~/lib/cardano-wallet";

const BLOCKFROST_API = "https://cardano-mainnet.blockfrost.io/api/v0";
const BLOCKFROST_KEY = process.env.NEXT_PUBLIC_BLOCKFROST_KEY!;

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


export default function ServiceContent() {
  const { showSuccess, showError, showInfo } = useToastContext();
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
        // ================= DRep via Blockfrost =================
        if (!BLOCKFROST_KEY) {
          throw new Error("Missing NEXT_PUBLIC_BLOCKFROST_KEY env var");
        }
        const drepEndpoint = `${BLOCKFROST_API}/governance/dreps/${DREP_BECH32}`;
        const drepResp = await fetch(drepEndpoint, { headers: { project_id: BLOCKFROST_KEY } });
        const contentType = drepResp.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const drepJson = await drepResp.json();
          console.log("DRep JSON:", drepJson);
          if (!drepResp.ok) {
            throw new Error(`DRep HTTP ${drepResp.status}`);
          }
          if (drepJson && typeof drepJson === "object") {
            if (drepJson.active) {
              setDrepStatus("Active");
            } else if (drepJson.retired) {
              setDrepStatus("Retired");
            } else if (drepJson.expired) {
              setDrepStatus("Expired");
            } else {
              setDrepStatus("Inactive");
            }

            if (drepJson.amount != null) {
              const vpNum = Number(drepJson.amount) / 1_000_000;
              if (Number.isFinite(vpNum)) {
                setVotingPower(`₳ ${vpNum.toLocaleString()}`);
              } else {
                setVotingPower(String(drepJson.amount));
              }
            }
          }
        } else {
          const _text = await drepResp.text();
          if (!drepResp.ok) throw new Error(`DRep HTTP ${drepResp.status}`);
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



  async function delegateToDRep(drepId: string) {
    try {
      const walletProvider = getSelectedWalletProvider();
      const walletApi = await walletProvider.enable();
      const hexToBytes = (hex: string): Uint8Array => {
        const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
        const bytes = new Uint8Array(clean.length / 2);
        for (let i = 0; i < bytes.length; i++) {
          bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
        }
        return bytes;
      };
      const bytesToHex = (bytes: Uint8Array): string =>
        Array.from(bytes)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");


      const rewardAddrHex: string | undefined = (await walletApi.getRewardAddresses())?.[0];
      if (!rewardAddrHex) throw new Error("Wallet has no reward (staking) address");

      const rewardAddr = CardanoWasm.Address.from_bytes(hexToBytes(rewardAddrHex));
      const reward = CardanoWasm.RewardAddress.from_address(rewardAddr);
      if (!reward) throw new Error("Invalid reward address");
      const stakeCred = reward.payment_cred();
      const drep = CardanoWasm.DRep.from_bech32(drepId);
      const cert = CardanoWasm.Certificate.new_vote_delegation(
        CardanoWasm.VoteDelegation.new(stakeCred, drep)
      );
      const ppRes = await fetch(`${BLOCKFROST_API}/epochs/latest/parameters`, {
        headers: { project_id: BLOCKFROST_KEY },
      });
      if (!ppRes.ok) throw new Error(`Params HTTP ${ppRes.status}`);
      const protocolParams = await ppRes.json();

      const minFeeA = CardanoWasm.BigNum.from_str(String(protocolParams.min_fee_a));
      const minFeeB = CardanoWasm.BigNum.from_str(String(protocolParams.min_fee_b));
      const linearFee = CardanoWasm.LinearFee.new(minFeeA, minFeeB);

      const coinsPerUtxoByteStr = String(
        protocolParams.coins_per_utxo_byte ??
        (protocolParams.coins_per_utxo_word ? Math.floor(Number(protocolParams.coins_per_utxo_word) / 8) : 0)
      );

      const builderCfg = CardanoWasm.TransactionBuilderConfigBuilder.new()
        .fee_algo(linearFee)
        .coins_per_utxo_byte(CardanoWasm.BigNum.from_str(coinsPerUtxoByteStr))
        .pool_deposit(CardanoWasm.BigNum.from_str(String(protocolParams.pool_deposit ?? 0)))
        .key_deposit(CardanoWasm.BigNum.from_str(String(protocolParams.key_deposit ?? 0)))
        .max_tx_size(Number(protocolParams.max_tx_size ?? 16384))
        .max_value_size(Number(protocolParams.max_value_size ?? 5000))
        .build();

      const txBuilder: any = CardanoWasm.TransactionBuilder.new(builderCfg);
      const utxosHex: string[] = await walletApi.getUtxos();
      const utxos = utxosHex.map((u) => CardanoWasm.TransactionUnspentOutput.from_bytes(hexToBytes(u)));
      
      // Build UTXO set
      const utxoSet = CardanoWasm.TransactionUnspentOutputs.new();
      utxos.forEach((u) => utxoSet.add(u));
      
      // Let CSL choose inputs
      txBuilder.add_inputs_from(
        utxoSet,
        CardanoWasm.CoinSelectionStrategyCIP2.LargestFirst
      );
      const certs = CardanoWasm.Certificates.new();
      certs.add(cert);
      txBuilder.set_certs(certs);
      const changeAddrHex: string = await walletApi.getChangeAddress();
      const changeAddr = CardanoWasm.Address.from_bytes(hexToBytes(changeAddrHex));
      txBuilder.add_change_if_needed(changeAddr);
      const txBody = txBuilder.build();
      const tx = CardanoWasm.Transaction.new(
        txBody,
        CardanoWasm.TransactionWitnessSet.new()
      );
      const txHex = bytesToHex(tx.to_bytes());

      const signedTx = await walletApi.signTx(txHex, true);
      const txHash = await walletApi.submitTx(signedTx);

      showSuccess("Delegated to DRep", `DRep: ${drepId}\nTx: ${txHash}`);
    } catch (err) {
      console.error(err);
      showError("Delegation to DRep failed", (err as Error).message);
    }
  }

  async function delegateToPool(poolId: string) {
    try {
      const walletProvider = getSelectedWalletProvider();
      const walletApi = await walletProvider.enable();

      const lucid = await Lucid.new(
        new Blockfrost(BLOCKFROST_API, BLOCKFROST_KEY),
        "Mainnet"
      );

      lucid.selectWallet(walletApi);

      const rewardAddress = await lucid.wallet.rewardAddress();
      if (!rewardAddress) {
        throw new Error("Wallet has no reward address (no staking key). Please use a staking-capable account.");
      }

      const tx = await lucid
        .newTx()
        .delegateTo(rewardAddress, poolId)
        .complete();

      const signedTx = await tx.sign().complete();
      const txHash = await signedTx.submit();

      showSuccess("Delegated to pool", `Pool: ${poolId}\nTx: ${txHash}`);
    } catch (err) {
      console.error(err);
      showError("Delegation failed", (err as Error).message);
    }
  }

  function shortenId(id: string): string {
    if (!id) return "";
    if (id.length <= 20) return id;
    return `${id.slice(0, 12)}…${id.slice(-8)}`;
  }

  async function copyPoolId(id: string) {
    try {
      await navigator.clipboard.writeText(id);
      showSuccess("Copied pool ID", id);
    } catch (err) {
      showError("Copy failed", (err as Error).message);
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
          <p
            className="text-sm break-all text-gray-700 dark:text-gray-300 cursor-pointer select-none"
            title={DREP_BECH32}
            onClick={() => copyPoolId(DREP_BECH32)}
          >
            {shortenId(DREP_BECH32)}
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
                <p
                  className="text-sm break-all text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                  title={poolId}
                  onClick={() => copyPoolId(poolId)}
                >
                  {shortenId(poolId)}
                </p>
                <p className="mt-2">
                  Delegators: {loading ? "…" : info.delegators ?? 0}
                </p>
                <p>Lifetime Blocks: {loading ? "…" : info.blocks ?? 0}</p>
                <p>Live Stake: {loading ? "…" : info.stake ?? "-"}</p>
                <p>Pledge: {loading ? "…" : info.pledge ?? "-"}</p>
                <button
                  onClick={() => delegateToPool(poolId)}
                  className="mt-3 px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Delegate to {info.ticker}
                </button>
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