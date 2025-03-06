import React from 'react';
import { NAV_ITEMS } from '../../constants';
import { Home, Clock, Settings, BarChart2, Users } from 'lucide-react';

// Map des icônes
const iconMap = {
  'Home': Home,
  'Clock': Clock,
  'Settings': Settings,
  'BarChart2': BarChart2,
  'Users': Users
};

const Sidebar = ({ activeSection, onChangeSection }) => {
  // Fonction pour obtenir l'icône
  const getIcon = (iconName) => {
    const Icon = iconMap[iconName];
    return Icon ? <Icon className="w-5 h-5 mr-3" /> : null;
  };

  // Gestionnaire de clic qui met à jour à la fois l'état et l'URL
  const handleSectionChange = (section) => {
    if (!section.disabled) {
      onChangeSection(section);
      window.location.hash = `#/${section}`;
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <nav>
        <ul className="space-y-1">
          {NAV_ITEMS.map(item => (
            <li key={item.id}>
              <button 
                onClick={() => !item.disabled && onChangeSection(item.id)}
                className={`flex items-center w-full px-3 py-2 rounded-md transition-colors ${
                  activeSection === item.id 
                    ? 'bg-blue-50 text-blue-700' 
                    : item.disabled 
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-50'
                }`}
                disabled={item.disabled}
              >
                {getIcon(item.icon)}
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;