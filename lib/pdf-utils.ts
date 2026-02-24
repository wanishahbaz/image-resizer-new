import { PDFDocument } from 'pdf-lib';

/**
 * Safely creates a Blob from Uint8Array.
 * Ensures compatibility with various environments by using a standard approach.
 */
export function createSafePdfBlob(pdfBytes: Uint8Array): Blob {
  return new Blob([pdfBytes as any], { type: 'application/pdf' });
}

/**
 * Gets the page count of a PDF file.
 */
export async function getPdfPageCount(file: File | Blob): Promise<number> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    return pdfDoc.getPageCount();
  } catch (error) {
    console.error('Error getting PDF page count:', error);
    return 0;
  }
}

/**
 * Validates if a file is a PDF.
 */
export function isPdf(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

/**
 * Validates if a file is a Word document.
 */
export function isWordDoc(file: File): boolean {
  const wordTypes = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  return wordTypes.includes(file.type) || 
         file.name.toLowerCase().endsWith('.doc') || 
         file.name.toLowerCase().endsWith('.docx');
}
