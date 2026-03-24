import React, { useState } from "react";
import { Lock, Wallet } from "lucide-react";
import { PaywallModal } from "./PaywallModal";

export function UpgradeButton({ reason = "size", limitLabel, isWalletConnected = false, isPremium = false, className = "" }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={[
          "inline-flex items-center justify-center gap-3",
          "font-bold tracking-wide transition-all duration-200",
          "bg-zinc-900 border border-white/10 text-white",
          "hover:bg-zinc-800 hover:border-white/25",
          "focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black",
          "rounded-2xl cursor-pointer px-5 h-11",
          className,
        ].join(" ")}
      >
        {isWalletConnected ? <Lock className="w-5 h-5 text-zinc-400" /> : <Wallet className="w-5 h-5 text-zinc-400" />}
        <span>{isWalletConnected ? "Upgrade to Premium" : "Connect Wallet to Unlock"}</span>
      </button>

      <PaywallModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        reason={reason}
        limitLabel={limitLabel}
        isPremium={isPremium}
      />
    </>
  );
}
