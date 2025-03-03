import React, { useState } from 'react';
import ResumeCard from './ResumeCard';
import { FileText } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

interface Resume {
  id: string;
  content: string;
  jobDescription: string;
  createdAt: Timestamp;
  role?: string;
  type: 'resume' | 'cover-letter';
}

interface PreviousResumesProps {
  resumes: Resume[];
  editingResume: string | null;
  expandedResume: string | null;
  editedContent: string;
  isDeleting: string | null;
  onToggleExpand: (id: string) => void;
  onEdit: (resume: Resume) => void;
  onSave: (id: string) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  onEditContentChange: (content: string) => void;
  downloadAsPDF: (content: string, role: string) => void;
  downloadAsText: (content: string, role: string) => void;
  formatResumeDisplay: (content: string) => React.ReactNode;
}

export default function PreviousResumes({
  resumes,
  editingResume,
  expandedResume,
  editedContent,
  isDeleting,
  onToggleExpand,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onEditContentChange,
  downloadAsPDF,
  downloadAsText,
  formatResumeDisplay
}: PreviousResumesProps) {
  if (resumes.length === 0) return null;

  const contentType = resumes[0]?.type === 'cover-letter' ? 'Cover Letters' : 'Resumes';

  // Sort resumes by creation date (newest first) and limit to 5
  const sortedResumes = [...resumes]
    .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
    .slice(0, 5);

  // Get the most recent resume's ID
  const mostRecentId = sortedResumes[0]?.id;

  const handleDownload = async (resume: Resume) => {
    try {
      setDownloadingId(resume.id);
      
      // Use the downloadAsPDF function passed as a prop
      await downloadAsPDF(resume.content, resume.role || '');
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast.error('Failed to download resume. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="glass p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">
            <FileText className="w-6 h-6" />
            Previous {contentType}
          </h2>
          <p className="text-gray-400 text-sm">only display the most recent 5{contentType.toLowerCase()}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <FileText className="w-4 h-4 text-neon-blue" />
          <span>{resumes.length} {contentType.toLowerCase()}</span>
        </div>
      </div>

      <div className="grid gap-4">
        {sortedResumes.map((resume) => (
          <ResumeCard
            key={resume.id}
            resume={resume}
            isEditing={editingResume === resume.id}
            isExpanded={expandedResume === resume.id}
            isDeleting={isDeleting === resume.id}
            editedContent={editedContent}
            isNewest={resume.id === mostRecentId}
            onToggleExpand={() => onToggleExpand(resume.id)}
            onEdit={() => onEdit(resume)}
            onSave={() => onSave(resume.id)}
            onCancel={onCancel}
            onDelete={() => onDelete(resume.id)}
            onEditContentChange={onEditContentChange}
            downloadAsPDF={() => downloadAsPDF(resume.content, resume.role || '')}
            downloadAsText={() => downloadAsText(resume.content, resume.role || '')}
            formatResumeDisplay={formatResumeDisplay}
          />
        ))}
      </div>
    </div>
  );
}