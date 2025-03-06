import React from 'react';
import { useTimeTrack } from '../../context/TimeTrackContext';
import { TYPES_ABSENCE } from '../../constants';
import { validerFormatHeure } from '../../utils/timeCalculations';

const TimeEntryRow = ({ jour, index }) => {
  const { updateJour, decimalVersHeuresMinutes } = useTimeTrack();

  // Handlers avec logs de débogage
  const handleAbsenceChange = (e) => {
    console.log("Absence changée:", e.target.checked);
    updateJour(index, 'absence', e.target.checked);
  };

  const handleTypeChange = (e) => {
    console.log("Type d'absence changé:", e.target.value);
    updateJour(index, 'typeAbsence', e.target.value);
  };

  const handleTimeChange = (field, value) => {
    console.log("Heure changée:", field, value);
    updateJour(index, field, value);
  };

  const handleCommentChange = (e) => {
    console.log("Commentaire changé:", e.target.value);
    updateJour(index, 'commentaire', e.target.value);
  };

  // Gestion des erreurs de format
  const validerTemps = (temps) => {
    return temps ? validerFormatHeure(temps) : true;
  };

  return (
    <tr className={jour.absence ? "bg-gray-50" : ""}>
      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-500">{jour.date}</td>
      <td className="px-4 py-2.5 whitespace-nowrap text-sm font-medium text-gray-700">{jour.jour}</td>
      
      <td className="px-4 py-2.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
        <input 
          type="checkbox" 
          checked={jour.absence}
          onChange={handleAbsenceChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      </td>
      
      <td className="px-4 py-2.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
        <select 
          disabled={!jour.absence}
          value={jour.typeAbsence}
          onChange={handleTypeChange}
          className="block w-full py-1.5 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="">Sélectionner</option>
          {TYPES_ABSENCE.map(type => (
            <option key={type.id} value={type.id}>{type.label}</option>
          ))}
        </select>
      </td>
      
      <td className="px-2 py-2.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
        <input 
          type="time" 
          disabled={jour.absence}
          value={jour.matin.debut}
          onChange={(e) => handleTimeChange('matin.debut', e.target.value)}
          className="block w-full py-1.5 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </td>
      
      <td className="px-2 py-2.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
        <input 
          type="time" 
          disabled={jour.absence}
          value={jour.matin.fin}
          onChange={(e) => handleTimeChange('matin.fin', e.target.value)}
          className="block w-full py-1.5 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </td>
      
      <td className="px-2 py-2.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
        <input 
          type="time" 
          disabled={jour.absence}
          value={jour.apresmidi.debut}
          onChange={(e) => handleTimeChange('apresmidi.debut', e.target.value)}
          className="block w-full py-1.5 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </td>
      
      <td className="px-2 py-2.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
        <input 
          type="time" 
          disabled={jour.absence}
          value={jour.apresmidi.fin}
          onChange={(e) => handleTimeChange('apresmidi.fin', e.target.value)}
          className="block w-full py-1.5 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </td>
      
      <td className="px-4 py-2.5 whitespace-nowrap text-center">
        <span className={`font-medium ${jour.heuresTravaillees > 0 ? 'text-blue-600' : 'text-gray-500'}`}>
          {decimalVersHeuresMinutes(jour.heuresTravaillees)}
        </span>
      </td>
      
      <td className="px-4 py-2.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
        <input 
          type="text" 
          value={jour.commentaire}
          onChange={handleCommentChange}
          className="block w-full py-1.5 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Commentaire"
        />
      </td>
    </tr>
  );
};

export default TimeEntryRow;