import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, updateDoc, getDoc, setDoc, Timestamp, query, where, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig, 'admin-panel');
export const db = getFirestore(app);

export async function updateUserSubscription(userId: string, plan: 'free' | '1m-pro' | '1y-pro', credits: number) {
  const userRef = doc(db, 'users', userId);
  const now = Timestamp.now();

  try {
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    let subscriptionData = {
      status: 'active',
      plan: plan,
      startDate: now,
      lastCreditUpdate: now,
      credits: credits,
      endDate: now,
    };

    switch (plan) {
      case 'free':
        // Always set credits to 30 for free plan
        subscriptionData.credits = 30;
        // Set endDate to 100 years from now (within Firebase's timestamp limits)
        subscriptionData.endDate = Timestamp.fromDate(
          new Date(now.toDate().getTime() + (100 * 365 * 24 * 60 * 60 * 1000))
        );
        break;
        
      case '1m-pro':
        subscriptionData.credits = credits || 1000;
        // Set expiry to 30 days from now
        subscriptionData.endDate = Timestamp.fromDate(
          new Date(now.toDate().getTime() + 30 * 24 * 60 * 60 * 1000)
        );
        break;
        
      case '1y-pro':
        subscriptionData.credits = credits || 1000;
        // Set expiry to 365 days from now
        subscriptionData.endDate = Timestamp.fromDate(
          new Date(now.toDate().getTime() + 365 * 24 * 60 * 60 * 1000)
        );
        break;
    }

    // Update both subscription and top-level credits
    await updateDoc(userRef, {
      subscription: subscriptionData,
      credits: subscriptionData.credits // This ensures top-level credits match subscription credits
    });

    return subscriptionData;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

// Function to check and update monthly credits for 1y-pro users
export async function updateMonthlyCredits() {
  try {
    const yearlySubsQuery = query(
      collection(db, 'users'),
      where('subscription.plan', '==', '1y-pro'),
      where('subscription.status', '==', 'active')
    );

    const snapshot = await getDocs(yearlySubsQuery);

    for (const doc of snapshot.docs) {
      const userData = doc.data();
      const lastUpdate = userData.subscription.lastCreditUpdate.toDate();
      const now = new Date();
      const monthsSinceUpdate = Math.floor(
        (now.getTime() - lastUpdate.getTime()) / (30 * 24 * 60 * 60 * 1000)
      );

      if (monthsSinceUpdate >= 1) {
        await updateDoc(doc.ref, {
          'subscription.credits': userData.subscription.credits + (1000 * monthsSinceUpdate),
          'subscription.lastCreditUpdate': Timestamp.now()
        });
      }
    }
  } catch (error) {
    console.error('Error updating monthly credits:', error);
  }
}

// Add this function to manually update credits
export async function updateUserCredits(userId: string, credits: number) {
  const userRef = doc(db, 'users', userId);
  
  try {
    await updateDoc(userRef, {
      'subscription.credits': credits,
      'credits': credits // Update both locations
    });
  } catch (error) {
    console.error('Error updating credits:', error);
    throw error;
  }
} 