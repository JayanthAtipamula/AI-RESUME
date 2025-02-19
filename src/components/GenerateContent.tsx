import React from 'react';
import { Sparkles, Diamond } from 'lucide-react';
import GenerateButton from './GenerateButton';

interface GenerateContentProps {
  type: 'resume' | 'cover-letter';
  jobDescription: string;
  setJobDescription: (value: string) => void;
  handleGenerate: () => void;
  isGenerating: boolean;
  userData: any;
}

export default function GenerateContent({
  type,
  jobDescription,
  setJobDescription,
  handleGenerate,
  isGenerating,
  userData
}: GenerateContentProps) {
  return (
    <div className="glass p-3 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl text-white mb-2">
            Generate {type === 'resume' ? 'Resume' : 'Cover Letter'}
          </h2>
          <p className="text-gray-400 text-sm">
            Our AI will analyze the job description and tailor your {type} to match the requirements perfectly.
          </p>
        </div>
        <div className="glass p-2 rounded-lg border border-neon-blue/30 bg-neon-blue/5">
          <div className="flex items-center gap-2 text-neon-blue text-sm">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Matching</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Job Description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder={`Paste job description here...

Tips for best results:
• Include the full job description
• Add any specific requirements or qualifications
• Include desired skills and experience
• Add company culture information`}
            className="glass-input w-full h-48 sm:h-56 mb-4 text-sm sm:text-base"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mt-6">
          <GenerateButton
            type={type}
            isGenerating={isGenerating}
            onClick={handleGenerate}
          />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Plan:</span>
            <span className={`px-2 py-1 rounded-full ${
              userData?.subscription?.plan === 'free'
                ? 'bg-gray-500/20 text-gray-400'
                : userData?.subscription?.plan === '1m-pro'
                ? 'bg-blue-500/20 text-blue-500'
                : 'bg-purple-500/20 text-purple-500'
            }`}>
              {userData?.subscription?.plan === 'free' ? 'Free' :
               userData?.subscription?.plan === '1m-pro' ? 'Monthly Pro' :
               userData?.subscription?.plan === '1y-pro' ? 'Yearly Pro' : 'Free'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}