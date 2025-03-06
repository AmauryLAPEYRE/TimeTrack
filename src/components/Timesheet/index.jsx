import React, { useEffect } from 'react';
import TimeEntryRow from './TimeEntryRow';
import ExportButton from '../Common/ExportButton';
import { useTimeTrack } from '../../context/TimeTrackContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock, AlertTriangle } from 'lucide-react';

const Timesheet = () => {
  const { 
    semaine, 
    resultats, 
    weeksOfMonth,
    activeWeekIndex,
    setActiveWeek,
    selectedMonth,
    formatMonthName,
    decimalVersHeuresMinutes
  } = useTimeTrack();

  // Formatage de date pour le sélecteur de semaine
  const formatWeekRange = (dateDebut, dateFin) => {
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return format(date, 'd MMM', { locale: fr });
    };
    
    return `${formatDate(dateDebut)} - ${formatDate(dateFin)}`;
  };

  // Gestionnaire de changement de semaine
  const handleWeekChange = (e) => {
    const index = parseInt(e.target.value);
    setActiveWeek(index);
  };

  // Naviguer à la semaine précédente
  const goToPreviousWeek = () => {
    if (activeWeekIndex > 0) {
      setActiveWeek(activeWeekIndex - 1);
    }
  };

  // Naviguer à la semaine suivante
  const goToNextWeek = () => {
    if (activeWeekIndex < weeksOfMonth.length - 1) {
      setActiveWeek(activeWeekIndex + 1);
    }
  };

  // Récupérer la fonction onChangeSection du contexte parent
  const goToSettings = () => {
    // Utiliser directement la mise à jour du hash pour la navigation
    window.location.hash = '#/settings';
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Saisie des heures</h2>
          {selectedMonth && (
            <p className="text-gray-500 capitalize">{formatMonthName()}</p>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row gap-2 mt-2 md:mt-0">
          {weeksOfMonth.length > 0 && (
            <div className="flex items-center space-x-2">
              <button 
                onClick={goToPreviousWeek}
                disabled={activeWeekIndex === 0}
                className={`p-1 rounded-full ${activeWeekIndex === 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="min-w-[250px]">
                <select 
                  className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={activeWeekIndex}
                  onChange={handleWeekChange}
                >
                  {weeksOfMonth.map((week, index) => (
                    <option key={index} value={index}>
                      Semaine {week.numeroSemaine} ({formatWeekRange(week.dateDebut, week.dateFin)})
                    </option>
                  ))}
                </select>
              </div>
              
              <button 
                onClick={goToNextWeek}
                disabled={activeWeekIndex === weeksOfMonth.length - 1}
                className={`p-1 rounded-full ${activeWeekIndex === weeksOfMonth.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
          <ExportButton />
        </div>
      </div>
      
      {weeksOfMonth.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jour</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absence</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" colSpan="2">Matin</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" colSpan="2">Après-midi</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commentaire</th>
              </tr>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-1"></th>
                <th className="px-4 py-1"></th>
                <th className="px-4 py-1"></th>
                <th className="px-4 py-1"></th>
                <th className="px-4 py-1 text-xs font-medium text-gray-500 text-center">Début</th>
                <th className="px-4 py-1 text-xs font-medium text-gray-500 text-center">Fin</th>
                <th className="px-4 py-1 text-xs font-medium text-gray-500 text-center">Début</th>
                <th className="px-4 py-1 text-xs font-medium text-gray-500 text-center">Fin</th>
                <th className="px-4 py-1"></th>
                <th className="px-4 py-1"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {semaine.jours.map((jour, index) => (
                <TimeEntryRow key={index} jour={jour} index={index} />
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td colSpan="8" className="px-4 py-3 text-right font-medium text-gray-700">
                  <div className="flex items-center justify-end">
                    <Clock className="w-4 h-4 mr-2 text-blue-600" />
                    <span>Total des heures travaillées :</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                    {decimalVersHeuresMinutes(resultats.totalHeuresTravaillees)}
                  </span>
                </td>
                <td></td>
              </tr>
              <tr>
                <td colSpan="8" className="px-4 py-3 text-right font-medium text-gray-700">
                  <div className="flex items-center justify-end">
                    <span className="w-3 h-3 rounded-full bg-gray-400 mr-2"></span>
                    <span>Heures diverses :</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-lg border border-gray-300">
                    {decimalVersHeuresMinutes(resultats.heuresDiverses)}
                  </span>
                </td>
                <td className="px-4 py-1 text-xs text-gray-500 italic">Sans majoration</td>
              </tr>
              <tr>
                <td colSpan="8" className="px-4 py-3 text-right font-medium text-gray-700">
                  <div className="flex items-center justify-end">
                    <span className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></span>
                    <span>Heures supplémentaires (+25%) :</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200">
                    {decimalVersHeuresMinutes(resultats.heuresSupp25)}
                  </span>
                </td>
                <td className="px-4 py-1 text-xs text-indigo-500 italic">Majoration 25%</td>
              </tr>
              <tr>
                <td colSpan="8" className="px-4 py-3 text-right font-medium text-gray-700">
                  <div className="flex items-center justify-end">
                    <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                    <span>Heures supplémentaires (+50%) :</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-lg border border-purple-200">
                    {decimalVersHeuresMinutes(resultats.heuresSupp50)}
                  </span>
                </td>
                <td className="px-4 py-1 text-xs text-purple-500 italic">Majoration 50%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-gray-500">Aucune semaine disponible. Veuillez sélectionner un mois dans les paramètres.</p>
          <button 
            onClick={goToSettings} 
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Aller aux paramètres
          </button>
        </div>
      )}
      
      {weeksOfMonth.length > 0 && (
        <div className="mt-6 bg-blue-50 p-4 rounded-md">
          <h3 className="text-md font-medium text-blue-800 mb-2">Récapitulatif du mois</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {weeksOfMonth.map((week, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-md cursor-pointer transition-colors ${
                  index === activeWeekIndex ? 'bg-blue-500 text-white' : 'bg-white hover:bg-blue-100'
                }`}
                onClick={() => setActiveWeek(index)}
              >
                <div className="font-medium">Semaine {week.numeroSemaine}</div>
                <div className="text-sm">{formatWeekRange(week.dateDebut, week.dateFin)}</div>
                <div className="text-xs mt-1">{week.jours.length} jours</div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className={index === activeWeekIndex ? 'text-blue-100' : 'text-gray-500'}>Total:</div>
                    <div className="font-medium">{decimalVersHeuresMinutes(week.resultats.totalHeuresTravaillees)}</div>
                  </div>
                  <div>
                    <div className={index === activeWeekIndex ? 'text-blue-100' : 'text-gray-500'}>HS:</div>
                    <div className="font-medium">{decimalVersHeuresMinutes(week.resultats.heuresSupp25 + week.resultats.heuresSupp50)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-6 p-4 bg-yellow-50 rounded-md border border-yellow-200">
        <p className="font-semibold mb-2 flex items-center text-yellow-700">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Rappel des règles :
        </p>
        <ul className="list-disc pl-5 space-y-1 text-yellow-700">
          <li>Les jours avec absence exclue (CP, RTT, etc.) ne sont pas comptés dans le seuil hebdomadaire.</li>
          <li>Heures diverses : heures entre le seuil ajusté et 35h (sans majoration).</li>
          <li>Heures supplémentaires : +25% pour les 8 premières heures au-delà de 35h, +50% au-delà.</li>
        </ul>
      </div>
    </div>
  );
};

export default Timesheet;