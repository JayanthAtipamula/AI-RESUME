import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, collection, query, orderBy, getDocs, deleteDoc, addDoc, serverTimestamp, doc, getDoc, setDoc, updateDoc, runTransaction, where, increment, arrayUnion } from 'firebase/firestore';
import { nanoid } from 'nanoid';

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

// Set persistence to LOCAL (persists even after window/tab is closed)
setPersistence(auth, browserLocalPersistence);

export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async (referralCode?: string) => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Initialize or get user data
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    let isNewUser = false;
    let referrerData = null;
    const now = serverTimestamp();
    
    if (!userSnap.exists()) {
      isNewUser = true;
      const newReferralCode = nanoid(8);

      // Check for valid referral code
      if (referralCode) {
        const referrerQuery = query(
          collection(db, 'users'), 
          where('referralCode', '==', referralCode)
        );
        
        const referrerSnap = await getDocs(referrerQuery);
        
        if (!referrerSnap.empty) {
          const referrerDoc = referrerSnap.docs[0];
          referrerData = referrerDoc.data();
          
          // Update referrer's credits and stats
          await updateDoc(referrerDoc.ref, {
            credits: increment(20),
            'subscription.credits': increment(20),
            referralCount: increment(1),
            referralHistory: arrayUnion({
              userId: user.uid,
              email: user.email,
              timestamp: new Date().toISOString(),
              creditsAwarded: 20
            })
          });
        }
      }

      // Create new user document with referral data
      const newUserData = {
        credits: 30,
        uid: user.uid,
        email: user.email,
        createdAt: now,
        referralCode: newReferralCode,
        referralCount: 0,
        referralHistory: [],
        subscription: {
          credits: 30,
          plan: 'free',
          status: 'active',
          startDate: now,
          endDate: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000),
          lastCreditUpdate: now
        }
      };

      // Add referral data if user was referred
      if (referralCode && referrerData) {
        newUserData.referredBy = {
          uid: referrerData.uid,
          email: referrerData.email,
          referralCode: referralCode,
          timestamp: now
        };
      }

      // Save the new user data
      await setDoc(userRef, newUserData);
    }
    
    // Fetch latest user data after signup/login
    const updatedUserSnap = await getDoc(userRef);
    const userData = updatedUserSnap.data();
    
    return { user, userData, isNewUser };
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
  data: any,
  setUserData: (updater: any) => void,
  updateCredits?: (credits: number) => void
) {
  try {
    // Deduct credits first using transaction
    const newCredits = await deductCredits(userId, 10);
    
    // Update frontend state immediately using both methods for compatibility
    if (updateCredits) {
      updateCredits(newCredits);
    }
    setUserData((prevData: any) => ({
      ...(prevData || {}),
      credits: newCredits,
      uid: userId
    }));
    
    // Add the resume
    const collectionRef = collection(db, 'users', userId, type === 'resume' ? 'resumes' : 'coverLetters');
    const docRef = await addDoc(collectionRef, {
      ...data,
      createdAt: serverTimestamp()
    });
    
    // Cleanup old resumes
    await cleanupOldResumes(userId, type);
    
    return { docRef, credits: newCredits };
  } catch (error) {
    console.error('Error adding new resume:', error);
    throw error;
  }
}

export async function getUserCredits(userId: string) {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error('User not found');
    }
    
    return userSnap.data().credits;
  } catch (error) {
    console.error('Error getting user credits:', error);
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

interface SubscriptionData {
  plan: string;
  billingType: 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  amount: number;
  orderId: string;
  credits: number;
}

export async function updateUserSubscription(userId: string, subscriptionData: SubscriptionData) {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Get current user data
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      throw new Error('User not found');
    }

    // Update user document with subscription data and credits
    await setDoc(userRef, {
      subscription: {
        ...subscriptionData,
        status: 'active',
        updatedAt: serverTimestamp()
      },
      credits: subscriptionData.credits,
      isPremium: true
    }, { merge: true });

    // Add to subscription history
    const historyRef = collection(db, 'users', userId, 'subscriptionHistory');
    await addDoc(historyRef, {
      ...subscriptionData,
      createdAt: serverTimestamp()
    });

  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

export async function deductCredits(userId: string, amount: number = 10) {
  const userRef = doc(db, 'users', userId);
  
  try {
    let newCredits = 0;
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data();
      if (userData.credits < amount) {
        throw new Error('Insufficient credits');
      }
      
      newCredits = userData.credits - amount;
      
      // Update credits atomically
      transaction.update(userRef, {
        credits: newCredits
      });
    });
    
    return newCredits;
  } catch (error) {
    console.error('Error deducting credits:', error);
    throw error;
  }
}