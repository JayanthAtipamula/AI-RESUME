import React from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Download, FileDown } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function SharedResume() {
  const { resumeId } = useParams();
  const [resume, setResume] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchResume = async () => {
      try {
        if (!resumeId) {
          setError('Resume not found');
          setLoading(false);
          return;
        }

        const sharedResumeRef = doc(db, 'shared_resumes', resumeId);
        const sharedResumeSnap = await getDoc(sharedResumeRef);

        if (!sharedResumeSnap.exists()) {
          setError('Resume not found');
          setLoading(false);
          return;
        }

        setResume({ id: sharedResumeSnap.id, ...sharedResumeSnap.data() });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching resume:', error);
        setError('Error loading resume');
        setLoading(false);
      }
    };

    fetchResume();
  }, [resumeId]);

  const formatResumeForPDF = (content: string) => {
    const sections = content.split('\n\n');
    const formattedSections = sections.map(section => {
      const lines = section.split('\n');
      
      if (sections.indexOf(section) === 0) {
        const [name, ...contactInfo] = lines;
        return `
          <div style="text-align: center; margin-bottom: 16px;">
            <h1 style="font-size: 20px; font-weight: bold; margin: 0 0 8px 0; color: #000;">${name}</h1>
            <p style="margin: 0; font-size: 13px; color: #333;">
              ${contactInfo.join(' | ')}
            </p>
          </div>
        `;
      }

      if (lines[0].toUpperCase() === lines[0]) {
        return `
          <div style="margin-bottom: 14px;">
            <h2 style="font-size: 14px; font-weight: bold; text-transform: uppercase; margin: 0 0 8px 0; padding-bottom: 4px; border-bottom: 1px solid #000; color: #000;">
              ${lines[0]}
            </h2>
            <div style="padding-left: 0;">
              ${lines.slice(1).map(line => {
                if (line.startsWith('-')) {
                  return `<p style="margin: 0 0 4px 0; padding-left: 12px; position: relative; font-size: 13px; line-height: 1.4;">
                    <span style="position: absolute; left: 4px;">•</span>
                    ${line.substring(1).trim()}
                  </p>`;
                }
                return `<p style="margin: 0 0 4px 0; font-size: 13px; line-height: 1.4;">${line}</p>`;
              }).join('')}
            </div>
          </div>
        `;
      }
      return `<p style="margin: 0 0 4px 0; font-size: 13px; line-height: 1.4;">${section}</p>`;
    });

    return `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background: white; max-width: 800px; margin: 0 auto;">
        ${formattedSections.join('\n')}
      </div>
    `;
  };

  const downloadAsPDF = async () => {
    if (!resume) return;

    const formattedContent = formatResumeForPDF(resume.content);
    const element = document.createElement('div');
    element.innerHTML = formattedContent;
    
    const timestamp = new Date().toLocaleDateString().replace(/\//g, '-');
    const filename = `resume-${resume.role?.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.pdf`;

    const options = {
      margin: [15, 15, 15, 15],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        letterRendering: true,
        useCORS: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        putTotalPages: true,
        compress: true
      }
    };

    try {
      await html2pdf().from(element).set(options).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="glass p-8 rounded-lg flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div>
          <p className="text-white">Loading resume...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="glass p-8 rounded-lg flex flex-col items-center space-y-4">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl text-white font-semibold">Error</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="glass p-8 rounded-lg flex flex-col items-center space-y-4">
          <div className="text-yellow-500 text-xl mb-4">🔍</div>
          <h2 className="text-xl text-white font-semibold">Resume Not Found</h2>
          <p className="text-gray-400">The resume you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto">
        <div className="glass p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl text-white">{resume.role || 'Resume'}</h1>
            <button
              onClick={downloadAsPDF}
              className="glass-button flex items-center gap-2"
            >
              <FileDown className="w-5 h-5" />
              Download PDF
            </button>
          </div>
          <div className="bg-white rounded-lg overflow-hidden">
            <div 
              className="p-6"
              dangerouslySetInnerHTML={{ __html: formatResumeForPDF(resume.content) }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}