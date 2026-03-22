import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";


// merging multiple PDFs into one
export const mergePdfs = async (files) => {
  if (!files || files.length === 0) {
    throw new Error("No files provided for merging.");
  }

  // created new PDFDocument
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    // reading the given file
    const arrayBuffer = await file.arrayBuffer();
    // loading the file
    const pdf = await PDFDocument.load(arrayBuffer);
    // getting the page indices of the loaded PDF and copying them to the merged PDF
    const pageIndices = pdf.getPageIndices();
    // copying the pages from the loaded PDF to the merged PDF
    const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
    // adding the copied pages to the merged PDF
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  // saving the merged PDF and returning it as a Blob
  const pdfBytes = await mergedPdf.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  return blob;
};

// splitting a PDF into a new PDF based on a page range
export const splitPdf = async (file, startPage, endPage) => {
  if (!file) throw new Error("Please provide a PDF file.");

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const totalPages = pdf.getPageCount();

  // Validate the range (Users think in 1-index, pdf-lib uses 0-index)
  if (startPage < 1 || endPage > totalPages || startPage > endPage) {
    throw new Error(
      `Invalid range. Please select between page 1 and ${totalPages}.`,
    );
  }

  // Create a new empty PDF
  const splitPdfDoc = await PDFDocument.create();

  // Create an array of the page indices we want to extract
  // Example: user wants pages 2 to 4. Array becomes [1, 2, 3] (0-indexed)
  const indicesToExtract = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage - 1 + i,
  );

  // Copy and add the pages
  const copiedPages = await splitPdfDoc.copyPages(pdf, indicesToExtract);
  copiedPages.forEach((page) => splitPdfDoc.addPage(page));

  // Save and return as a Blob
  const pdfBytes = await splitPdfDoc.save();
  return new Blob([pdfBytes], { type: "application/pdf" });
};

// Helper function to quickly get the page count for the UI without saving
export const getPdfPageCount = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  return pdf.getPageCount();
};


// adding a diagonal watermark to each page of a PDF
export const addWatermark = async (file, watermarkText = "CONFIDENTIAL") => {
  if (!file) throw new Error("Please provide a PDF file.");

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  // Embed a standard font so we don't have to load external font files
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  // Loop through every page and stamp it
  pages.forEach((page) => {
    const { width, height } = page.getSize();
    const fontSize = 60;

    // Calculate the width of the text so we can perfectly center it
    const textWidth = helveticaFont.widthOfTextAtSize(watermarkText, fontSize);
    const textHeight = helveticaFont.heightAtSize(fontSize);

    page.drawText(watermarkText, {
      x: width / 2 - textWidth / 2, // Center horizontally
      y: height / 2 - textHeight / 2, // Center vertically
      size: fontSize,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5), // Gray color
      opacity: 0.3, // 30% opacity so you can read the document underneath
      rotate: degrees(45), // Diagonal slant
    });
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: "application/pdf" });
};
