import React, { useState } from 'react';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './components/Dashboard';
import Timesheet from './components/Timesheet';
import Settings from './components/Settings';
import { TimeTrackProvider } from './context/TimeTrackContext';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');

  // Fonction pour changer de section
  const changeSection = (section) => {
    setActiveSection(section);
  };

  // Rendu du contenu en fonction de la section active
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'timesheet':
        return <Timesheet />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <TimeTrackProvider>
      <MainLayout activeSection={activeSection} onChangeSection={changeSection}>
        {renderContent()}
      </MainLayout>
    </TimeTrackProvider>
  );
}

export default App;