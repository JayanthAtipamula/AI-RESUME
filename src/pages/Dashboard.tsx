import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, query, where, getDocs, deleteDoc, updateDoc, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db, addNewResume, deductCredits } from '../lib/firebase';
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
import classNames from 'classnames';
import { extractTextFromResume } from '../lib/ocrService';
import { testPdfConfig, testPdfExtraction } from '../lib/pdfUtils';

// Type declarations for missing modules
declare module 'html2pdf.js';
declare module 'classnames';

interface Resume {
  id: string;
  content: string;
  jobDescription: string;
  createdAt: Timestamp;
  role?: string;
  type: 'resume' | 'cover-letter';
  userId: string;
}

// Add this debugging function at the top of the file
const debugLog = (message: string, data?: any) => {
  const prefix = '[Debug]';
  if (data) {
    console.log(`${prefix} ${message}`, data);
  } else {
    console.log(`${prefix} ${message}`);
  }
};

// Add this fallback method to handle PDF text extraction without PDF.js
const extractTextFallback = async (file: File): Promise<string> => {
  debugLog('Using OCR fallback for PDF extraction');
  try {
    // Create a FormData object to send the file to the server
    const formData = new FormData();
    formData.append('file', file);
    
    // If there's a server endpoint for OCR, use it
    // Otherwise this is just a placeholder for now
    return `Failed to extract text from PDF using client-side methods. 
    
Please ensure you've uploaded a text-based PDF rather than a scanned image.
    
Alternatively, you can copy and paste the text from your resume directly into the job description field and use that instead.`;
  } catch (error) {
    debugLog('OCR fallback also failed', error);
    throw new Error('Could not extract text from the PDF document.');
  }
};

