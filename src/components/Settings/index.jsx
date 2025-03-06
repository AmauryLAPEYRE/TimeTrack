import React, { useState, useEffect } from 'react';
import { useTimeTrack } from '../../context/TimeTrackContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from 'lucide-react';

const Settings = () => {
  const { 
    salaireInfo, 
    setSalaireInfo,
    setSelectedMonth,
    selectedMonth,
    generateMonthData,
    weeksOfMonth,
    formatMonthName
  } = useTimeTrack();
  
  const [yearMonth, setYearMonth] = useState(selectedMonth || new Date().toISOString().substring(0, 7));

  // Charger les données au montage du composant
  useEffect(() => {
    if (selectedMonth) {
      setYearMonth(selectedMonth);
    }
  }, [selectedMonth]);

  // Formater une date pour l'affichage
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return format(date, 'd MMM', { locale: fr });
  };

  // Gestionnaire de changement de mois et année
  const handleMonthChange = (e) => {
    const newValue = e.target.value;
    setYearMonth(newValue);
  };

  // Application du mois et génération des semaines
  const handleApplyMonth = () => {
    setSelectedMonth(yearMonth);
    generateMonthData(yearMonth);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Paramètres</h2>
      
      {/* Informations personnelles */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Informations personnelles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <input 
              type="text" 
              className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={salaireInfo.prenom}
              onChange={(e) => setSalaireInfo({...salaireInfo, prenom: e.target.value})}
              placeholder="Prénom"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input 
              type="text" 
              className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={salaireInfo.nom}
              onChange={(e) => setSalaireInfo({...salaireInfo, nom: e.target.value})}
              placeholder="Nom"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Société</label>
            <input 
              type="text" 
              className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={salaireInfo.societe}
              onChange={(e) => setSalaireInfo({...salaireInfo, societe: e.target.value})}
              placeholder="Société"
            />
          </div>
        </div>
      </div>
      
      {/* Paramètres de calcul */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Paramètres de calcul</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heures contractuelles par jour</label>
            <input 
              type="number" 
              min="0"
              step="0.5"
              className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={salaireInfo.heuresContractuelles}
              onChange={(e) => setSalaireInfo({...salaireInfo, heuresContractuelles: parseFloat(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seuil hebdomadaire (heures)</label>
            <input 
              type="number"
              min="0"
              step="0.5"
              className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={salaireInfo.seuilHebdo}
              onChange={(e) => setSalaireInfo({...salaireInfo, seuilHebdo: parseFloat(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seuil pour HS à 50%</label>
            <input 
              type="number"
              min="0"
              step="0.5"
              className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={salaireInfo.seuilHS2}
              onChange={(e) => setSalaireInfo({...salaireInfo, seuilHS2: parseFloat(e.target.value)})}
            />
          </div>
        </div>
      </div>
      
      {/* Sélection du mois */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Période</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mois et année</label>
            <input 
              type="month" 
              className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={yearMonth}
              onChange={handleMonthChange}
            />
            <p className="mt-1 text-sm text-gray-500">
              Sélectionnez le mois pour générer automatiquement les semaines
            </p>
          </div>
          
          <div className="flex items-end">
            <button 
              onClick={handleApplyMonth}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Appliquer et générer les semaines
            </button>
          </div>
        </div>
        
        {selectedMonth && weeksOfMonth.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Semaines générées pour {formatMonthName()}
            </h4>
            <p className="text-sm text-blue-600 mb-4">
              {weeksOfMonth.reduce((total, week) => total + week.jours.length, 0)} jours répartis sur {weeksOfMonth.length} semaines
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {weeksOfMonth.map((week, index) => (
                <div key={index} className="bg-white p-3 rounded-md shadow-sm">
                  <div className="font-medium text-gray-800">Semaine {week.numeroSemaine}</div>
                  <div className="text-sm text-gray-600">
                    {formatDate(week.dateDebut)} au {formatDate(week.dateFin)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{week.jours.length} jours</div>
                  <div className="mt-2 text-xs">
                    <div className="flex flex-wrap gap-1">
                      {week.jours.map((jour, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">
                          {jour.date.substr(8, 2)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-md">
        <h3 className="text-md font-medium text-blue-800 mb-2">Informations</h3>
        <p className="text-sm text-blue-700">
          Ces paramètres permettent de configurer le calcul des heures supplémentaires selon les règles 
          de votre entreprise. Le seuil hebdomadaire est généralement de 35 heures, et le seuil pour 
          les heures supplémentaires à 50% est généralement de 43 heures.
        </p>
        <p className="mt-2 text-sm text-blue-700">
          Pour les semaines partielles (début ou fin de mois), le calcul des heures est ajusté proportionnellement 
          au nombre de jours ouvrés présents dans la semaine.
        </p>
      </div>
    </div>
  );
};

export default Settings;