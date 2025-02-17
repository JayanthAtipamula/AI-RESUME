import React from 'react';
import { FileText } from 'lucide-react';

interface GenerateResumeProps {
  jobDescription: string;
  setJobDescription: (value: string) => void;
  handleGenerateResume: () => void;
  isGenerating: boolean;
}

export default function GenerateResume({
  jobDescription,
  setJobDescription,
  handleGenerateResume,
  isGenerating
}: GenerateResumeProps) {
  return (
    <div className="glass p-6 mb-6">
      <h2 className="text-xl text-white mb-4">Generate Resume</h2>
      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste job description here..."
        className="glass-input w-full h-40 mb-4"
      />
      <button
        onClick={handleGenerateResume}
        disabled={isGenerating}
        className="glass-button flex items-center gap-2"
      >
        <FileText className="w-5 h-5" />
        {isGenerating ? 'Generating...' : 'Generate Resume'}
      </button>
    </div>
  );
}