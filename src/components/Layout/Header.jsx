import React from 'react';
import { ChevronDown, Clock, Search, Bell } from 'lucide-react';
import { useTimeTrack } from '../../context/TimeTrackContext';

const Header = () => {
  const { salaireInfo } = useTimeTrack();

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <h1 className="ml-2 text-lg font-bold text-gray-800">TimeTrack</h1>
          </div>
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">Pro</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <Bell className="w-5 h-5" />
          </button>
          <div className="relative">
            <button className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                {salaireInfo.prenom ? salaireInfo.prenom.charAt(0) : 'U'}
              </div>
              <span className="text-sm font-medium hidden md:block">
                {salaireInfo.prenom || 'Utilisateur'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;