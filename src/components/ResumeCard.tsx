import React, { useState } from 'react';
import { FileText, Download, FileDown, Trash2, Edit2, Save, X, ChevronDown, ChevronUp, Mail, Share2, Copy } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { auth } from '../lib/firebase';
import { shareResume } from '../lib/firebase';

interface Resume {
  id: string;
  content: string;
  jobDescription: string;
  createdAt: Timestamp;
  role?: string;
  type: 'resume' | 'cover-letter';
}

interface ResumeCardProps {
  resume: Resume;
  isEditing: boolean;
  isExpanded: boolean;
  isDeleting: boolean;
  editedContent: string;
  isNewest: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onEditContentChange: (content: string) => void;
  downloadAsPDF: () => void;
  downloadAsText: () => void;
  formatResumeDisplay: (content: string) => React.ReactNode;
}

export default function ResumeCard({
  resume,
  isEditing,
  isExpanded,
  isDeleting,
  editedContent,
  isNewest,
  onToggleExpand,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onEditContentChange,
  downloadAsPDF,
  downloadAsText,
  formatResumeDisplay
}: ResumeCardProps) {
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const Icon = resume.type === 'cover-letter' ? Mail : FileText;
  const contentType = resume.type === 'cover-letter' ? 'Cover Letter' : 'Resume';

  const handleShareLink = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not logged in');
      }

      await shareResume(user.uid, resume.id);
      const shareUrl = `${window.location.origin}/r/${resume.id}`;
      await navigator.clipboard.writeText(shareUrl);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    } catch (err) {
      console.error('Failed to share resume:', err);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resume.content);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
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

  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className={`glass p-4 sm:p-6 relative ${isNewest ? 'border-2 border-neon-blue' : ''}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-neon-blue" />
            <div>
              <h3 className="text-lg font-semibold text-white">{contentType}</h3>
              <p className="text-sm text-gray-400">Created {formatDate(resume.createdAt)}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={onToggleExpand}
              className="glass-button py-1.5 px-2 text-sm flex items-center gap-1"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span className="hidden sm:inline">{isExpanded ? 'Collapse' : 'View'}</span>
            </button>
            
            <div className="flex gap-1">
              {resume.type === 'resume' ? (
                <>
                  <button
                    onClick={downloadAsPDF}
                    className="glass-button py-1.5 px-2 text-sm"
                    title="Download PDF"
                  >
                    <FileDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={downloadAsText}
                    className="glass-button py-1.5 px-2 text-sm"
                    title="Download Text"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleShareLink}
                    className="glass-button py-1.5 px-2 text-sm"
                    title="Share Link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleCopy}
                  className="glass-button py-1.5 px-2 text-sm"
                  title="Copy to Clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onEdit}
                className="glass-button py-1.5 px-2 text-sm"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="glass-button py-1.5 px-2 text-sm bg-red-500/10 hover:bg-red-500/20"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {isExpanded && (
          <div className="mt-4">
            {isEditing ? (
              <div className="space-y-4">
                <textarea
                  value={editedContent}
                  onChange={(e) => onEditContentChange(e.target.value)}
                  className="glass-input w-full h-64 font-mono text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={onSave}
                    className="glass-button py-1.5 px-3 text-sm flex items-center gap-1"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={onCancel}
                    className="glass-button py-1.5 px-3 text-sm flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg overflow-hidden">
                <div 
                  className="p-6 text-black"
                  dangerouslySetInnerHTML={{ __html: formatResumeForPDF(resume.content) }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed bottom-4 right-4 glass p-3 text-white rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <Share2 className="w-4 h-4 text-neon-blue" />
          Share link copied to clipboard!
        </div>
      )}

      {/* Copy Toast */}
      {showCopyToast && (
        <div className="fixed bottom-4 right-4 glass p-3 text-white rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <Copy className="w-4 h-4 text-neon-blue" />
          {contentType} copied to clipboard!
        </div>
      )}

      {/* Delete Confirmation */}
      {isDeleting && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="glass p-4 text-center space-y-4">
            <p className="text-white">Are you sure you want to delete this {contentType.toLowerCase()}?</p>
            <div className="flex justify-center gap-2">
              <button
                onClick={onDelete}
                className="glass-button py-1.5 px-3 text-sm bg-red-500/10 hover:bg-red-500/20"
              >
                Delete
              </button>
              <button
                onClick={onCancel}
                className="glass-button py-1.5 px-3 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}