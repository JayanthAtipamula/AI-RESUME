import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Use a local worker file instead of CDN
if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
  // Using the ES module worker from the local package
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).toString();
}

/**
 * Extract text from a PDF file using PDF.js
 * @param file The PDF file to extract text from
 * @returns A promise that resolves to the extracted text
 */
const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    console.log('Starting PDF text extraction with PDF.js', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });
    
    // Read the file as ArrayBuffer
    let arrayBuffer: ArrayBuffer;
    try {
      arrayBuffer = await file.arrayBuffer();
      console.log(`Successfully read file as ArrayBuffer, size: ${arrayBuffer.byteLength} bytes`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error reading file as ArrayBuffer:', error);
      throw new Error(`Failed to read file as ArrayBuffer: ${errorMessage}`);
    }
    
    // Load the PDF document
    try {
      console.log('Loading PDF document...');
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      console.log(`PDF loaded successfully with ${pdf.numPages} pages`);
      
      // Get the number of pages
      const numPages = pdf.numPages;
      let fullText = '';
      
      // Extract text from each page
      for (let i = 1; i <= numPages; i++) {
        console.log(`Processing page ${i} of ${numPages}`);
        
        try {
          const page = await pdf.getPage(i);
          console.log(`Got page ${i}`);
          
          try {
            const textContent = await page.getTextContent();
            console.log(`Got text content for page ${i}, items: ${textContent.items.length}`);
            
            const textItems = textContent.items.map((item: any) => {
              return item.str || '';
            }).join(' ');
            
            console.log(`Extracted ${textItems.length} characters from page ${i}`);
            fullText += textItems + '\n\n';
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`Error getting text content for page ${i}:`, error);
            // Continue with other pages even if one fails
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Error getting page ${i}:`, error);
          // Continue with other pages even if one fails
        }
      }
      
      console.log(`PDF text extraction complete, extracted ${fullText.length} characters, sample: "${fullText.substring(0, 100)}..."`);
      return fullText;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error loading or processing PDF:', error);
      throw new Error(`PDF processing failed: ${errorMessage}`);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error extracting text from PDF:', error);
    throw new Error(`PDF text extraction failed: ${errorMessage}`);
  }
};

/**
 * Extract text from a PDF file using OCR if text extraction fails
 * @param file The PDF file to extract text from
 * @returns A promise that resolves to the extracted text
 */
const extractTextFromPDFWithOCR = async (file: File): Promise<string> => {
  try {
    // First try to extract text directly from PDF
    const extractedText = await extractTextFromPDF(file);
    
    // If we got some meaningful text, return it
    if (extractedText.trim().length > 100) {
      return extractedText;
    }
    
    // If not enough text was extracted, fall back to OCR
    console.log('Not enough text extracted from PDF, falling back to OCR');
    return extractTextWithOCR(file);
  } catch (error) {
    console.error('Error extracting text from PDF, falling back to OCR:', error);
    return extractTextWithOCR(file);
  }
};

/**
 * Extract text from a file using OCR
 * @param file The file to extract text from
 * @returns A promise that resolves to the extracted text
 */
const extractTextWithOCR = async (file: File): Promise<string> => {
  try {
    console.log('Starting OCR process with tesseract.js');
    const worker = await createWorker('eng');
    
    // Convert file to image data URL
    const reader = new FileReader();
    
    console.log('Converting file to data URL');
    // Create a promise that resolves when the file is read
    const dataURL = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error: any) => {
        console.error('Error reading file:', error);
        reject(error);
      }
      reader.readAsDataURL(file);
    });
    
    console.log('File converted to data URL, recognizing text...');
    // Recognize text from the image
    const { data } = await worker.recognize(dataURL);
    
    console.log('OCR processing complete, terminating worker');
    // Clean up
    await worker.terminate();
    
    console.log('OCR text extraction completed successfully');
    return data.text;
  } catch (error: any) {
    console.error('Error in OCR text extraction:', error);
    throw new Error(`OCR processing failed: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Extract text from a DOCX file
 * We can't directly extract text from DOCX in browser,
 * so this is a placeholder for a server-side implementation
 * or integration with a service like mammoth.js in the future
 */
const extractTextFromDOCX = async (file: File): Promise<string> => {
  // This is a placeholder - in a real implementation, you might:
  // 1. Upload the file to a server endpoint that extracts text
  // 2. Use a library like mammoth.js (would need to be added as a dependency)
  // 3. Use a third-party API service
  
  throw new Error('DOCX extraction not implemented. Please use PDF files for now.');
};

/**
 * Extract text from a resume file
 * @param file The resume file (PDF or DOCX)
 * @returns A promise that resolves to the extracted text
 */
export const extractTextFromResume = async (file: File): Promise<string> => {
  if (file.type === 'application/pdf') {
    // For now, we'll only use PDF.js extraction and skip OCR for simplicity
    return extractTextFromPDF(file);
  } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    throw new Error('DOCX files are not supported yet. Please upload a PDF file.');
  } else {
    throw new Error('Unsupported file type. Please upload a PDF file.');
  }
}; 