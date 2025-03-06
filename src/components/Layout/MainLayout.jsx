import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useTimeTrack } from '../../context/TimeTrackContext';

const MainLayout = ({ children, activeSection, onChangeSection }) => {
  const { formatDateRange } = useTimeTrack();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* En-tête */}
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row">
          {/* Barre latérale */}
          <aside className="w-full md:w-56 mb-6 md:mb-0 md:mr-6">
            <Sidebar 
              activeSection={activeSection} 
              onChangeSection={onChangeSection} 
            />
          </aside>
          
          {/* Contenu principal */}
          <main className="flex-1">
            {/* En-tête du contenu */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {activeSection === 'dashboard' ? 'Dashboard' :
                   activeSection === 'timesheet' ? 'Timesheet' : 'Paramètres'}
                </h1>
                <p className="text-gray-500">{formatDateRange()}</p>
              </div>
            </div>
            
            {/* Contenu de la section */}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;