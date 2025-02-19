import React, { useEffect, useState } from 'react';
import { Users, CreditCard, FileText, TrendingUp } from 'lucide-react';
import { collection, query, where, onSnapshot, getDocs, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface DashboardStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalResumes: number;
  totalRevenue: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalResumes: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up real-time listeners for users collection
    const usersRef = collection(db, 'users');
    const usersQuery = query(usersRef);
    
    const unsubscribeUsers = onSnapshot(usersQuery, async (snapshot) => {
      try {
        let totalUsers = snapshot.size;
        let activeSubscriptions = 0;
        let totalRevenue = 0;
        let totalResumes = 0;
        
        // Process each user document
        const userPromises = snapshot.docs.map(async (userDoc) => {
          const userData = userDoc.data();
          
          // Count active subscriptions and revenue
          if (userData.subscription?.status === 'active') {
            activeSubscriptions++;
            if (userData.subscription?.amount) {
              totalRevenue += userData.subscription.amount;
            }
          }
          
          // Get resumes count
          const resumesRef = collection(db, 'users', userDoc.id, 'resumes');
          const resumesSnap = await getDocs(resumesRef);
          return resumesSnap.size;
        });
        
        // Wait for all resume counts
        const resumeCounts = await Promise.all(userPromises);
        totalResumes = resumeCounts.reduce((acc, count) => acc + count, 0);
        
        // Update stats
        setStats({
          totalUsers,
          activeSubscriptions,
          totalResumes,
          totalRevenue
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error processing dashboard data:', error);
        setLoading(false);
      }
    }, (error) => {
      console.error('Error in dashboard listener:', error);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => {
      unsubscribeUsers();
    };
  }, []);

  const statsDisplay = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      change: '+12%',
      icon: <Users className="w-6 h-6" />
    },
    {
      title: 'Active Subscriptions',
      value: stats.activeSubscriptions.toLocaleString(),
      change: '+8%',
      icon: <CreditCard className="w-6 h-6" />
    },
    {
      title: 'Resumes Generated',
      value: stats.totalResumes.toLocaleString(),
      change: '+15%',
      icon: <FileText className="w-6 h-6" />
    },
    {
      title: 'Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      change: '+20%',
      icon: <TrendingUp className="w-6 h-6" />
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsDisplay.map((stat, index) => (
          <div key={index} className="glass p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="text-neon-blue">{stat.icon}</div>
              <span className={`text-sm ${
                stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-400 text-sm">{stat.title}</h3>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="glass p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {/* We can add recent activities here */}
        </div>
      </div>
    </div>
  );
} 