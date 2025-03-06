import React from 'react';
import { useTimeTrack } from '../../context/TimeTrackContext';

const TimeChart = () => {
  const { semaine, decimalVersHeuresMinutes } = useTimeTrack();

  // Génération des données pour le graphique
  const getHeuresData = () => {
    return semaine.jours.map(jour => ({
      jour: jour.jour.substring(0, 3),
      heures: jour.heuresTravaillees
    }));
  };

  // Trouver la valeur maximale pour le graphique
  const getMaxHeures = () => {
    const heures = semaine.jours.map(jour => jour.heuresTravaillees);
    return Math.max(...heures, 8); // Au moins 8h pour l'échelle
  };

  const heuresData = getHeuresData();
  const maxHeures = getMaxHeures();

  // Calculer le total du jour actuel
  const getTotalAujourdhui = () => {
    const aujourdhui = new Date().toISOString().split('T')[0];
    const jourAujourdhui = semaine.jours.find(jour => jour.date === aujourdhui);
    return jourAujourdhui ? jourAujourdhui.heuresTravaillees : 0;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-700">Temps</h2>
        <div className="text-2xl font-bold text-blue-500">
          {decimalVersHeuresMinutes(getTotalAujourdhui())} 
          <span className="text-sm font-normal text-gray-500 ml-1">aujourd'hui</span>
        </div>
      </div>
      
      {/* Graphique */}
      <div className="flex items-end justify-between h-48 mt-6">
        {heuresData.map((data, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="relative w-12">
              <div className="absolute bottom-0 w-full bg-blue-100 rounded-t-md" style={{ height: '100%' }}></div>
              <div 
                className="absolute bottom-0 w-full bg-blue-500 rounded-t-md" 
                style={{ height: `${(data.heures / maxHeures) * 100}%` }}
              ></div>
            </div>
            <div className="mt-2 text-xs text-gray-500">{data.jour}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeChart;