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
import toast from '../lib/toast';
import Diamond from '../components/Diamond';
import { generateResumePDF, generateRawContentPDF } from '../lib/pdfService';

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
  const { user, setUserData, updateCredits, userData } = useAuthStore((state) => ({ 
    user: state.user, 
    setUserData: state.setUserData,
    updateCredits: state.updateCredits,
    userData: state.userData
  }));
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
  const [isDownloading, setIsDownloading] = React.useState(false);

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

    // Check credits before proceeding
    if (!userData || userData.credits < 10) {
      toast.error(
        userData?.credits === 0 
          ? "You have no credits remaining. Please upgrade to continue generating content." 
          : `You need ${10 - (userData?.credits || 0)} more credits. Please upgrade to continue.`
      );
      return;
    }
    
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

      // Use the new addNewResume function that handles cleanup and updates frontend state
      await addNewResume(user.uid, activeTab, contentData, setUserData, updateCredits);
      
      // Fetch latest user data to ensure accurate credit display
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserData(userData);
        updateCredits(userData.credits);
      }
      
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
    try {
      // Try to parse the content as JSON
      const parsedContent = JSON.parse(content);
      
      // If it's already structured data, return it as is
      if (typeof parsedContent === 'object' && parsedContent !== null) {
        return parsedContent;
      }
    } catch (e) {
      // If it's not valid JSON, it's probably raw text
      // Continue with text formatting
    }
    
    // For raw text content, try to extract sections
    const sections: any = {
      personalInfo: {}
    };
    
    // Split content into lines
    const lines = content.split('\n');
    
    // Extract name and contact info from the first lines
    if (lines.length > 0) {
      sections.personalInfo.name = lines[0].trim();
    }
    
    if (lines.length > 1) {
      const contactLine = lines[1].trim();
      
      // Try to extract email, phone, location
      const emailMatch = contactLine.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
      if (emailMatch) {
        sections.personalInfo.email = emailMatch[0];
      }
      
      const phoneMatch = contactLine.match(/(\(\d{3}\)\s*\d{3}-\d{4}|\d{3}-\d{3}-\d{4})/);
      if (phoneMatch) {
        sections.personalInfo.phone = phoneMatch[0];
      }
      
      // Location might be what's left after removing email and phone
      let location = contactLine;
      if (emailMatch) location = location.replace(emailMatch[0], '');
      if (phoneMatch) location = location.replace(phoneMatch[0], '');
      location = location.replace(/\|/g, '').trim();
      
      if (location) {
        sections.personalInfo.location = location;
      }
    }
    
    // Extract sections
    let currentSection = '';
    let sectionContent = '';
    
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if this is a section header
      if (line.toUpperCase() === line && line.length > 0 && !line.includes(':')) {
        // Save previous section
        if (currentSection && sectionContent) {
          sections[currentSection.toLowerCase()] = sectionContent.trim();
        }
        
        // Start new section
        currentSection = line.toLowerCase();
        sectionContent = '';
      } else if (currentSection) {
        // Add to current section
        sectionContent += line + '\n';
      }
    }
    
    // Save the last section
    if (currentSection && sectionContent) {
      sections[currentSection.toLowerCase()] = sectionContent.trim();
    }
    
    // If we couldn't extract structured data, just use the raw content
    if (Object.keys(sections).length <= 1) {
      return content;
    }
    
    return sections;
  };

  const downloadAsPDF = async (content: string, role: string) => {
    try {
      setIsDownloading(true);
      
      console.log('Downloading PDF for role:', role);
      
      // Check if content is a string or an object
      if (typeof content === 'string') {
        // For raw content (like from previous resumes)
        await generateRawContentPDF(content, role);
      } else {
        // For structured data, ensure all fields are included
        const resumeData = {
          ...content,
          skills: content.skills || [], // This will now be an array of skill categories
          hobbies: content.hobbies || [],
          languages: content.languages || []
        };
        await generateResumePDF(resumeData);
      }
      
      toast.success('Resume downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download resume. Please try again.');
    } finally {
      setIsDownloading(false);
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

  // Add a test function to test PDF generation
  const testPdfGeneration = async () => {
    try {
      console.log('Testing PDF generation');
      
      // Test the backend PDF generation endpoint directly
      const response = await fetch(`${import.meta.env.VITE_API_URL}/test-pdf`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Get the PDF as a blob
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const a = document.createElement('a');
      a.href = url;
      a.download = `test_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Append to the document, click it, and remove it
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up the URL object
      window.URL.revokeObjectURL(url);
      
      toast.success('Test PDF downloaded successfully!');
    } catch (error) {
      console.error('Error testing PDF generation:', error);
      toast.error('Failed to test PDF generation. Please try again.');
    }
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
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="flex flex-col space-y-6">
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
            <div className="flex justify-between items-center mb-6">
        <TabSelector activeTab={activeTab} onTabChange={handleTabChange} />
            </div>

        <GenerateContent
          type={activeTab}
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          handleGenerate={handleGenerate}
          isGenerating={isGenerating}
              userData={userData}
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
      </div>
      {import.meta.env.MODE === 'development' && (
        <button
          onClick={testPdfGeneration}
          className="glass-button px-4 py-2 text-sm"
          title="Test PDF Generation"
        >
          Test PDF
        </button>
      )}
    </div>
  );
}