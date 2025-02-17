import { FileText, Mail } from 'lucide-react';

interface TabSelectorProps {
  activeTab: 'resume' | 'cover-letter';
  onTabChange: (tab: 'resume' | 'cover-letter') => void;
}

export default function TabSelector({ activeTab, onTabChange }: TabSelectorProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6">
      <button
        onClick={() => onTabChange('resume')}
        className={`glass-button flex items-center justify-center gap-2 w-full sm:w-auto ${
          activeTab === 'resume' ? 'bg-neon-blue/20' : ''
        }`}
      >
        <FileText className="w-5 h-5" />
        Resume
      </button>
      <button
        onClick={() => onTabChange('cover-letter')}
        className={`glass-button flex items-center justify-center gap-2 w-full sm:w-auto ${
          activeTab === 'cover-letter' ? 'bg-neon-blue/20' : ''
        }`}
      >
        <Mail className="w-5 h-5" />
        Cover Letter
      </button>
    </div>
  );
}