export default function Dashboard() {
  const { user, setUserData, updateCredits, userData } = useAuthStore((state) => ({ 
    user: state.user, 
    setUserData: state.setUserData,
    updateCredits: state.updateCredits,
    userData: state.userData
  }));
  const [activeTab, setActiveTab] = React.useState<'resume' | 'cover-letter' | 'my-plan'>('resume');
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

  const [isLoading, setIsLoading] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const [subscriptionData, setSubscriptionData] = React.useState<any>(null);

  const [showProfileModal, setShowProfileModal] = useState(false);

  const [useExistingResume, setUseExistingResume] = useState(true);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', current: activeTab === 'resume' },
    { name: 'My Plan', href: '/dashboard?tab=myplan', current: activeTab === 'my-plan' },
  ];

  const location = useLocation();
  const navigate = useNavigate();

  const getLoadingSteps = (type: 'resume' | 'cover-letter' | 'my-plan') => {
    if (type === 'resume' || type === 'my-plan') {
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
    // Reset all states when changing tabs
    setEditingContent(null);
    setExpandedContent(null);
    setEditedContent('');
    // Also reset file upload and generation method states
    setResumeFile(null);
    // Set useExistingResume based on tab type
    setUseExistingResume(tab === 'resume'); // true for resume, false for cover letter
    // Reset loading steps for the new tab
    setLoadingSteps(getLoadingSteps(tab));
    // Clear URL parameters when switching tabs
    window.history.pushState({}, '', '/dashboard');
  };

  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    
    if (tabParam === 'myplan') {
      setActiveTab('my-plan');
    } else {
      // If no tab parameter or invalid parameter, default to resume
      if (activeTab === 'my-plan') {
        setActiveTab('resume');
      }
    }
    
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

    const fetchSubscriptionData = async () => {
      if (user && (activeTab === 'my-plan' || tabParam === 'myplan')) {
        try {
          // Only set loading when we actually need to fetch
          setIsLoading(true);
          
          // Fetch user document from Firebase
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            
            // Store the subscription data separately
            if (userData.subscription) {
              setSubscriptionData(userData.subscription);
            } else {
              // If subscription is not in the expected location, try to find it
              setSubscriptionData({
                credits: userData.credits || 0,
                endDate: userData.subscriptionEndDate,
                lastCreditUpdate: userData.lastCreditUpdate,
                plan: userData.planType || 'free',
                startDate: userData.subscriptionStartDate,
                status: userData.isPremium ? 'active' : 'inactive'
              });
            }
            
            // Update the user data in the store
            setUserData(userData);
          }
          
          // End loading state
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching subscription data:', error);
          setIsLoading(false);
        }
      }
    };

    const fetchPreviousContent = async () => {
      if (user && activeTab !== 'my-plan') {
        // Only set loading when we have content to fetch
        setIsLoading(true);
        
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
    fetchSubscriptionData();
    if (activeTab !== 'my-plan') {
    fetchPreviousContent();
    }
  }, [user, activeTab, location.search]);

  const extractRole = (jobDesc: string) => {
    const firstLine = jobDesc.split('\n')[0];
    const roleMatch = firstLine.match(/^(.*?)(position|role|job|opening)/i);
    return roleMatch ? roleMatch[1].trim() : 'Position';
  };

  const handleGenerate = async () => {
    debugLog('Starting resume generation process');
    
    if (!user) {
      debugLog('No user found, aborting');
      toast.error('Please sign in to generate a resume');
      return;
    }

    debugLog('User data', userData);
    
    // Check for credits first
    if (!userData || userData.credits < 10) {
      debugLog('Not enough credits', userData?.credits);
      toast.error('Not enough credits. Please upgrade your plan.');
      return;
    }
    
    // Check required data based on generation method
    if (useExistingResume) {
      debugLog('Using existing resume mode', { filePresent: !!resumeFile });
      if (!resumeFile) {
        toast.error('Please upload a resume file');
        return;
      }
    } else {
      debugLog('Using profile data mode', { profilePresent: !!profile });
      if (!profile || Object.keys(profile).length === 0) {
        setShowProfileModal(true);
        return;
      }
    }

    if (!jobDescription) {
      debugLog('Missing job description');
      toast.error('Please provide a job description');
      return;
    }

    try {
      // Start generation process
      setIsGenerating(true);
      
      // Reset steps and set the right steps based on the current tab and generation method
      resetSteps();
      
      // Set the proper loading steps based on what we're generating
      const steps = getLoadingSteps(activeTab);
      if (useExistingResume) {
        // Customize steps for resume upload flow
        steps[0].text = 'Analyzing Uploaded Resume';
      } else {
        // Customize steps for job description to resume/cover letter flow
        steps[0].text = activeTab === 'resume' ? 'Analyzing Job Requirements' : 'Analyzing Job Description';
      }
      setLoadingSteps(steps);
      
      setShowLoadingModal(true);
      simulateProgress();
      debugLog('Started loading animation and progress simulation');

      // Generate content
      let content;
      
      if (useExistingResume && resumeFile) {
        debugLog('Processing uploaded resume file', resumeFile.name);
        try {
          // First test if PDF.js is correctly configured
          debugLog('Testing PDF.js configuration');
          const configOk = await testPdfConfig();
          debugLog('PDF.js configuration test result:', configOk);
          
          // Extract text from resume
          setModalContent('Analyzing your existing resume...');
          updateStep('profile'); // Mark first step as completed immediately
          debugLog('Starting text extraction from resume file');
          
          let resumeText = '';
          
          // Try the direct extraction
          try {
            // Test the extraction to get more diagnostic info
            const extractionTest = await testPdfExtraction(resumeFile);
            debugLog('PDF extraction test successful', { textSample: extractionTest.substring(0, 100) });
            
            resumeText = await extractTextFromResume(resumeFile);
            debugLog('Text extracted successfully', { textLength: resumeText.length });
            updateStep('job'); // Mark job analysis step complete after extraction
          } catch (extractionError) {
            debugLog('PDF extraction error, trying fallback method', extractionError);
            
            try {
              // Try using the fallback method
              resumeText = await extractTextFallback(resumeFile);
              debugLog('Fallback extraction provided text', { textLength: resumeText.length });
              updateStep('job'); // Mark job analysis step complete after fallback
            } catch (fallbackError) {
              debugLog('All extraction methods failed', fallbackError);
              throw new Error('Could not extract text from the PDF. Please try a different file or use your profile data.');
            }
          }
          
          // Check if we have meaningful text
          if (!resumeText || resumeText.trim().length < 50) {
            debugLog('Extracted text is too short or empty', { text: resumeText });
            throw new Error('The extracted text from your PDF is too short or empty. Please try a different file or use your profile data.');
          }
          
          // Generate resume from extracted text
          setModalContent('Generating ATS-friendly content...');
          updateStep('generate'); // Mark generation step in progress
          debugLog('Starting resume generation with extracted text');
          content = await generateResume(
            { resumeText },
            jobDescription,
            true
          );
          
          // Update ATS scores
          updateStep('score');
          updateStep('match');
          
          // Make sure generated content is saved and displayed properly
          debugLog('Resume generated successfully from uploaded file', { contentLength: content.length });
          
        } catch (error) {
          debugLog('Error in resume upload processing', error);
          console.error('Error with resume upload processing:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          toast.error(`Error processing your resume: ${errorMessage}. Please try again or use profile data instead.`);
          setIsGenerating(false);
          setShowLoadingModal(false);
          return;
        }
      } else {
        // Use profile data to generate resume
        debugLog('Using profile data for generation');
        setModalContent('Generating ATS-friendly content...');
        updateStep('profile'); // Mark profile analysis step complete
        await new Promise(resolve => setTimeout(resolve, 1000)); // Add delay for visual effect

        updateStep('job'); // Mark job analysis step complete
        await new Promise(resolve => setTimeout(resolve, 1000)); // Add delay for visual effect

        // Start generation with visual indicator
        setModalContent(`Generating ATS-friendly ${activeTab === 'resume' ? 'resume' : 'cover letter'}...`);
        updateStep('generate'); // Mark generation step in progress
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay before generation

        // Generate the content
        content = activeTab === 'resume' 
          ? await generateResume(profile, jobDescription, false)
          : await generateCoverLetter(profile, jobDescription);

        // Update ATS scores with visual delays
        await new Promise(resolve => setTimeout(resolve, 800)); // Delay for generation completion
        updateStep('score');

        await new Promise(resolve => setTimeout(resolve, 800)); // Delay between score and match
        updateStep('match');

        debugLog('Content generated successfully using profile data');
      }

      // Set generated content
      debugLog('Setting generated content', { contentLength: content.length });
      setGeneratedContent(content);
      
      // Update modal content to show the generated content
      setModalContent(content);
      
      // Save to database
      const type = activeTab === 'resume' ? 'resume' : 'cover-letter';
      const collectionName = activeTab === 'resume' ? 'resumes' : 'coverLetters';
      const role = extractRole(jobDescription);
      
      debugLog('Saving to database', { type, collectionName, role });
      await addNewResume(user.uid, {
        userId: user.uid,
        content,
        jobDescription,
        createdAt: new Date(),
        role,
        type
      }, collectionName);
      debugLog('Saved to database successfully');
      
      // Complete all steps to ensure modal shows content view
      loadingSteps.forEach(step => {
        if (!step.completed) {
          updateStep(step.id);
        }
      });
      
      // Deduct credits
      debugLog('Deducting credits');
      const newCredits = await deductCredits(user.uid);
      debugLog('Credits deducted', { newCredits });
      updateCredits(newCredits);
      debugLog('Updated user data with new credits');

      // Fetch updated resume list
      debugLog('Fetching updated resume list');
      const contentRef = collection(db, 'users', user.uid, collectionName);
      const q = query(contentRef, orderBy('createdAt', 'desc'), limit(5));
      const querySnapshot = await getDocs(q);

      const updatedContent: Resume[] = [];
      querySnapshot.forEach((doc) => {
        updatedContent.push({ 
          id: doc.id,
          ...doc.data()
        } as Resume);
      });

      setPreviousContent(updatedContent);
      debugLog('Updated previous content list successfully', { count: updatedContent.length });
      
    } catch (error) {
      debugLog('Error in overall generation process', error);
      console.error('Error generating content:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Error generating content: ${errorMessage}. Please try again.`);
    } finally {
      // Update this part to keep modal open but stop the loading animation
      debugLog('Generation process completed');
      setIsGenerating(false);
      
      // Reset file upload state if generation was successful
      if (generatedContent) {
        debugLog('Resetting file upload state');
        setResumeFile(null);
        setUseExistingResume(false);
      }
      
      // Complete all steps in the loading process
      loadingSteps.forEach(step => {
        if (!step.completed) {
          updateStep(step.id);
        }
      });
      
      // Don't automatically close the modal - user will close it
      // setShowLoadingModal(false);
    }
  };

  const handleCloseModal = () => {
    setShowLoadingModal(false);
    resetSteps();
    setModalContent(null); // Reset modal content when closing
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

  const handleNavigation = (itemName: string) => {
    switch (itemName) {
      case 'Dashboard':
        setActiveTab('resume');
        setGeneratedContent('');
        setJobDescription('');
        setEditingContent(null);
        setExpandedContent(null);
        setEditedContent('');
        window.history.pushState({}, '', '/dashboard');
        break;
      case 'My Plan':
        setActiveTab('my-plan');
        window.history.pushState({}, '', '/dashboard?tab=myplan');
        break;
    }
  };

  // Add a function to calculate subscription progress
  const calculateSubscriptionProgress = (startDate: Date, endDate: Date) => {
    const now = new Date();
    const total = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    
    // Return percentage (capped between 0-100)
    return Math.min(100, Math.max(0, Math.floor((elapsed / total) * 100)));
  };

  // Add a function to format dates consistently
  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
      timeZoneName: 'short'
    });
  };

  // Add the profile completion modal component
  const ProfileCompletionModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const navigate = useNavigate();

    return (
      <div className={`fixed inset-0 flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
        <div className="bg-zinc-900 p-6 rounded-lg shadow-xl relative z-10 max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-white mb-4">Complete Your Profile</h2>
          <p className="text-gray-400 mb-6">
            Please complete your profile to generate content. This helps us create better tailored resumes and cover letters for you.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="glass-button px-4 py-2"
              onClick={() => {
                navigate('/profile');
                onClose();
              }}
            >
            Set Up Profile
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="flex flex-col space-y-6">
      <LoadingModal
        isOpen={showLoadingModal}
        type={activeTab === 'my-plan' ? 'resume' : activeTab}
        contentType={activeTab === 'resume' ? 'Resume' : 'Cover Letter'}
        steps={loadingSteps}
        content={modalContent}
        onClose={handleCloseModal}
        downloadAsPDF={downloadAsPDF}
        downloadAsText={downloadAsText}
        jobDescription={jobDescription}
        extractRole={extractRole}
        loadingSteps={loadingSteps}
        resetSteps={resetSteps}
        activeTab={activeTab}
      />
      
      <div className="max-w-4xl mx-auto">
            {/* Only show TabSelector when not on My Plan page */}
            {activeTab !== 'my-plan' && (
            <div className="flex justify-between items-center mb-6">
        <TabSelector activeTab={activeTab} onTabChange={handleTabChange} />
            </div>
            )}

            {activeTab !== 'my-plan' && (
              <>
        <GenerateContent
          type={activeTab}
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          handleGenerate={handleGenerate}
          isGenerating={isGenerating}
              userData={userData}
                  resumeFile={resumeFile}
                  setResumeFile={setResumeFile}
                  useExistingResume={useExistingResume}
                  setUseExistingResume={setUseExistingResume}
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
              </>
            )}

            {activeTab === 'my-plan' && (
              <div className="mt-6 bg-black shadow sm:rounded-lg p-6 border border-gray-800">
                <h2 className="text-2xl font-bold mb-4 text-white">My Current Plan</h2>
                
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-blue"></div>
                  </div>
                ) : subscriptionData ? (
                  <div className="space-y-6">
                    <div className="bg-zinc-900 rounded-lg p-4 border border-gray-800">
                      <h3 className="text-lg font-semibold text-neon-blue mb-3">subscription</h3>
                      
                      <div className="space-y-3 pl-4">
                        {subscriptionData.endDate && (
                          <div className="flex items-start">
                            <div className="font-medium text-gray-400 w-40">endDate:</div>
                            <div className="font-semibold text-white">
                              {subscriptionData.endDate instanceof Date 
                                ? subscriptionData.endDate.toLocaleString()
                                : new Date(subscriptionData.endDate.seconds * 1000).toLocaleString()}
                            </div>
                          </div>
                        )}
                        
                        {subscriptionData.lastCreditUpdate && (
                          <div className="flex items-start">
                            <div className="font-medium text-gray-400 w-40">lastCreditUpdate:</div>
                            <div className="font-semibold text-white">
                              {subscriptionData.lastCreditUpdate instanceof Date 
                                ? subscriptionData.lastCreditUpdate.toLocaleString()
                                : new Date(subscriptionData.lastCreditUpdate.seconds * 1000).toLocaleString()}
                            </div>
                          </div>
                        )}
                        
                        {subscriptionData.plan && (
                          <div className="flex items-start">
                            <div className="font-medium text-gray-400 w-40">plan:</div>
                            <div className="font-semibold text-white">
                              "{subscriptionData.plan}"
                            </div>
                          </div>
                        )}
                        
                        {subscriptionData.startDate && (
                          <div className="flex items-start">
                            <div className="font-medium text-gray-400 w-40">startDate:</div>
                            <div className="font-semibold text-white">
                              {subscriptionData.startDate instanceof Date 
                                ? subscriptionData.startDate.toLocaleString()
                                : new Date(subscriptionData.startDate.seconds * 1000).toLocaleString()}
                            </div>
                          </div>
                        )}
                        
                        {subscriptionData.status && (
                          <div className="flex items-start">
                            <div className="font-medium text-gray-400 w-40">status:</div>
                            <div className="font-semibold text-white">
                              "{subscriptionData.status}"
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Subscription Progress Bar */}
                    {subscriptionData.startDate && subscriptionData.endDate && (
                      <div className="bg-zinc-900 rounded-lg p-4 border border-gray-800">
                        <h3 className="text-lg font-semibold text-neon-blue mb-3">Subscription Period</h3>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-gray-400">
                            <span>Start: {new Date(
                              subscriptionData.startDate instanceof Date 
                                ? subscriptionData.startDate 
                                : subscriptionData.startDate.seconds * 1000
                            ).toLocaleDateString()}</span>
                            <span>End: {new Date(
                              subscriptionData.endDate instanceof Date 
                                ? subscriptionData.endDate 
                                : subscriptionData.endDate.seconds * 1000
                            ).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="w-full bg-gray-800 rounded-full h-2.5">
                            {(() => {
                              const startDate = new Date(
                                subscriptionData.startDate instanceof Date 
                                  ? subscriptionData.startDate 
                                  : subscriptionData.startDate.seconds * 1000
                              );
                              const endDate = new Date(
                                subscriptionData.endDate instanceof Date 
                                  ? subscriptionData.endDate 
                                  : subscriptionData.endDate.seconds * 1000
                              );
                              const now = new Date();
                              const total = endDate.getTime() - startDate.getTime();
                              const elapsed = now.getTime() - startDate.getTime();
                              const progress = Math.min(100, Math.max(0, Math.floor((elapsed / total) * 100)));
                              
                              return (
                                <div 
                                  className="bg-neon-blue h-2.5 rounded-full" 
                                  style={{ width: `${progress}%` }}
                                ></div>
                              );
                            })()}
                          </div>
                          
                          <div className="text-center text-sm text-gray-400 mt-1">
                            {(() => {
                              const startDate = new Date(
                                subscriptionData.startDate instanceof Date 
                                  ? subscriptionData.startDate 
                                  : subscriptionData.startDate.seconds * 1000
                              );
                              const endDate = new Date(
                                subscriptionData.endDate instanceof Date 
                                  ? subscriptionData.endDate 
                                  : subscriptionData.endDate.seconds * 1000
                              );
                              const now = new Date();
                              const total = endDate.getTime() - startDate.getTime();
                              const elapsed = now.getTime() - startDate.getTime();
                              const progress = Math.min(100, Math.max(0, Math.floor((elapsed / total) * 100)));
                              const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                              
                              return (
                                <>
                                  <span className="font-medium">{progress}% used</span>
                                  <span className="mx-2">•</span>
                                  <span>{daysRemaining} days remaining</span>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-6 flex space-x-4">
                      <button
                        type="button"
                        className="glass-button px-4 py-2 flex items-center gap-2"
                        onClick={() => {
                          // Navigate to home page and scroll to pricing section
                          navigate('/');
                          // Add a small delay to ensure navigation completes before scrolling
                          setTimeout(() => {
                            const pricingSection = document.getElementById('pricing');
                            if (pricingSection) {
                              pricingSection.scrollIntoView({ behavior: 'smooth' });
                            }
                          }, 100);
                        }}
                      >
                        Upgrade Plan
                      </button>
                      
                      {subscriptionData.status === 'active' && (
                        <button
                          type="button"
                          className="glass-button-secondary px-4 py-2 flex items-center gap-2"
                          onClick={() => {
                            window.open('https://billing.stripe.com/p/login/test_28o5nA9Ot8Ys9yw288', '_blank');
                          }}
                        >
                          Manage Subscription
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No subscription data available.</p>
                    <button
                      type="button"
                      className="glass-button px-4 py-2 mt-4"
                      onClick={() => {
                        window.location.href = '/pricing';
                      }}
                    >
                      Get Started
                    </button>
                  </div>
                )}
              </div>
            )}
      </div>
        </div>
      </div>
      
      {/* Add the profile completion modal */}
      <ProfileCompletionModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
    </div>
  );
}