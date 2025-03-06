import React, { useState } from 'react';
import { useTimeTrack } from '../../context/TimeTrackContext';

const MonthSelector = () => {
  const { MOIS, selectedMonth, changeMonth } = useTimeTrack();
  const [year, setYear] = useState(selectedMonth.year);

  // Générer les options d'années (année actuelle +/- 5 ans)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const handleMonthChange = (e) => {
    changeMonth(parseInt(e.target.value), year);
  };

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    setYear(newYear);
    changeMonth(selectedMonth.month, newYear);
  };

  return (
    <div className="flex flex-col space-y-4">
      <h3 className="text-lg font-medium text-gray-700 mb-2">Sélection du mois</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mois</label>
          <select
            value={selectedMonth.month}
            onChange={handleMonthChange}
            className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {MOIS.map((mois, index) => (
              <option key={mois} value={index}>
                {mois}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
          <select
            value={year}
            onChange={handleYearChange}
            className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-2 p-3 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-700">
          Les semaines du mois sélectionné seront automatiquement calculées. Les semaines partielles au début ou à la fin du mois sont incluses.
        </p>
      </div>
    </div>
  );
};

export default MonthSelector;