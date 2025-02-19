import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Search, Edit2 } from 'lucide-react';
import EditUserModal from '../components/EditUserModal';

interface User {
  id: string;
  email: string;
  createdAt: Timestamp;
  credits: number;
  uid: string;
  subscription: {
    credits: number;
    plan: 'free' | '1m-pro' | '1y-pro';
    status: 'active' | 'inactive';
    startDate: Timestamp;
    endDate: Timestamp;
    lastCreditUpdate: Timestamp;
  };
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'users'), 
        orderBy('createdAt', 'desc'), 
        limit(100)
      );
      const querySnapshot = await getDocs(q);
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserUpdate = async () => {
    await fetchUsers(); // Reload all users when one is updated
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Users ({users.length})</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users..."
            className="glass pl-10 pr-4 py-2 rounded-lg w-64 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="glass rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-gray-400">Email</th>
                <th className="text-left p-4 text-gray-400">Plan</th>
                <th className="text-left p-4 text-gray-400">Credits</th>
                <th className="text-left p-4 text-gray-400">Status</th>
                <th className="text-left p-4 text-gray-400">Start Date</th>
                <th className="text-left p-4 text-gray-400">Expiry</th>
                <th className="text-left p-4 text-gray-400">Last Credit Update</th>
                <th className="text-left p-4 text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center p-4 text-gray-400">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-blue"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id} className="border-b border-white/10">
                  <td className="p-4 text-white">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.subscription?.plan === 'free'
                        ? 'bg-gray-500/20 text-gray-400'
                        : user.subscription?.plan === '1m-pro'
                        ? 'bg-blue-500/20 text-blue-500'
                        : 'bg-purple-500/20 text-purple-500'
                    }`}>
                      {user.subscription?.plan || 'free'}
                    </span>
                  </td>
                  <td className="p-4 text-white">{user.subscription?.credits || 0}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.subscription?.status === 'active'
                        ? 'bg-green-500/20 text-green-500'
                        : 'bg-red-500/20 text-red-500'
                    }`}>
                      {user.subscription?.status || 'inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-white">
                    {user.subscription?.startDate?.toDate().toLocaleDateString()}
                  </td>
                  <td className="p-4 text-white">
                    {user.subscription?.endDate?.toDate().toLocaleDateString()}
                  </td>
                  <td className="p-4 text-white">
                    {user.subscription?.lastCreditUpdate?.toDate().toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUpdate={handleUserUpdate}
        />
      )}
    </div>
  );
}