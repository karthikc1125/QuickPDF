import React, { useState } from "react";
import { RotateCw, RotateCcw, Download, Loader2, FileText, RefreshCw, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button }         from "../../components/ui/Button";
import { UpgradeButton }  from "../../components/ui/UpgradeButton";
import { rotatePdf }      from "../../services/pdf.service";
import { Dropzone }       from "../../components/pdf/Dropzone";
import { formatFileSize } from "../../utils/formatters";
import { useSubscription }       from "../../hooks/useSubscription";
import { FREE_LIMITS, mbToBytes } from "../../config/limits";

export function Rotate() {
  const [file, setFile]             = useState(null);
  const [rotation, setRotation]     = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // ── Subscription state ──────────────────────────────────────────────────
  const {
    isPremium,
    isWalletConnected: isConnected,
    hasReachedGlobalLimit,
    incrementUsage,
  } = useSubscription();

  const ROTATE_LIMIT_MB = FREE_LIMITS.rotate.maxFileSizeMb;

  // Gate checks (ignored for premium users)
  const isOverSizeLimit =
    !isPremium && !!file && file.size > mbToBytes(ROTATE_LIMIT_MB);

  const isLocked = !isPremium && (isOverSizeLimit || hasReachedGlobalLimit);

  const paywallReason = hasReachedGlobalLimit ? "global" : "size";

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleRotateRight = () => setRotation((p) => p + 90);
  const handleRotateLeft  = () => setRotation((p) => p - 90);

  const handleApplyAndDownload = async () => {
    if (rotation % 360 === 0) return alert("Please rotate the document first.");

    setIsProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      const blob = await rotatePdf(file, rotation);

      const url = URL.createObjectURL(blob);
      const a   = document.createElement("a");
      a.href     = url;
      a.download = `rotated_${file.name}`;
      a.click();
      URL.revokeObjectURL(url);

      // ✅ Track: updates Firestore (connected) or localStorage (anonymous)
      await incrementUsage();

      setRotation(0);
    } catch (err) {
      console.error(err);
      alert("Failed to rotate the document. It might be encrypted.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white text-black mb-6 shadow-[0_0_50px_rgba(255,255,255,0.15)]"
        >
          <RefreshCw className="w-10 h-10" />
        </motion.div>
        <h1 className="text-5xl font-black text-white mb-4 tracking-tighter uppercase">Rotate PDF</h1>
        <p className="text-zinc-500 text-lg font-light max-w-md mx-auto">
          Fix upside-down scans instantly. Processed securely in your browser.
        </p>

        {/* Global cap banner */}
        <AnimatePresence>
          {hasReachedGlobalLimit && !isPremium && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-6 inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 text-sm"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <span className="font-semibold text-white">15 free actions used.</span>
                {" "}Connect your wallet to keep going.
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative">
        {!file ? (
          <Dropzone onFilesSelected={(f) => setFile(f[0])} multiple={false} text="Drop PDF to rotate" />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl"
          >
            {/* Inline size warning */}
            <AnimatePresence>
              {isOverSizeLimit && !isPremium && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="flex items-start gap-3 px-4 py-3.5 bg-zinc-900 border border-white/10 rounded-2xl text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-white">
                        File exceeds {ROTATE_LIMIT_MB} MB free limit.
                      </span>{" "}
                      <span className="text-zinc-400">
                        Your file is {formatFileSize(file.size)}. Upgrade to unlock unlimited sizes.
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* PDF visualiser */}
            <div className="flex flex-col items-center justify-center py-10 border border-white/5 rounded-3xl bg-zinc-900/30 mb-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_100%)]" />
              <motion.div
                animate={{ rotate: rotation }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-32 h-40 bg-white rounded-xl shadow-2xl flex flex-col items-center justify-center p-4 border-4 border-zinc-800"
              >
                <FileText className="w-12 h-12 text-zinc-300 mb-2" />
                <div className="w-full h-2 bg-zinc-200 rounded-full mb-2" />
                <div className="w-3/4 h-2 bg-zinc-200 rounded-full mb-2" />
                <div className="w-5/6 h-2 bg-zinc-200 rounded-full" />
              </motion.div>
              <div className="mt-8 px-6 py-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10 text-white font-mono text-sm tracking-widest">
                {((rotation % 360) + 360) % 360}° DEGREES
              </div>
            </div>

            {/* Rotate controls */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <Button variant="outline" onClick={handleRotateLeft}  className="h-16 rounded-2xl border-white/10 hover:bg-white/5 hover:border-white/20 text-white group">
                <RotateCcw className="mr-3 w-5 h-5 group-hover:-rotate-45 transition-transform" />
                Turn Left
              </Button>
              <Button variant="outline" onClick={handleRotateRight} className="h-16 rounded-2xl border-white/10 hover:bg-white/5 hover:border-white/20 text-white group">
                <RotateCw className="mr-3 w-5 h-5 group-hover:rotate-45 transition-transform" />
                Turn Right
              </Button>
            </div>

            {/* ── Primary action — conditional on paywall lock ────────────── */}
            <div className="space-y-4">
              {isLocked ? (
                <UpgradeButton
                  reason={paywallReason}
                  limitLabel={`${ROTATE_LIMIT_MB} MB`}
                  isWalletConnected={isConnected}
                  isPremium={isPremium}
                  className="w-full h-20 text-xl"
                />
              ) : (
                <Button
                  onClick={handleApplyAndDownload}
                  disabled={isProcessing}
                  className="w-full h-20 text-xl font-bold rounded-2xl bg-white text-black hover:bg-zinc-200 transition-all active:scale-[0.98] shadow-xl"
                >
                  {isProcessing
                    ? <><Loader2 className="animate-spin mr-3 w-6 h-6" /> APPLYING ROTATION…</>
                    : <><Download className="mr-3 w-6 h-6" /> APPLY &amp; DOWNLOAD</>
                  }
                </Button>
              )}

              <button
                onClick={() => { setFile(null); setRotation(0); }}
                className="w-full text-center text-zinc-500 hover:text-white transition-colors text-sm font-medium underline underline-offset-4"
              >
                Cancel &amp; Upload Different File
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}