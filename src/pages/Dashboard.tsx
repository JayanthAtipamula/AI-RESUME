import React from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, query, where, getDocs, deleteDoc, updateDoc, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db, addNewResume } from '../lib/firebase';
import { useAuthStore } from '../lib/store';
import { generateResume, generateCoverLetter } from '../lib/groq';
import html2pdf from 'html2pdf.js';
import TabSelector from '../components/TabSelector';
import GenerateContent from '../components/GenerateContent';
import ResumeDisplay from '../components/ResumeDisplay';
import PreviousResumes from '../components/PreviousResumes';
import LoadingModal from '../components/LoadingModal';

interface Resume {
  id: string;
  content: string;
  jobDescription: string;
  createdAt: Timestamp;
  role?: string;
  type: 'resume' | 'cover-letter';
  userId: string;
}

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = React.useState<'resume' | 'cover-letter'>('resume');
  const [profile, setProfile] = React.useState<any>(null);
  const [jobDescription, setJobDescription] = React.useState('');
  const [generatedContent, setGeneratedContent] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [previousContent, setPreviousContent] = React.useState<Resume[]>([]);
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);
  const [editingContent, setEditingContent] = React.useState<string | null>(null);
  const [expandedContent, setExpandedContent] = React.useState<string | null>(null);
  const [editedContent, setEditedContent] = React.useState('');
  const contentRef = React.useRef<HTMLDivElement>(null);

  const [loadingSteps, setLoadingSteps] = React.useState([
    { id: 'profile', text: 'Analyzing Profile', completed: false },
    { id: 'job', text: 'Analyzing Job Description', completed: false },
    { id: 'generate', text: 'Generating ATS-Friendly Content', completed: false },
    { id: 'score', text: 'Checking ATS Score', completed: false },
    { id: 'match', text: 'Verifying Job Match', completed: false },
  ]);
  const [showLoadingModal, setShowLoadingModal] = React.useState(false);
  const [modalContent, setModalContent] = React.useState<string | null>(null);

  const [isLoading, setIsLoading] = React.useState(true);

  const getLoadingSteps = (type: 'resume' | 'cover-letter') => {
    if (type === 'resume') {
      return [
        { id: 'profile', text: 'Analyzing Profile', completed: false },
        { id: 'job', text: 'Analyzing Job Description', completed: false },
        { id: 'generate', text: 'Generating ATS-Friendly Content', completed: false },
        { id: 'score', text: 'Checking ATS Score', completed: false },
        { id: 'match', text: 'Verifying Job Match', completed: false },
      ];
    } else {
      return [
        { id: 'profile', text: 'Analyzing Profile', completed: false },
        { id: 'job', text: 'Analyzing Job Description', completed: false },
        { id: 'generate', text: 'Generating ATS-Friendly Content', completed: false },
        { id: 'score', text: 'Checking ATS Score', completed: false },
        { id: 'match', text: 'Verifying Job Match', completed: false },
      ];
    }
  };

  const updateStep = (stepId: string) => {
    setLoadingSteps(steps =>
      steps.map(step =>
        step.id === stepId ? { ...step, completed: true } : step
      )
    );
  };

  const resetSteps = () => {
    setLoadingSteps(steps =>
      steps.map(step => ({ ...step, completed: false }))
    );
    setModalContent(null);
  };

  const simulateProgress = async () => {
    const delays = [1000, 1000, 1500, 1000, 1000]; // Delays in milliseconds
    const steps = ['profile', 'job', 'generate', 'score', 'match'];
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, delays[i]));
      updateStep(steps[i]);
    }
  };

  const handleTabChange = (tab: 'resume' | 'cover-letter') => {
    setActiveTab(tab);
    setGeneratedContent('');
    setJobDescription('');
    setLoadingSteps(getLoadingSteps(tab));
  };

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'profiles', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data());
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    };

    const fetchPreviousContent = async () => {
      setIsLoading(true);
      if (user) {
        const collectionName = activeTab === 'resume' ? 'resumes' : 'coverLetters';
        const contentRef = collection(db, 'users', user.uid, collectionName);
        const q = query(
          contentRef,
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        
        try {
          const querySnapshot = await getDocs(q);
          const content: Resume[] = [];
          querySnapshot.forEach((doc) => {
            content.push({ id: doc.id, ...doc.data() } as Resume);
          });
          setPreviousContent(content);
        } catch (error) {
          console.error('Error fetching previous content:', error);
          setPreviousContent([]);
        }
      } else {
        setPreviousContent([]);
      }
      setIsLoading(false);
    };

    fetchProfile();
    fetchPreviousContent();
  }, [user, activeTab]);

  const extractRole = (jobDesc: string) => {
    const firstLine = jobDesc.split('\n')[0];
    const roleMatch = firstLine.match(/^(.*?)(position|role|job|opening)/i);
    return roleMatch ? roleMatch[1].trim() : 'Position';
  };

  const handleGenerate = async () => {
    if (!profile || !jobDescription || !user) return;
    
    setShowLoadingModal(true);
    setLoadingSteps(getLoadingSteps(activeTab));
    resetSteps();
    setIsGenerating(true);

    try {
      // Start the loading animation
      const loadingAnimation = simulateProgress();

      // Generate the content
      const content = activeTab === 'resume' 
        ? await generateResume(profile, jobDescription)
        : await generateCoverLetter(profile, jobDescription);

      // Wait for the loading animation to complete
      await loadingAnimation;

      // Add a small delay to ensure all checkmarks are visible
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update the modal with the generated content
      setModalContent(content);
      setGeneratedContent(content);
      
      const role = extractRole(jobDescription);
      const contentData = {
        content,
        jobDescription,
        role,
        type: activeTab,
        createdAt: Timestamp.now(),
        userId: user.uid
      };

      // Use the new addNewResume function that handles cleanup
      await addNewResume(user.uid, activeTab, contentData);
      
      // Fetch the latest resumes after adding new one
      const resumesRef = collection(db, 'users', user.uid, activeTab === 'resume' ? 'resumes' : 'coverLetters');
      const q = query(resumesRef, orderBy('createdAt', 'desc'), limit(5));
      const querySnapshot = await getDocs(q);
      
      const latestContent = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setPreviousContent(latestContent);
    } catch (error) {
      console.error('Error generating content:', error);
    }
    setIsGenerating(false);
  };

  const handleCloseModal = () => {
    setShowLoadingModal(false);
    resetSteps();
  };

  const handleDelete = async (id: string, type: 'resume' | 'cover-letter') => {
    if (!user || isDeleting) return;

    setIsDeleting(id);
    try {
      const collectionName = type === 'resume' ? 'resumes' : 'coverLetters';
      await deleteDoc(doc(db, 'users', user.uid, collectionName, id));
      setPreviousContent(previousContent.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting content:', error);
    }
    setIsDeleting(null);
  };

  const handleEdit = (content: Resume) => {
    setEditingContent(content.id);
    setExpandedContent(content.id);
    setEditedContent(content.content);
  };

  const handleSaveEdit = async (id: string) => {
    if (!user) return;

    try {
      const contentRef = doc(db, 'resumes', id);
      await updateDoc(contentRef, {
        content: editedContent
      });
      
      setPreviousContent(previousContent.map(item => 
        item.id === id 
          ? { ...item, content: editedContent }
          : item
      ));
      
      setEditingContent(null);
    } catch (error) {
      console.error('Error saving content:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingContent(null);
    setEditedContent('');
  };

  const toggleExpand = (id: string) => {
    setExpandedContent(expandedContent === id ? null : id);
    if (editingContent && expandedContent !== id) {
      handleCancelEdit();
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
      <div style="font-family: Arial, sans-serif; color: #333; padding: 0;">
        ${formattedSections.join('\n')}
      </div>
    `;
  };

  const downloadAsPDF = async (content: string, role: string) => {
    const formattedContent = formatResumeForPDF(content);
    const element = document.createElement('div');
    element.innerHTML = formattedContent;
    
    const timestamp = new Date().toLocaleDateString().replace(/\//g, '-');
    const type = activeTab === 'resume' ? 'resume' : 'cover-letter';
    const filename = `${type}-${role.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.pdf`;

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

  const downloadAsText = (content: string, role: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toLocaleDateString().replace(/\//g, '-');
    const type = activeTab === 'resume' ? 'resume' : 'cover-letter';
    a.href = url;
    a.download = `${type}-${role.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatResumeDisplay = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.trim() === '') {
        return <br key={index} />;
      }
      if (line.trim() === line.trim().toUpperCase() && line.trim().length > 1) {
        return <h3 key={index} className="text-neon-blue font-bold mt-4 mb-2">{line}</h3>;
      }
      if (line.trim().startsWith('-')) {
        return (
          <p key={index} className="pl-4 mb-1">
            • {line.substring(1).trim()}
          </p>
        );
      }
      return <p key={index} className="mb-1">{line}</p>;
    });
  };

  if (!profile) {
    return (
      <div className="min-h-screen pt-28 px-4 flex items-start justify-center">
        <div className="glass p-8 text-center">
          <h2 className="text-xl text-white mb-4">Complete Your Profile</h2>
          <Link to="/profile" className="glass-button">
            Set Up Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pt-28 pb-12">
      <LoadingModal
        isOpen={showLoadingModal}
        type={activeTab}
        steps={loadingSteps}
        content={modalContent}
        onClose={handleCloseModal}
        downloadAsPDF={downloadAsPDF}
        downloadAsText={downloadAsText}
        jobDescription={jobDescription}
        extractRole={extractRole}
      />
      
      <div className="max-w-4xl mx-auto">
        <TabSelector activeTab={activeTab} onTabChange={handleTabChange} />

        <GenerateContent
          type={activeTab}
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          handleGenerate={handleGenerate}
          isGenerating={isGenerating}
        />

        <ResumeDisplay
          content={generatedContent}
          jobDescription={jobDescription}
          type={activeTab}
          downloadAsPDF={downloadAsPDF}
          downloadAsText={downloadAsText}
          extractRole={extractRole}
          formatResumeDisplay={formatResumeDisplay}
        />

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-blue"></div>
          </div>
        ) : previousContent.length > 0 ? (
          <PreviousResumes
            resumes={previousContent}
            editingResume={editingContent}
            expandedResume={expandedContent}
            editedContent={editedContent}
            isDeleting={isDeleting}
            onToggleExpand={toggleExpand}
            onEdit={handleEdit}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
            onDelete={(id) => handleDelete(id, activeTab)}
            onEditContentChange={setEditedContent}
            downloadAsPDF={downloadAsPDF}
            downloadAsText={downloadAsText}
            formatResumeDisplay={formatResumeDisplay}
          />
        ) : null}
      </div>
    </div>
  );
}