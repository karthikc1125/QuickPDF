import React, { useState } from "react";
import { Minimize2, Download, Loader2, Zap, ShieldCheck, Gauge, Flame, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../components/ui/Button";
import { compressWithQuality } from "../../services/pdf.service";
import { Dropzone } from "../../components/pdf/Dropzone";
import { formatFileSize } from "../../utils/formatters";

export function Compress() {
  const [file, setFile] = useState(null);
  const [level, setLevel] = useState("recommended"); // low, recommended, extreme
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const options = [
    { id: "low", label: "High Quality", desc: "90% Quality", icon: <ShieldCheck />, val: 0.9 },
    { id: "recommended", label: "Balanced", desc: "60% Quality", icon: <Gauge />, val: 0.6 },
    { id: "extreme", label: "Extreme", desc: "30% Quality", icon: <Flame />, val: 0.3 },
  ];

  const handleCompress = async () => {
  if (file.size > 50 * 1024 * 1024) {
    // Alert the user for very large files
    console.log("Large file detected, switching to Deep Scan mode...");
  }

  setIsProcessing(true);
  try {
    // We call the new Large PDF logic
    const blob = await compressLargePdf(file);
    
    // If the browser couldn't shrink it (already optimized), 
    // we show a helpful message.
    const savings = Math.round(((file.size - blob.size) / file.size) * 100);
    
    setResult({
      blob,
      size: blob.size,
      savings: savings > 0 ? savings : 0
    });
  } catch (err) {
    alert("This file is too large for the browser's memory. Try a smaller version.");
  } finally {
    setIsProcessing(false);
  }
};

  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-black text-white mb-4 tracking-tighter uppercase italic">Optimizer</h1>
        <p className="text-zinc-500 text-lg">Trade quality for portability. 100% private.</p>
      </div>

      {!file ? (
        <Dropzone onFilesSelected={(f) => setFile(f[0])} multiple={false} />
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Settings Side */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold mb-6">Compression Strategy</p>
              <div className="grid gap-4">
                {options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setLevel(opt.id)}
                    className={`flex items-center gap-5 p-5 rounded-2xl border transition-all ${
                      level === opt.id ? 'bg-white border-white text-black shadow-[0_0_30px_rgba(255,255,255,0.1)]' : 'bg-transparent border-white/5 text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${level === opt.id ? 'bg-black text-white' : 'bg-white/5'}`}>
                      {React.cloneElement(opt.icon, { size: 24 })}
                    </div>
                    <div className="text-left">
                      <p className="font-black uppercase text-sm tracking-tight">{opt.label}</p>
                      <p className="text-xs opacity-60 font-medium">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleCompress} disabled={isProcessing} className="w-full h-20 text-xl font-black rounded-[1.5rem] bg-white text-black">
              {isProcessing ? <Loader2 className="animate-spin mr-3" /> : <Zap className="mr-3 fill-current" />}
              {isProcessing ? "SHRINKING BYTES..." : "START COMPRESSION"}
            </Button>
          </div>

          {/* Stats Side */}
          <div className="space-y-6">
            <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-8 backdrop-blur-md">
              <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-6 font-bold">Source File</p>
              <h3 className="text-white font-bold truncate mb-2">{file.name}</h3>
              <p className="text-4xl font-black text-white">{formatFileSize(file.size)}</p>
              <button onClick={() => {setFile(null); setResult(null);}} className="mt-6 text-xs text-zinc-500 hover:text-white underline underline-offset-4">Change File</button>
            </div>

            <AnimatePresence>
              {result && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-emerald-500 rounded-[2rem] p-8 text-black shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                  <p className="text-[10px] uppercase tracking-widest font-black mb-2 opacity-60">Result</p>
                  <p className="text-6xl font-black mb-2 tracking-tighter">-{result.savings}%</p>
                  <p className="text-sm font-bold opacity-80 mb-8">New size: {formatFileSize(result.size)}</p>
                  <Button onClick={() => {
                    const url = URL.createObjectURL(result.blob);
                    const a = document.createElement('a'); a.href = url; a.download = `optimized_${file.name}`; a.click();
                  }} className="w-full h-14 bg-black text-white hover:bg-zinc-900 rounded-xl font-bold">
                    DOWNLOAD
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}