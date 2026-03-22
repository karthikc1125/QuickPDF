import React, { useState } from "react";
import { Stamp, X, Download, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { addWatermark } from "../../services/pdf.service";
import { Dropzone } from "../../components/pdf/Dropzone";
import { formatFileSize } from "../../utils/formatters";

export function Watermark() {
  const [file, setFile] = useState(null);
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelected = (selectedFiles) => {
    const selectedFile = selectedFiles[0];
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Please upload a valid PDF file.");
      return;
    }

    setError(null);
    setFile(selectedFile);
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
  };

  const handleProcess = async () => {
    if (!file || !watermarkText.trim()) return;

    try {
      setIsProcessing(true);
      setError(null);

      const watermarkedBlob = await addWatermark(file, watermarkText);

      const url = URL.createObjectURL(watermarkedBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `QuickPDF_Watermarked_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("An error occurred while adding the watermark.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 text-white mb-4">
          <Stamp className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-4">
          Add Watermark
        </h1>
        <p className="text-lg text-zinc-400">
          Stamp text across your document securely in your browser.
        </p>
      </div>

      <div className="bg-[#0a0a0a] rounded-2xl border border-white/10 p-6 md:p-8 shadow-2xl">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 text-red-400 rounded-lg text-sm border border-red-500/20">
            {error}
          </div>
        )}

        {!file ? (
          <Dropzone
            onFilesSelected={handleFileSelected}
            multiple={false}
            disabled={isProcessing}
            text="Click to upload a PDF"
          />
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between p-4 bg-zinc-900/50 border border-white/10 rounded-xl">
              <div className="flex flex-col overflow-hidden mr-4">
                <span className="font-medium text-zinc-200 truncate">
                  {file.name}
                </span>
                <span className="text-sm text-zinc-500 mt-0.5">
                  {formatFileSize(file.size)}
                </span>
              </div>
              <button
                onClick={clearFile}
                className="p-2 text-zinc-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-400">
                Watermark Text
              </label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="e.g., CONFIDENTIAL"
                className="w-full h-11 px-4 bg-black border border-white/10 text-white rounded-lg focus:ring-2 focus:ring-white/20 focus:border-white/30 outline-none transition-all placeholder:text-zinc-600 uppercase"
              />
            </div>

            <div className="flex justify-end border-t border-white/10 pt-6">
              <Button
                onClick={handleProcess}
                disabled={isProcessing || !watermarkText.trim()}
                className="w-full sm:w-auto"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Stamp & Download
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
