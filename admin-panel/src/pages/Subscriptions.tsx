import React from 'react';
import { CreditCard, Users, DollarSign } from 'lucide-react';

export default function Subscriptions() {
  const subscriptionStats = [
    {
      title: 'Active Subscriptions',
      value: '234',
      change: '+12%',
      icon: <CreditCard className="w-6 h-6" />
    },
    {
      title: 'Total Revenue',
      value: '$12,345',
      change: '+8%',
      icon: <DollarSign className="w-6 h-6" />
    },
    {
      title: 'Paying Users',
      value: '189',
      change: '+15%',
      icon: <Users className="w-6 h-6" />
    }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Subscription Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {subscriptionStats.map((stat, index) => (
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

      {/* Subscription Plans Table */}
      <div className="glass rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-gray-400">Plan Name</th>
                <th className="text-left p-4 text-gray-400">Price</th>
                <th className="text-left p-4 text-gray-400">Active Users</th>
                <th className="text-left p-4 text-gray-400">Revenue</th>
                <th className="text-left p-4 text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/10">
                <td className="p-4 text-white">Basic Plan</td>
                <td className="p-4 text-white">$10/month</td>
                <td className="p-4 text-white">145</td>
                <td className="p-4 text-white">$1,450</td>
                <td className="p-4">
                  <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-500">
                    Active
                  </span>
                </td>
              </tr>
              {/* Add more plan rows */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 