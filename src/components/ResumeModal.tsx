import { generateResumePDF } from '../lib/pdfService';

const handleDownload = async () => {
  try {
    setIsDownloading(true);
    
    console.log('Downloading resume from modal');
    
    // Check if we have structured data or raw content
    if (typeof resume === 'object' && resume !== null) {
      // Prepare the resume data for the PDF generation
      const resumeData = {
        personalInfo: resume.personalInfo || {},
        summary: resume.summary || '',
        workExperience: resume.workExperience || [],
        education: resume.education || [],
        skills: resume.skills || [],
        projects: resume.projects || [],
        certifications: resume.certifications || []
      };
      
      await generateResumePDF(resumeData);
    } else if (typeof resume === 'string') {
      // If it's a string, use it as raw content
      await generateResumePDF({ 
        content: resume,
        role: role || 'Resume'
      });
    } else {
      console.error('Invalid resume data type:', typeof resume);
      throw new Error('Invalid resume data type');
    }
    
    toast.success('Resume downloaded successfully!');
  } catch (error) {
    console.error('Error downloading resume:', error);
    toast.error('Failed to download resume. Please try again.');
  } finally {
    setIsDownloading(false);
  }
};

<button
  onClick={handleDownload}
  disabled={isDownloading}
  className="glass-button px-4 py-2 flex items-center justify-center"
>
  {isDownloading ? (
    <>
      <span className="animate-spin mr-2">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </span>
      Downloading...
    </>
  ) : (
    <>
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
      </svg>
      Download PDF
    </>
  )}
</button> 