import React from 'react';
import { CheckCircle2, Loader2, X, FileDown, Download, Copy, Sparkles } from 'lucide-react';

interface Step {
  id: string;
  text: string;
  completed: boolean;
}

interface LoadingModalProps {
  isOpen: boolean;
  type: 'resume' | 'cover-letter';
  steps: Step[];
  content: string | null;
  onClose: () => void;
  downloadAsPDF?: (content: string, role: string) => void;
  downloadAsText?: (content: string, role: string) => void;
  jobDescription?: string;
  extractRole?: (jobDesc: string) => string;
}

export default function LoadingModal({ 
  isOpen, 
  type, 
  steps, 
  content, 
  onClose,
  downloadAsPDF,
  downloadAsText,
  jobDescription = '',
  extractRole = () => 'Document'
}: LoadingModalProps) {
  if (!isOpen) return null;

  const contentType = type === 'resume' ? 'Resume' : 'Cover Letter';

  const handleCopy = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

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
          {content ? `Generated ${contentType}` : `Generating ${contentType}`}
        </h2>
        
        {!content ? (
          <div className="space-y-4">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center gap-3">
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

            <div className="glass-input max-h-[60vh] overflow-y-auto whitespace-pre-wrap p-4">
              {content}
            </div>
            {type === 'resume' ? (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <button
                  onClick={() => downloadAsPDF?.(content, extractRole(jobDescription))}
                  className="glass-button flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <FileDown className="w-5 h-5" />
                  Download PDF
                </button>
                <button
                  onClick={() => downloadAsText?.(content, extractRole(jobDescription))}
                  className="glass-button flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <Download className="w-5 h-5" />
                  Download TXT
                </button>
              </div>
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
        )}
      </div>
    </div>
  );
}