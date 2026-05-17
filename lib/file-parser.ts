import { getDocumentProxy } from 'unpdf';

/**
 * Parse various file formats to extract text
 */
export async function parseFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();

  if (file.type === 'application/pdf') {
    return parsePDF(buffer);
  } else if (file.type === 'text/plain') {
    return new TextDecoder().decode(buffer);
  } else if (file.type.startsWith('image/')) {
    // For images, we'd need OCR, but for MVP just return placeholder
    console.warn('Image OCR not implemented, returning placeholder');
    return 'Image file uploaded. Please use PDF or text format for automatic text extraction.';
  } else {
    throw new Error(`Unsupported file type: ${file.type}`);
  }
}

/**
 * Extract text from PDF buffer using unpdf
 */
async function parsePDF(buffer: ArrayBuffer): Promise<string> {
  try {
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    let fullText = '';

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF file');
  }
}

/**
 * Clean and prepare text for AI processing
 */
export function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Remove extra whitespace
    .trim()
    .slice(0, 10000); // Limit to 10k chars for AI processing
}
