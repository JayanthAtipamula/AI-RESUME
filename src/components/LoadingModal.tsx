import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, X, FileDown, Download, Copy, Sparkles } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { LoadingStep } from '../types';

interface LoadingModalProps {
  isOpen: boolean;
  type: string;
  contentType: string;
  onClose: () => void;
  content: string;
  steps: {
    id: string;
    text: string;
    completed: boolean;
  }[];
  downloadAsPDF?: (content: string, filename: string) => void;
  downloadAsText?: (content: string, filename: string) => void;
  jobDescription?: string;
  extractRole?: (jobDesc: string) => string;
  activeTab?: string;
  resetSteps?: () => void;
  loadingSteps?: LoadingStep[];
}

const LoadingModal: React.FC<LoadingModalProps> = ({
  isOpen,
  type,
  contentType,
  onClose,
  content,
  steps,
  downloadAsPDF,
  downloadAsText,
  jobDescription = '',
  extractRole = () => 'Document',
  activeTab = 'resume',
  resetSteps = () => {},
  loadingSteps = [],
}) => {
  const [showContentView, setShowContentView] = useState(false);
  const [allStepsCompleted, setAllStepsCompleted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check if all steps are completed and show content if they are
  useEffect(() => {
    if (steps.length > 0) {
      const completed = steps.every(step => step.completed);
      if (completed && content) {
        const timer = setTimeout(() => {
          setShowContentView(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [content, steps]);

  // Also check loading steps if provided
  useEffect(() => {
    if (loadingSteps.length > 0) {
      const completed = loadingSteps.every(step => step.completed);
      setAllStepsCompleted(completed);
      
      // Only show content when all steps are completed
      if (completed && content && content.length > 0) {
        // Add a slight delay before showing content for better UX
        const timer = setTimeout(() => {
          setShowContentView(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
    
    // Reset to loading view when modal closes or new generation starts
    if (!isOpen || !content || content.length === 0) {
      setShowContentView(false);
      setAllStepsCompleted(false);
    }
  }, [loadingSteps, content, isOpen]);

  if (!isOpen) return null;

  // Function to copy content to clipboard
  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const element = document.getElementById('content-to-pdf');
    if (element) {
      const opt = {
        margin: 10,
        filename: `${activeTab}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };
      html2pdf().set(opt).from(element).save();
    }
  };

  // Format content for better display
  const formatContent = (text: string) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  // Use the existing UI structure to maintain project styling
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass max-w-2xl w-full p-6 rounded-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl text-white mb-6 text-center">
          {showContentView ? `Generated ${contentType}` : `Generating ${contentType}`}
        </h2>
        
        {!showContentView ? (
          <div className="space-y-4">
            {/* Show the active steps list */}
            {(loadingSteps.length > 0 ? loadingSteps : steps).map((step, index) => (
              <div key={step.id || index} className="flex items-center gap-3">
                {step.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                ) : (
                  <Loader2 className="w-5 h-5 text-neon-blue animate-spin shrink-0" />
                )}
                <span className="text-white">{step.text}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="glass p-3 rounded-lg border border-neon-blue/30 bg-neon-blue/5 mb-4">
              <div className="flex items-center gap-2 text-neon-blue">
                <Sparkles className="w-5 h-5" />
                <span className="font-medium">AI-Optimized for Job Match</span>
              </div>
              <p className="text-sm text-gray-300 mt-1">
                Your {contentType.toLowerCase()} has been tailored to match the job requirements and optimized for ATS systems.
              </p>
            </div>

            <div id="content-to-pdf" className="glass-input max-h-[60vh] overflow-y-auto p-4">
              {content ? formatContent(content) : 'No content generated'}
            </div>
            
            {/* Show download options only when all steps are completed */}
            {(allStepsCompleted || steps.every(step => step.completed)) && (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
                {type === 'resume' ? (
                  <>
                    <button
                      onClick={() => downloadAsPDF?.(content || '', extractRole(jobDescription))}
                      className="glass-button flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                      <FileDown className="w-5 h-5" />
                      Download PDF
                    </button>
                    <button
                      onClick={() => downloadAsText?.(content || '', extractRole(jobDescription))}
                      className="glass-button flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                      <Download className="w-5 h-5" />
                      Download TXT
                    </button>
                  </>
                ) : null}
                <button
                  onClick={handleCopy}
                  className="glass-button flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <Copy className="w-5 h-5" />
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingModal;