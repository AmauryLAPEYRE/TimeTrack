import React, { useEffect } from 'react';
import CircleProgress from './CircleProgress';
import ProgressBar from './ProgressBar';
import TimeChart from './TimeChart';
import { useTimeTrack } from '../../context/TimeTrackContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const Dashboard = () => {
  const { 
    semaine, 
    resultats, 
    getPourcentageTravail, 
    decimalVersHeuresMinutes,
    weeksOfMonth,
    activeWeekIndex,
    setActiveWeek,
    selectedMonth,
    formatMonthName,
    calculerResultatsMois
  } = useTimeTrack();

  // Calculer les résultats du mois
  const resultatsMois = calculerResultatsMois();

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

  // Formater un intervalle de dates pour l'affichage
  const formatDateRange = (dateDebut, dateFin) => {
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return format(date, 'd MMM', { locale: fr });
    };
    
    return `${formatDate(dateDebut)} - ${formatDate(dateFin)}`;
  };

  return (
    <div className="space-y-4">
      {/* Sélecteur de semaine */}
      {weeksOfMonth.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-700 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-500" />
              {selectedMonth ? formatMonthName() : "Période"}
            </h2>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={goToPreviousWeek}
                disabled={activeWeekIndex === 0}
                className={`p-1 rounded-full ${activeWeekIndex === 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="font-medium">
                Semaine {semaine.numeroSemaine}
              </span>
              
              <button 
                onClick={goToNextWeek}
                disabled={activeWeekIndex === weeksOfMonth.length - 1}
                className={`p-1 rounded-full ${activeWeekIndex === weeksOfMonth.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 xl:grid-cols-6 gap-2">
            {weeksOfMonth.map((week, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-md cursor-pointer transition-colors ${
                  index === activeWeekIndex ? 'bg-blue-500 text-white' : 'bg-gray-50 hover:bg-blue-100'
                }`}
                onClick={() => setActiveWeek(index)}
              >
                <div className="font-medium">Semaine {week.numeroSemaine}</div>
                <div className="text-xs">{formatDateRange(week.dateDebut, week.dateFin)}</div>
                <div className="mt-2 text-sm">{decimalVersHeuresMinutes(week.resultats.totalHeuresTravaillees)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Carte du total */}
        <div className="bg-white p-4 rounded-lg shadow col-span-3 lg:col-span-1">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-medium text-gray-700">Solde total</h2>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold">{decimalVersHeuresMinutes(resultats.totalHeuresTravaillees)}</span>
                <span className="ml-1 text-sm text-gray-500">cette semaine</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Mois en cours</div>
              <div className="text-xl font-semibold text-blue-600">
                {decimalVersHeuresMinutes(resultatsMois.totalHeuresTravaillees)}
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">HS 25%</div>
                <div className="text-lg font-medium text-indigo-600">
                  {decimalVersHeuresMinutes(resultats.heuresSupp25)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">HS 50%</div>
                <div className="text-lg font-medium text-purple-600">
                  {decimalVersHeuresMinutes(resultats.heuresSupp50)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Graphique des heures */}
        <div className="bg-white p-4 rounded-lg shadow col-span-3 lg:col-span-2">
          <TimeChart />
        </div>

        {/* Tâches */}
        <div className="bg-white p-4 rounded-lg shadow col-span-3 lg:col-span-1">
          <div className="flex justify-between items-start">
            <h2 className="text-lg font-medium text-gray-700">Progression</h2>
          </div>
          
          <div className="mt-4">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">{Math.round(getPourcentageTravail())}%</span>
              <span className="ml-1 text-sm text-gray-500">Objectif hebdomadaire</span>
            </div>
            
            <div className="mt-6 space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Objectif semaine</span>
                  <span>{decimalVersHeuresMinutes(resultats.seuilAjuste)}</span>
                </div>
                <ProgressBar 
                  value={resultats.totalHeuresTravaillees} 
                  maxValue={resultats.seuilAjuste || 35} 
                  color="#3B82F6" 
                  height={8} 
                />
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span>Heures à compenser</span>
                  <span>{resultats.totalHeuresTravaillees < resultats.seuilAjuste ? 
                    decimalVersHeuresMinutes(resultats.seuilAjuste - resultats.totalHeuresTravaillees) : 
                    '0:00'}</span>
                </div>
                <ProgressBar 
                  value={resultats.totalHeuresTravaillees < resultats.seuilAjuste ? 
                    resultats.seuilAjuste - resultats.totalHeuresTravaillees : 0} 
                  maxValue={resultats.seuilAjuste || 35} 
                  color="#EF4444" 
                  height={8} 
                />
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span>Heures supplémentaires</span>
                  <span>{decimalVersHeuresMinutes(resultats.heuresSupp25 + resultats.heuresSupp50)}</span>
                </div>
                <ProgressBar 
                  value={resultats.heuresSupp25 + resultats.heuresSupp50} 
                  maxValue={8} 
                  color="#10B981" 
                  height={8} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Détail des résultats */}
        <div className="bg-white p-4 rounded-lg shadow col-span-3 lg:col-span-2">
          <div className="flex justify-between items-start">
            <h2 className="text-lg font-medium text-gray-700">État de la semaine</h2>
            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              Semaine {semaine.numeroSemaine}
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap justify-around">
            <CircleProgress 
              value={Math.round(getPourcentageTravail())} 
              maxValue={100} 
              color="#8B5CF6" 
              label="Avancement" 
              subLabel="%" 
            />
            
            <CircleProgress 
              value={Math.round(resultats.totalHeuresTravaillees)} 
              maxValue={resultats.seuilAjuste > 0 ? resultats.seuilAjuste : 35} 
              color="#3B82F6" 
              label="Travaillé cette semaine" 
              subLabel="h" 
            />
            
            <CircleProgress 
              value={Math.round(resultats.heuresSupp25 + resultats.heuresSupp50)} 
              maxValue={8} 
              color="#10B981" 
              label="Heures supplémentaires" 
              subLabel="h" 
            />
          </div>
        </div>

        {/* Récapitulatif du mois */}
        <div className="bg-white p-4 rounded-lg shadow col-span-3 lg:col-span-1">
          <h2 className="text-lg font-medium text-gray-700 mb-4">Récapitulatif du mois</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span>Total heures</span>
                <span className="font-medium">{decimalVersHeuresMinutes(resultatsMois.totalHeuresTravaillees)}</span>
              </div>
              <ProgressBar 
                value={resultatsMois.totalHeuresTravaillees} 
                maxValue={weeksOfMonth.length * 35} 
                color="#3B82F6" 
                height={6} 
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm">
                <span>Heures diverses</span>
                <span className="font-medium">{decimalVersHeuresMinutes(resultatsMois.heuresDiverses)}</span>
              </div>
              <ProgressBar 
                value={resultatsMois.heuresDiverses} 
                maxValue={20} 
                color="#8B5CF6" 
                height={6} 
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm">
                <span>HS 25%</span>
                <span className="font-medium">{decimalVersHeuresMinutes(resultatsMois.heuresSupp25)}</span>
              </div>
              <ProgressBar 
                value={resultatsMois.heuresSupp25} 
                maxValue={weeksOfMonth.length * 8} 
                color="#EC4899" 
                height={6} 
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm">
                <span>HS 50%</span>
                <span className="font-medium">{decimalVersHeuresMinutes(resultatsMois.heuresSupp50)}</span>
              </div>
              <ProgressBar 
                value={resultatsMois.heuresSupp50} 
                maxValue={10} 
                color="#F59E0B" 
                height={6} 
              />
            </div>
          </div>
          
          <div className="mt-6 p-3 bg-blue-50 rounded-md">
            <h3 className="text-sm font-medium text-blue-800">Synthèse mensuelle</h3>
            <p className="mt-1 text-xs text-blue-600">
              {selectedMonth ? formatMonthName() : "Aucun mois sélectionné"}
            </p>
            <p className="mt-2 text-xs text-blue-600">
              {weeksOfMonth.length} semaines, {weeksOfMonth.reduce((total, week) => total + week.jours.length, 0)} jours
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;