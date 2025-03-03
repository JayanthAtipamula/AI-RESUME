/**
 * Service for generating and downloading resume PDFs
 */

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

/**
 * Generate a resume PDF using the backend service
 * @param resumeData The resume data to include in the PDF
 */
export const generateResumePDF = async (resumeData: any) => {
  try {
    console.log('Generating PDF with data type:', typeof resumeData);
    console.log('API URL:', `${API_URL}/generate-pdf`);
    
    // Check if we have raw content or structured data
    const payload = typeof resumeData === 'string' 
      ? { content: resumeData } 
      : resumeData;
    
    console.log('Sending payload with keys:', Object.keys(payload));
    
    const response = await fetch(`${API_URL}/generate-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Error: ${response.status} - ${errorText}`);
    }

    // Get the PDF as a blob
    const blob = await response.blob();
    console.log('Received blob of size:', blob.size, 'bytes');
    
    if (blob.size === 0) {
      throw new Error('Received empty PDF blob');
    }
    
    // Create a URL for the blob
    const url = window.URL.createObjectURL(blob);
    
    // Create a temporary link element
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume_${new Date().toISOString().split('T')[0]}.pdf`;
    
    console.log('Triggering download with filename:', a.download);
    
    // Append to the document, click it, and remove it
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up the URL object
    window.URL.revokeObjectURL(url);
    
    console.log('PDF download initiated successfully');
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * Generate a resume PDF using the backend service with raw content
 * @param content The raw content to include in the PDF
 * @param role Optional role/title for the resume
 */
export const generateRawContentPDF = async (content: string, role?: string) => {
  console.log('Generating raw content PDF for role:', role);
  console.log('Content length:', content?.length || 0);
  
  try {
    return await generateResumePDF({ content, role });
  } catch (error) {
    console.error('Error in generateRawContentPDF:', error);
    throw error;
  }
}; 