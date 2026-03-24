/**
 * QuickPDF – Free Tier Limits
 * Single source of truth. Adjust here; every tool picks up changes automatically.
 */

/** Convert megabytes → bytes */
export const mbToBytes = (mb) => mb * 1024 * 1024;

export const FREE_LIMITS = {
  /** Global successful-action cap across ALL tools */
  globalRequests: 15,

  merge:      { maxFiles: 15 },
  split:      { maxFileSizeMb: 10 },
  watermark:  { maxFileSizeMb: 10 },
  imageToPdf: { maxFiles: 20 },          // renamed from maxImages for consistency
  compress:   { maxFileSizeMb: 50 },     // generous limit for free tier
  rotate:     { maxFileSizeMb: 10 },
  organize:   { maxFileSizeMb: 10 },
  pdfToImage: { maxFileSizeMb: 10 },
  grayscale:  { maxFileSizeMb: 10 },
};
