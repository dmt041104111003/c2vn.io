"use client";

import React from "react";
import Image from "next/image";
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
  const [walletPicker, setWalletPicker] = React.useState<{
    open: boolean;
    action: null | { type: "drep"; id: string } | { type: "pool"; id: string };
  }>({ open: false, action: null });

  function isWalletInstalledByKey(key: string): boolean {
    const injected: any = (typeof window !== "undefined" && (window as any).cardano) || null;
    if (!injected) return false;
    return Object.keys(injected).some((k) => k.toLowerCase() === key.toLowerCase());
  }

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
            return null;
          }
          const data = await res.json();
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
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  function getSelectedWalletProvider(preferredKey?: string): any {
    const injected: any =
      (typeof window !== "undefined" && (window as any).cardano) || null;
    if (!injected) throw new Error("No Cardano wallet detected");
    if (preferredKey) {
      const hit = Object.keys(injected).find((k) => k.toLowerCase() === preferredKey.toLowerCase());
      if (hit) return injected[hit];
    }

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



  async function delegateToDRep(drepId: string, preferredKey?: string) {
    try {
      const walletProvider = getSelectedWalletProvider(preferredKey);
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
      const error = err as Error;
      if (error.message.includes("No Cardano wallet detected")) {
        showError("No wallet found", "Please install a Cardano wallet (Eternl, Nami, Lace) and refresh the page.");
      } else if (error.message.includes("reward address")) {
        showError("Staking key missing", "Your wallet doesn't have a staking key. Please use a staking-capable account.");
      } else if (error.message.includes("protocol parameters")) {
        showError("Network error", "Failed to fetch Cardano network parameters. Check your internet connection.");
      } else if (error.message.includes("UTXOs")) {
        showError("Wallet empty", "Your wallet has no UTXOs to spend. Please add some ADA to your wallet.");
      } else if (error.message.includes("signTx")) {
        showError("Transaction rejected", "You rejected the transaction or signing failed. Please try again.");
      } else if (error.message.includes("submitTx")) {
        showError("Transaction failed", "Transaction was rejected by the network. Check your wallet balance and try again.");
      } else {
        showError("DRep delegation failed", `Error: ${error.message}`);
      }
    }
  }

  async function delegateToPool(poolId: string, preferredKey?: string) {
    try {
      const walletProvider = getSelectedWalletProvider(preferredKey);
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
      const error = err as Error;
      if (error.message.includes("No Cardano wallet detected")) {
        showError("No wallet found", "Please install a Cardano wallet (Eternl, Nami, Lace) and refresh the page.");
      } else if (error.message.includes("reward address")) {
        showError("Staking key missing", "Your wallet doesn't have a staking key. Please use a staking-capable account.");
      } else if (error.message.includes("Blockfrost")) {
        showError("Network error", "Failed to connect to Cardano network. Check your internet connection.");
      } else if (error.message.includes("signTx")) {
        showError("Transaction rejected", "You rejected the transaction or signing failed. Please try again.");
      } else if (error.message.includes("submitTx")) {
        showError("Transaction failed", "Transaction was rejected by the network. Check your wallet balance and try again.");
      } else {
        showError("Pool delegation failed", `Error: ${error.message}`);
      }
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
      showSuccess("Copied ID", shortenId(id));
    } catch (err) {
      const error = err as Error;
      if (error.name === 'NotAllowedError') {
        showError("Copy blocked", "Browser blocked clipboard access. Please allow clipboard permissions.");
      } else if (error.name === 'NotFoundError') {
        showError("Clipboard unavailable", "Clipboard API not supported in this browser.");
      } else {
        showError("Copy failed", `Unable to copy: ${error.message}`);
      }
    }
  }

  return (
    <div className="w-full px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <div className="font-semibold">Failed to load data</div>
            <div className="text-sm mt-1">
              {error.includes("Missing NEXT_PUBLIC_BLOCKFROST_KEY") 
                ? "Blockfrost API key is missing. Please check your environment configuration."
                : error.includes("CORS") || error.includes("fetch")
                ? "Network error: Unable to connect to Blockfrost API. This might be a CORS issue or network problem."
                : error.includes("404")
                ? "API endpoint not found. The requested data might not be available."
                : `Error: ${error}`
              }
            </div>
            <div className="text-xs mt-2 opacity-75">Check browser console for technical details.</div>
          </div>
        )}
        {loading && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto mb-6 animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
              </div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 mt-4 animate-pulse"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-3 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                  </div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 mt-3 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-center text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Our DREP: C2VN
          </h3>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Wallet Compatibility Notice
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  <strong>Cardano wallets only:</strong> DRep and pool delegation only work with Cardano wallets. 
                  We recommend <strong>Eternl</strong>, <strong>Lace</strong>, or <strong>Yoroi</strong> for the best experience.
                  <br />
                  <span className="text-amber-600 dark:text-amber-400">
                    MetaMask and other non-Cardano wallets are not supported for delegation.
                  </span>
                </p>
              </div>
            </div>
          </div>
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
            onClick={() => setWalletPicker({ open: true, action: { type: "drep", id: DREP_BECH32 } })}
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
                  onClick={() => setWalletPicker({ open: true, action: { type: "pool", id: poolId } })}
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

        {walletPicker.open && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={() => setWalletPicker({ open: false, action: null })}
          >
            <div
              className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 w-full max-w-md border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-base font-semibold text-gray-900 dark:text-white">Choose a wallet</h4>
                <button
                  onClick={() => setWalletPicker({ open: false, action: null })}
                  aria-label="Close"
                  className="absolute"
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '3.2em',
                    height: '3.2em',
                    border: 'none',
                    background: 'rgba(180, 83, 107, 0.11)',
                    borderRadius: '6px',
                    transition: 'background 0.3s',
                    zIndex: 10,
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '1.8em',
                      height: '1.5px',
                      backgroundColor: 'rgb(255, 255, 255)',
                      transform: 'translate(-50%, -50%) rotate(45deg)',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '1.8em',
                      height: '1.5px',
                      backgroundColor: '#fff',
                      transform: 'translate(-50%, -50%) rotate(-45deg)',
                    }}
                  />
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Recommended: Lace, Yoroi, or Eternl.</p>
              <div className="space-y-2">
                {([
                  { key: "lace", name: "Lace", img: "lace" },
                  { key: "yoroi", name: "Yoroi", img: "yoroi" },
                  { key: "eternl", name: "Eternl", img: "eternal" },
                  { key: "nami", name: "Nami", img: "nami" },
                  { key: "gerowallet", name: "Gero", img: "Gero" },
                  { key: "nufi", name: "NuFi", img: "nufi" },
                  { key: "typhoncip30", name: "Typhon", img: "typhon" },
                ] as const).map((w) => (
                  (() => {
                    const installed = isWalletInstalledByKey(w.key);
                    return (
                      <button
                        key={w.key}
                        disabled={!installed}
                        onClick={async () => {
                          try {
                            const sel = walletPicker.action;
                            setWalletPicker({ open: false, action: null });
                            if (!sel) return;
                            if (sel.type === "drep") await delegateToDRep(sel.id, w.key);
                            else await delegateToPool(sel.id, w.key);
                          } catch (err) {
                            showError("Wallet selection failed", (err as Error).message);
                          }
                        }}
                        className={`w-full p-3 rounded-lg border transition-all duration-200 flex items-center gap-3 text-sm ${
                          installed
                            ? "border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm dark:border-white/10 dark:bg-gray-900 dark:hover:bg-gray-800 dark:hover:border-white/20"
                            : "border-gray-100 bg-gray-50 cursor-not-allowed opacity-60 dark:border-white/5 dark:bg-gray-900/40"
                        }`}
                      >
                        <Image
                          src={`/images/wallets/${w.img}.png`}
                          alt={w.name}
                          width={28}
                          height={28}
                          className="w-7 h-7"
                        />
                        <span className={`font-medium ${installed ? "text-gray-800 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}`}>
                          {w.name}
                        </span>
                        {!installed && (
                          <span className="ml-auto text-xs bg-gray-400 text-white px-2 py-1 rounded-full dark:bg-gray-600">
                            Not installed
                          </span>
                        )}
                      </button>
                    );
                  })()
                ))}
              </div>
             
            </div>
          </div>
        )}
      </div>
    </div>
  );
}