// lib/parsers.ts
import "server-only";
import PDFParser from "pdf2json";
import mammoth from "mammoth";

/**
 * Extract text from PDF buffer using pdf-parse
 */
export async function parsePDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const parser = new PDFParser(null); // 1 = text only

    parser.on("pdfParser_dataError", (errData: any) =>
      reject(new Error(errData.parserError))
    );

    parser.on("pdfParser_dataReady", (pdfData: any) => {
      // Extract text from the obscure JSON structure pdf2json returns
      const text = parser.getRawTextContent();
      resolve(text);
    });

    // pdf2json expects a buffer, but older versions strictly wanted a file path.
    // The parseBuffer method is the modern way:
    parser.parseBuffer(buffer);
  });
}
/**
 * Extract text from DOCX buffer
 */
export async function parseDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value.trim();
    
    if (!text || text.length < 50) {
      throw new Error("DOCX appears to be empty or unreadable");
    }
    
    return text;
  } catch (error) {
    console.error("DOCX parsing error:", error);
    throw new Error("Failed to parse DOCX. It may be corrupted.");
  }
}

/**
 * Detect file type and parse accordingly
 */
export async function parseResumeFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  const fileType = file.type.toLowerCase();
  
  if (fileType === "application/pdf") {
    return parsePDF(buffer);
  } else if (
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileType === "application/msword"
  ) {
    return parseDOCX(buffer);
  } else {
    throw new Error("Unsupported file type. Please upload PDF or DOCX.");
  }
}

/**
 * Validate file before processing
 */
export function validateResumeFile(
  file: File,
  maxSizeMB: number = 5
): { valid: boolean; error?: string } {
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Please upload a PDF or DOCX file",
    };
  }
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB`,
    };
  }
  
  if (!file.name || file.name.length < 3) {
    return {
      valid: false,
      error: "Invalid file name",
    };
  }
  
  return { valid: true };
}