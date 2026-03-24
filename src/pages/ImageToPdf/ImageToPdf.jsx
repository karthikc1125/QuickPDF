import React, { useState, useRef } from "react";
import { Image as ImageIcon, X, Download, Loader2, Trash2, GripVertical } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/Button";
import { UpgradeButton } from "../../components/ui/UpgradeButton";
import { Dropzone } from "../../components/pdf/Dropzone";
import { imageToPdf } from "../../services/pdf.service";
import { formatFileSize } from "../../utils/formatters";
import { useSubscription } from "../../hooks/useSubscription";
import { FREE_LIMITS } from "../../config/limits";

export function ImageToPdf() {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const { isPremium, hasReachedGlobalLimit, incrementUsage, isWalletConnected } = useSubscription();

  const fileLimitExceeded = !isPremium && files.length > FREE_LIMITS.imageToPdf.maxFiles;
  const isLocked  = hasReachedGlobalLimit || fileLimitExceeded;
  const lockReason = hasReachedGlobalLimit ? "global" : "size";
  const lockLabel  = fileLimitExceeded ? `${FREE_LIMITS.imageToPdf.maxFiles} images max` : undefined;

  const handleFilesSelected = (selectedFiles) => {
    const validImages = selectedFiles.filter(
      (f) => f.type === "image/jpeg" || f.type === "image/png" || f.type === "image/jpg"
    );
    if (validImages.length !== selectedFiles.length) {
      setError("Some files were ignored. Only JPG and PNG images are supported.");
    } else {
      setError(null);
    }
    setFiles((prev) => [...prev, ...validImages]);
  };

  const removeFile = (indexToRemove) =>
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));

  const clearAllFiles = () => { setFiles([]); setError(null); };

  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    let _files = [...files];
    const draggedItemContent = _files.splice(dragItem.current, 1)[0];
    _files.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setFiles(_files);
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    try {
      setIsProcessing(true);
      setError(null);
      const mergedPdfBlob = await imageToPdf(files);
      const url = URL.createObjectURL(mergedPdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `QuickPDF_Images_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      await incrementUsage();
    } catch (err) {
      setError(err.message || "An error occurred while converting the images. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const containerVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };
  const listVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemVariants = { hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 text-white mb-4">
          <ImageIcon className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-4">Image to PDF</h1>
        <p className="text-lg text-zinc-400">
          Convert JPG and PNG images into a PDF document. Drag to reorder your pages.
          {!isPremium && (
            <span className="block text-sm text-zinc-600 mt-1">
              Free tier: up to {FREE_LIMITS.imageToPdf.maxFiles} images
            </span>
          )}
        </p>
      </div>

      <div className="bg-[#0a0a0a] rounded-2xl border border-white/10 p-6 md:p-8 shadow-2xl">
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-6 p-4 bg-red-500/10 text-red-400 rounded-lg text-sm border border-red-500/20">
            {error}
          </motion.div>
        )}

        <div className="mb-8">
          <Dropzone onFilesSelected={handleFilesSelected} multiple={true} disabled={isProcessing} text="Click to upload JPG or PNG files" accept="image/jpeg, image/png, image/jpg" hintText="JPG, PNG Files Only" />
        </div>

        {files.length > 0 && (
          <div className="mb-8 space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-white">
                Selected Images ({files.length}
                {!isPremium && <span className="text-zinc-500">/{FREE_LIMITS.imageToPdf.maxFiles}</span>})
              </h3>
              <button onClick={clearAllFiles} disabled={isProcessing} className="flex items-center text-sm font-medium text-zinc-500 hover:text-red-400 transition-colors disabled:opacity-50">
                <Trash2 className="w-4 h-4 mr-1.5" />Clear All
              </button>
            </div>
            <motion.ul variants={listVariants} initial="hidden" animate="visible" className="space-y-2">
              {files.map((file, index) => (
                <motion.li variants={itemVariants} key={`${file.name}-${index}`} draggable={!isProcessing}
                  onDragStart={() => (dragItem.current = index)}
                  onDragEnter={() => (dragOverItem.current = index)}
                  onDragEnd={handleSort} onDragOver={(e) => e.preventDefault()}
                  className={`flex items-center justify-between p-3 bg-zinc-900/50 border border-white/10 rounded-lg group hover:border-white/30 hover:bg-zinc-800/50 transition-all ${isProcessing ? "opacity-50" : "cursor-grab active:cursor-grabbing"}`}
                >
                  <div className="flex items-center overflow-hidden mr-4">
                    <GripVertical className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors mr-3 flex-shrink-0" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-medium text-zinc-200 truncate">{file.name}</span>
                      <span className="text-xs text-zinc-500 mt-0.5">{formatFileSize(file.size)}</span>
                    </div>
                  </div>
                  <button onClick={() => removeFile(index)} disabled={isProcessing} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-white/5 rounded-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none" aria-label="Remove image">
                    <X className="w-4 h-4" />
                  </button>
                </motion.li>
              ))}
            </motion.ul>
            <p className="text-xs text-zinc-600 text-center mt-3">Drag and drop images to rearrange their page order.</p>
          </div>
        )}

        <div className="flex justify-end mt-8 border-t border-white/10 pt-6">
          {isLocked ? (
            <UpgradeButton reason={lockReason} limitLabel={lockLabel} isWalletConnected={isWalletConnected} isPremium={isPremium} className="w-full sm:w-auto" />
          ) : (
            <Button onClick={handleConvert} disabled={files.length === 0 || isProcessing} className="w-full sm:w-auto">
              {isProcessing ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Converting...</>
              ) : (
                <><Download className="w-5 h-5 mr-2" />Convert to PDF</>
              )}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
