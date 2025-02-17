import React, { useState } from 'react';
import { Download, FileDown, Copy, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';

interface ResumeDisplayProps {
  content: string;
  jobDescription: string;
  type: 'resume' | 'cover-letter';
  downloadAsPDF: (content: string, role: string) => void;
  downloadAsText: (content: string, role: string) => void;
  extractRole: (jobDesc: string) => string;
  formatResumeDisplay: (content: string) => React.ReactNode;
}

export default function ResumeDisplay({
  content,
  jobDescription,
  type,
  downloadAsPDF,
  downloadAsText,
  extractRole,
  formatResumeDisplay
}: ResumeDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  if (!content) return null;

  const contentType = type === 'cover-letter' ? 'Cover Letter' : 'Resume';
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

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

      if (lines[0] && lines[0].toUpperCase() === lines[0]) {
        return `
          <div style="margin-bottom: 16px;">
            <h2 style="font-size: 16px; font-weight: bold; margin: 0 0 8px 0; color: #000; border-bottom: 1px solid #ddd;">
              ${lines[0]}
            </h2>
            <div style="color: #333; font-size: 14px;">
              ${lines.slice(1).join('\n')}
            </div>
          </div>
        `;
      }
      return `
        <div style="margin-bottom: 16px;">
          <div style="color: #333; font-size: 14px;">
            ${lines.join('\n')}
          </div>
        </div>
      `;
    });

    return formattedSections.join('\n');
  };

  return (
    <div className="glass p-3 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl text-white">Generated {contentType}</h2>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="glass-button py-1.5 px-2 text-sm flex items-center gap-1"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span className="hidden sm:inline">{isExpanded ? 'Collapse' : 'View'}</span>
          </button>
        </div>
        <div className="glass p-2 rounded-lg border border-neon-blue/30 bg-neon-blue/5">
          <div className="flex items-center gap-2 text-neon-blue text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Optimized for Job Match</span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <>
          {type === 'resume' ? (
            <div className="bg-white rounded-lg overflow-hidden">
              <div 
                className="p-6 text-black"
                dangerouslySetInnerHTML={{ __html: formatResumeForPDF(content) }}
              />
            </div>
          ) : (
            <div className="bg-white rounded-lg p-6 text-black whitespace-pre-wrap text-sm sm:text-base">
              {formatResumeDisplay(content)}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
            {type === 'resume' ? (
              <>
                <button
                  onClick={() => downloadAsPDF(content, extractRole(jobDescription))}
                  className="glass-button flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <FileDown className="w-5 h-5" />
                  Download PDF
                </button>
                <button
                  onClick={() => downloadAsText(content, extractRole(jobDescription))}
                  className="glass-button flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <Download className="w-5 h-5" />
                  Download TXT
                </button>
              </>
            ) : (
              <button
                onClick={handleCopy}
                className="glass-button flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Copy className="w-5 h-5" />
                Copy to Clipboard
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}