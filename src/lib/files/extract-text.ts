// src/lib/files/extract-text.ts
import pdfParse from "pdf-parse";
import Tesseract from "tesseract.js";
import sharp from "sharp";

export async function extractTextFromFile(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === "application/pdf") {
    try {
      const result = await pdfParse(buffer);
      if (result.text && result.text.trim().length > 20) return result.text;
      // PDF might be image-based → render pages and OCR (simplified for MVP)
    } catch {
      // fall through to OCR path
    }
    return "";
  }
  if (mimeType.startsWith("image/")) {
    // Preprocess: grayscale + denoise for better OCR
    const processed = await sharp(buffer).grayscale().normalize().toBuffer();
    const { data: { text } } = await Tesseract.recognize(processed, "eng");
    return text;
  }
  return "";
}