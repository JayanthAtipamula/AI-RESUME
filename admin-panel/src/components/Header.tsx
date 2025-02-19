import React from 'react';
import { Bell } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-black border-b border-white/10 z-10">
      <div className="flex items-center justify-between h-full px-6">
        <div className="text-white font-semibold">
          Admin Control Panel
        </div>
        <div className="flex items-center gap-4">
          <button className="text-gray-400 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
} 