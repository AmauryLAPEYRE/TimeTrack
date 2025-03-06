import React, { useState } from 'react';
import { Download, Calendar, ChevronDown } from 'lucide-react';
import { exporterExcel } from '../../utils/excelExport';
import { useTimeTrack } from '../../context/TimeTrackContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ExportButton = () => {
  const { semaine, weeksOfMonth, salaireInfo, resultats, formatMonthName } = useTimeTrack();
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Exporter la semaine active seulement
  const handleExportWeek = async () => {
    try {
      setIsExporting(true);
      await exporterExcel(semaine, salaireInfo, resultats);
      setShowMenu(false);
    } catch (error) {
      console.error("Erreur lors de l'exportation Excel:", error);
      alert("Une erreur est survenue lors de l'exportation. Veuillez réessayer.");
    } finally {
      setIsExporting(false);
    }
  };

  // Exporter toutes les semaines du mois
  const handleExportMonth = async () => {
    try {
      setIsExporting(true);

      // Formatage du nom du mois pour le nom de fichier
      const monthName = formatMonthName().toLowerCase();
      
      // Calculer les résultats mensuels pour le récapitulatif
      const resultatsGlobaux = weeksOfMonth.reduce((acc, week) => {
        acc.totalHeuresTravaillees += week.resultats.totalHeuresTravaillees;
        acc.heuresDiverses += week.resultats.heuresDiverses;
        acc.heuresSupp25 += week.resultats.heuresSupp25;
        acc.heuresSupp50 += week.resultats.heuresSupp50;
        return acc;
      }, { 
        totalHeuresTravaillees: 0, 
        heuresDiverses: 0, 
        heuresSupp25: 0, 
        heuresSupp50: 0 
      });
      
      // Exporter chaque semaine dans un même fichier
      await exporterExcel(
        weeksOfMonth, 
        salaireInfo, 
        resultatsGlobaux, // On passe les résultats globaux pour le récapitulatif
        true, // Mode multi-semaines
        monthName // Nom du mois pour le fichier
      );
      
      setShowMenu(false);
    } catch (error) {
      console.error("Erreur lors de l'exportation Excel mensuelle:", error);
      alert("Une erreur est survenue lors de l'exportation. Veuillez réessayer.");
    } finally {
      setIsExporting(false);
    }
  };

  // Toggle le menu d'export
  const toggleMenu = () => {
    if (!isExporting) {
      setShowMenu(!showMenu);
    }
  };

  return (
    <div className="relative">
      <div className="flex">
        <button 
          className={`flex items-center text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-l-md transition-colors ${isExporting ? 'opacity-70 cursor-not-allowed' : ''}`}
          onClick={handleExportWeek}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Exportation...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </>
          )}
        </button>
        
        <button 
          className="bg-blue-700 text-white p-2 rounded-r-md hover:bg-blue-800 transition-colors"
          onClick={toggleMenu}
          disabled={isExporting}
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
      
      {showMenu && (
        <div className="absolute right-0 mt-1 w-56 bg-white rounded-md shadow-lg z-10">
          <div className="py-1">
            <button 
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              onClick={handleExportWeek}
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter la semaine actuelle
            </button>
            <button 
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              onClick={handleExportMonth}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Exporter tout le mois
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportButton;