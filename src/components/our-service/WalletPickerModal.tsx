"use client";

import React from "react";
import Image from "next/image";

type WalletOption = { key: string; name: string; img: string };

const WALLET_OPTIONS: WalletOption[] = [
  { key: "lace", name: "Lace", img: "lace" },
  { key: "yoroi", name: "Yoroi", img: "yoroi" },
  { key: "eternl", name: "Eternl", img: "eternal" },
  { key: "nami", name: "Nami", img: "nami" },
  { key: "gerowallet", name: "Gero", img: "Gero" },
  { key: "nufi", name: "NuFi", img: "nufi" },
  { key: "typhoncip30", name: "Typhon", img: "typhon" },
];

export default function WalletPickerModal({
  open,
  onClose,
  onSelect,
  isInstalled,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (key: string) => void;
  isInstalled: (key: string) => boolean;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 w-full max-w-md border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-2">
          <h4 className="text-base font-semibold text-gray-900 dark:text-white">Choose a wallet</h4>
          <button
            onClick={onClose}
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
          {WALLET_OPTIONS.map((w) => {
            const installed = isInstalled(w.key);
            return (
              <button
                key={w.key}
                disabled={!installed}
                onClick={() => onSelect(w.key)}
                className={`w-full p-3 rounded-lg border transition-all duration-200 flex items-center gap-3 text-sm ${
                  installed
                    ? "border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm dark:border-white/10 dark:bg-gray-900 dark:hover:bg-gray-800 dark:hover:border-white/20"
                    : "border-gray-100 bg-gray-50 cursor-not-allowed opacity-60 dark:border-white/5 dark:bg-gray-900/40"
                }`}
              >
                <Image src={`/images/wallets/${w.img}.png`} alt={w.name} width={28} height={28} className="w-7 h-7" />
                <span className={`font-medium ${installed ? "text-gray-800 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}`}>{w.name}</span>
                {!installed && (
                  <span className="ml-auto text-xs bg-gray-400 text-white px-2 py-1 rounded-full dark:bg-gray-600">Not installed</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}


