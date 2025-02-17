import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, query, orderBy, getDocs, deleteDoc, addDoc, serverTimestamp, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const MAX_RESUMES_PER_TYPE = 5;

export async function cleanupOldResumes(userId: string, type: 'resume' | 'cover-letter') {
  try {
    const resumesRef = collection(db, 'users', userId, type === 'resume' ? 'resumes' : 'coverLetters');
    const q = query(resumesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const documents = querySnapshot.docs;
    if (documents.length > MAX_RESUMES_PER_TYPE) {
      const documentsToDelete = documents.slice(MAX_RESUMES_PER_TYPE);
      
      // Delete older documents
      for (const doc of documentsToDelete) {
        await deleteDoc(doc.ref);
      }
    }
  } catch (error) {
    console.error('Error cleaning up old resumes:', error);
    throw error;
  }
}

export async function addNewResume(
  userId: string, 
  type: 'resume' | 'cover-letter',
  data: any
) {
  try {
    const collectionName = type === 'resume' ? 'resumes' : 'coverLetters';
    const resumesRef = collection(db, 'users', userId, collectionName);
    
    // Add the new document
    await addDoc(resumesRef, {
      ...data,
      createdAt: serverTimestamp()
    });
    
    // Clean up old resumes
    await cleanupOldResumes(userId, type);
  } catch (error) {
    console.error('Error adding new resume:', error);
    throw error;
  }
}

export async function shareResume(userId: string, resumeId: string) {
  try {
    // Get the resume from user's collection
    const resumeRef = doc(db, 'users', userId, 'resumes', resumeId);
    const resumeSnap = await getDoc(resumeRef);
    
    if (!resumeSnap.exists()) {
      throw new Error('Resume not found');
    }

    const resumeData = resumeSnap.data();
    
    // Create a copy in the shared collection
    const sharedRef = doc(db, 'shared_resumes', resumeId);
    await setDoc(sharedRef, {
      ...resumeData,
      userId,
      sharedAt: serverTimestamp()
    });

    return resumeId;
  } catch (error) {
    console.error('Error sharing resume:', error);
    throw error;
  }
}