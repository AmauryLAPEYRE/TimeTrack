import React, { useState, useEffect } from 'react';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './components/Dashboard';
import Timesheet from './components/Timesheet';
import Settings from './components/Settings';
import { TimeTrackProvider } from './context/TimeTrackContext';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');

  // Effet pour synchroniser l'état avec le hash de l'URL
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      
      if (hash === '#/dashboard' || hash === '#/') {
        setActiveSection('dashboard');
      } else if (hash === '#/timesheet') {
        setActiveSection('timesheet');
      } else if (hash === '#/settings') {
        setActiveSection('settings');
      } else if (hash === '#/reports') {
        setActiveSection('reports');
      } else if (hash === '#/team') {
        setActiveSection('team');
      }
    };

    // Initialiser au chargement
    handleHashChange();
    
    // Écouter les changements de hash
    window.addEventListener('hashchange', handleHashChange);
    
    // Nettoyage
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Fonction pour changer de section
  const changeSection = (section) => {
    setActiveSection(section);
    window.location.hash = `#/${section}`;
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