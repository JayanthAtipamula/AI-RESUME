import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Settings, 
  FileText, 
  Activity,
  DollarSign 
} from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  
  const menuItems = [
    { 
      icon: <LayoutDashboard className="w-5 h-5" />, 
      label: 'Admin Dashboard', 
      path: '/' 
    },
    { 
      icon: <Users className="w-5 h-5" />, 
      label: 'User Management', 
      path: '/users' 
    },
    { 
      icon: <CreditCard className="w-5 h-5" />, 
      label: 'Subscription Plans', 
      path: '/subscriptions' 
    },
    { 
      icon: <FileText className="w-5 h-5" />, 
      label: 'Resume Analytics', 
      path: '/analytics' 
    },
    { 
      icon: <DollarSign className="w-5 h-5" />, 
      label: 'Revenue', 
      path: '/revenue' 
    },
    { 
      icon: <Activity className="w-5 h-5" />, 
      label: 'System Status', 
      path: '/status' 
    },
    { 
      icon: <Settings className="w-5 h-5" />, 
      label: 'Admin Settings', 
      path: '/settings' 
    }
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-black border-r border-white/10">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white mb-2">Resume Builder</h1>
        <p className="text-sm text-gray-400 mb-8">Admin Control Panel</p>
        <nav className="space-y-2">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-neon-blue text-black'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
} 