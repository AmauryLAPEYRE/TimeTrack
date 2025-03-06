import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  getISOWeek, 
  parseISO,
  eachWeekOfInterval
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  calculerDuree, 
  heuresMinutesVersDecimal, 
  decimalVersHeuresMinutes 
} from '../utils/timeCalculations';
import { TYPES_ABSENCE, JOURS } from '../constants';

// Création du contexte
const TimeTrackContext = createContext();

// État initial pour un jour
const initialJourData = {
  date: '',
  jour: '',
  absence: false,
  typeAbsence: '',
  matin: { debut: '', fin: '' },
  apresmidi: { debut: '', fin: '' },
  heuresTravaillees: 0,
  commentaire: ''
};

// Fonction pour créer une structure de semaine vide
const createEmptyWeek = (dateDebut, dateFin, numeroSemaine) => {
  const jours = [];
  let currentDate = new Date(dateDebut);
  const endDate = new Date(dateFin);
  
  // Créer un jour pour chaque date dans la semaine
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    const jourIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0 = lundi, 6 = dimanche
    
    jours.push({
      ...initialJourData,
      date: format(currentDate, 'yyyy-MM-dd'),
      jour: JOURS[jourIndex]
    });
    
    currentDate = addDays(currentDate, 1);
  }
  
  return {
    numeroSemaine,
    dateDebut: format(new Date(dateDebut), 'yyyy-MM-dd'),
    dateFin: format(new Date(dateFin), 'yyyy-MM-dd'),
    jours,
    resultats: {
      totalHeuresTravaillees: 0,
      seuilAjuste: 35,
      heuresDiverses: 0,
      heuresSupp25: 0,
      heuresSupp50: 0
    }
  };
};

export function TimeTrackProvider({ children }) {
  // États
  const [salaireInfo, setSalaireInfo] = useState({
    nom: '',
    prenom: '',
    societe: '',
    heuresContractuelles: 7,
    seuilHebdo: 35,
    seuilHS2: 43 // Seuil pour passage de 25% à 50%
  });

  // État pour stocker le mois sélectionné
  const [selectedMonth, setSelectedMonth] = useState('');
  
  // État pour stocker toutes les semaines du mois
  const [weeksOfMonth, setWeeksOfMonth] = useState([]);
  
  // Semaine active (sélectionnée pour la saisie)
  const [activeWeekIndex, setActiveWeekIndex] = useState(0);
  
  // Référence à la semaine active
  const semaine = weeksOfMonth[activeWeekIndex] || {
    dateDebut: '',
    dateFin: '',
    jours: Array(7).fill().map(() => ({ ...initialJourData })),
    resultats: {
      totalHeuresTravaillees: 0,
      seuilAjuste: 35,
      heuresDiverses: 0,
      heuresSupp25: 0,
      heuresSupp50: 0
    }
  };
  
  // Référence aux résultats de la semaine active
  const resultats = semaine.resultats;

  // Générer les semaines d'un mois de manière plus robuste
  const generateMonthData = useCallback((yearMonth) => {
    if (!yearMonth) return;
    
    const [year, month] = yearMonth.split('-').map(Number);
    const firstDay = startOfMonth(new Date(year, month - 1));
    const lastDay = endOfMonth(new Date(year, month - 1));
    
    // Utiliser eachWeekOfInterval pour obtenir le début de chaque semaine dans l'intervalle
    const weekStarts = eachWeekOfInterval(
      { start: firstDay, end: lastDay },
      { weekStartsOn: 1 } // 1 = lundi comme premier jour de la semaine
    );
    
    // Créer les semaines basées sur les dates de début, mais filtrer pour n'inclure que les jours du mois
    const weeks = weekStarts.map(weekStart => {
      // Calculer la date de fin de la semaine (dimanche)
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      
      // Utiliser les jours complets de la semaine mais on filtrera après
      const weekData = createEmptyWeek(weekStart, weekEnd, getISOWeek(weekStart));
      
      // Filtrer pour ne garder que les jours du mois sélectionné
      weekData.jours = weekData.jours.filter(jour => {
        const jourDate = new Date(jour.date);
        return jourDate.getMonth() === month - 1 && jourDate.getFullYear() === year;
      });
      
      // Ajuster les dates de début et de fin de la semaine pour refléter les jours filtrés
      if (weekData.jours.length > 0) {
        weekData.dateDebut = weekData.jours[0].date;
        weekData.dateFin = weekData.jours[weekData.jours.length - 1].date;
      }
      
      return weekData;
    });
    
    // Filtrer les semaines qui pourraient se retrouver vides après le filtrage
    const filteredWeeks = weeks.filter(week => week.jours.length > 0);
    
    setWeeksOfMonth(filteredWeeks);
    setActiveWeekIndex(0); // Sélectionner la première semaine par défaut
    
    console.log(`Généré ${filteredWeeks.length} semaines pour ${yearMonth} (${filteredWeeks.reduce((acc, w) => acc + w.jours.length, 0)} jours)`);
    
  }, []);

  // Mettre à jour les heures travaillées pour un jour
  const updateHeuresTravaillees = useCallback((weekIndex, jourIndex) => {
    if (!weeksOfMonth[weekIndex]) return null;
    
    const jour = weeksOfMonth[weekIndex].jours[jourIndex];
    
    if (jour.absence) {
      return {
        ...jour,
        heuresTravaillees: 0,
        matin: { debut: '', fin: '' },
        apresmidi: { debut: '', fin: '' }
      };
    }
    
    const dureeMatinale = calculerDuree(jour.matin.debut, jour.matin.fin);
    const dureeAprem = calculerDuree(jour.apresmidi.debut, jour.apresmidi.fin);
    const total = dureeMatinale + dureeAprem;
    
    return {
      ...jour,
      heuresTravaillees: total
    };
  }, [weeksOfMonth]);

  // Mettre à jour un jour
  const updateJour = useCallback((jourIndex, field, value) => {
    console.log(`Mise à jour du jour ${jourIndex}, champ ${field}, valeur:`, value);
    
    if (activeWeekIndex < 0 || activeWeekIndex >= weeksOfMonth.length) {
      console.error(`Index de semaine invalide: ${activeWeekIndex}`);
      return;
    }
    
    // Vérifier que l'index est valide
    if (jourIndex < 0 || jourIndex >= weeksOfMonth[activeWeekIndex].jours.length) {
      console.error(`Index de jour invalide: ${jourIndex}`);
      return;
    }
    
    setWeeksOfMonth(prevWeeks => {
      const newWeeks = [...prevWeeks];
      const newJours = [...newWeeks[activeWeekIndex].jours];
      
      if (field === 'absence') {
        // Si on active l'absence, on vide les heures
        newJours[jourIndex] = {
          ...newJours[jourIndex],
          absence: value,
          typeAbsence: value ? newJours[jourIndex].typeAbsence || TYPES_ABSENCE[0].id : ''
        };
      } else if (field.includes('.')) {
        // Pour les champs imbriqués comme 'matin.debut'
        const [parent, child] = field.split('.');
        newJours[jourIndex] = {
          ...newJours[jourIndex],
          [parent]: {
            ...newJours[jourIndex][parent],
            [child]: value
          }
        };
      } else {
        // Pour les champs simples
        newJours[jourIndex] = {
          ...newJours[jourIndex],
          [field]: value
        };
      }
      
      // Mettre à jour les heures travaillées
      const jourAvecHeures = {
        ...newJours[jourIndex],
        ...(field === 'absence' && value 
          ? { 
              heuresTravaillees: 0,
              matin: { debut: '', fin: '' },
              apresmidi: { debut: '', fin: '' }
            } 
          : {})
      };
      
      if (!jourAvecHeures.absence) {
        // Si ce n'est pas une absence, calculer les heures
        const dureeMatinale = calculerDuree(jourAvecHeures.matin.debut, jourAvecHeures.matin.fin);
        const dureeAprem = calculerDuree(jourAvecHeures.apresmidi.debut, jourAvecHeures.apresmidi.fin);
        jourAvecHeures.heuresTravaillees = dureeMatinale + dureeAprem;
      }
      
      newJours[jourIndex] = jourAvecHeures;
      newWeeks[activeWeekIndex] = {
        ...newWeeks[activeWeekIndex],
        jours: newJours
      };
      
      // Recalculer les résultats pour cette semaine
      newWeeks[activeWeekIndex] = {
        ...newWeeks[activeWeekIndex],
        resultats: calculerResultatsSemaine(newJours, salaireInfo)
      };
      
      return newWeeks;
    });
  }, [activeWeekIndex, weeksOfMonth, salaireInfo]);

  // Calculer les résultats pour une semaine
  const calculerResultatsSemaine = useCallback((jours, infoSalaire) => {
    // Compter uniquement les jours ouvrés (lundi-vendredi)
    const joursOuvres = jours.filter(jour => 
      ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].includes(jour.jour)
    );
    
    // 1. Identifier les jours à exclure du décompte
    const joursExclus = joursOuvres.filter(jour => 
      jour.absence && 
      TYPES_ABSENCE.find(t => t.id === jour.typeAbsence)?.excluDecompte
    );
    
    // 2. Calculer le seuil hebdomadaire ajusté
    // Pour les semaines partielles, tenir compte uniquement des jours ouvrés présents dans la semaine
    const joursOuvresCount = joursOuvres.length;
    const joursNonExclus = joursOuvresCount - joursExclus.length;
    const seuilAjuste = joursNonExclus * infoSalaire.heuresContractuelles;
    
    // 3. Calculer les heures travaillées totales
    const totalHeuresTravaillees = jours.reduce(
      (total, jour) => total + jour.heuresTravaillees, 0
    );
    
    // 4. Déterminer les différentes catégories d'heures
    let heuresDiverses = 0;
    let heuresSupp25 = 0;
    let heuresSupp50 = 0;
    
    // Calculer le seuil hebdo proportionnel pour les semaines partielles
    const seuilHebdoAjuste = joursOuvresCount < 5 
      ? (joursOuvresCount / 5) * infoSalaire.seuilHebdo 
      : infoSalaire.seuilHebdo;
    
    const seuilHS2Ajuste = joursOuvresCount < 5
      ? (joursOuvresCount / 5) * infoSalaire.seuilHS2
      : infoSalaire.seuilHS2;
    
    if (totalHeuresTravaillees <= seuilAjuste) {
      // Cas 1: Aucune heure au-dessus du seuil
      heuresDiverses = 0;
      heuresSupp25 = 0;
      heuresSupp50 = 0;
    } else if (totalHeuresTravaillees <= seuilHebdoAjuste) {
      // Cas 2: Heures entre le seuil ajusté et le seuil hebdo proportionnel (heures diverses)
      heuresDiverses = totalHeuresTravaillees - seuilAjuste;
    } else {
      // Cas 3: Au-delà du seuil hebdo (heures supplémentaires)
      heuresDiverses = Math.max(0, seuilHebdoAjuste - seuilAjuste);
      
      // Heures supp 25% (entre seuil hebdo et seuil HS2)
      const heuresAuDelaSeuilHebdo = totalHeuresTravaillees - seuilHebdoAjuste;
      const maxHeuresSupp25 = seuilHS2Ajuste - seuilHebdoAjuste;
      
      heuresSupp25 = Math.min(heuresAuDelaSeuilHebdo, maxHeuresSupp25);
      
      // Heures supp 50% (au-delà du seuil HS2)
      heuresSupp50 = Math.max(0, heuresAuDelaSeuilHebdo - maxHeuresSupp25);
    }
    
    return {
      totalHeuresTravaillees,
      seuilAjuste,
      heuresDiverses,
      heuresSupp25,
      heuresSupp50
    };
  }, []);

  // Calculer les résultats pour le mois entier
  const calculerResultatsMois = useCallback(() => {
    // Initialiser les résultats
    const resultatsMois = {
      totalHeuresTravaillees: 0,
      heuresDiverses: 0,
      heuresSupp25: 0,
      heuresSupp50: 0
    };
    
    // Additionner les résultats de chaque semaine
    weeksOfMonth.forEach(week => {
      resultatsMois.totalHeuresTravaillees += week.resultats.totalHeuresTravaillees;
      resultatsMois.heuresDiverses += week.resultats.heuresDiverses;
      resultatsMois.heuresSupp25 += week.resultats.heuresSupp25;
      resultatsMois.heuresSupp50 += week.resultats.heuresSupp50;
    });
    
    return resultatsMois;
  }, [weeksOfMonth]);

  // Formatage des dates pour l'affichage
  const formatDateRange = useCallback(() => {
    if (!semaine || !semaine.dateDebut || !semaine.dateFin) return "Aucune période sélectionnée";
    
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return format(date, 'd MMM', { locale: fr });
    };
    
    return `${formatDate(semaine.dateDebut)} — ${formatDate(semaine.dateFin)}`;
  }, [semaine]);

  // Formater le nom du mois pour l'affichage
  const formatMonthName = useCallback(() => {
    if (!selectedMonth) return "";
    
    const [year, month] = selectedMonth.split('-');
    const date = new Date(year, month - 1, 1);
    return format(date, 'MMMM yyyy', { locale: fr });
  }, [selectedMonth]);

  // Obtenir le pourcentage de travail accompli
  const getPourcentageTravail = useCallback(() => {
    if (!resultats || resultats.seuilAjuste === 0) return 0;
    return Math.min(100, (resultats.totalHeuresTravaillees / resultats.seuilAjuste) * 100);
  }, [resultats]);

  // Changer la semaine active
  const setActiveWeek = (index) => {
    if (index >= 0 && index < weeksOfMonth.length) {
      setActiveWeekIndex(index);
    }
  };

  // Exportation des valeurs et fonctions
  const value = {
    salaireInfo,
    setSalaireInfo,
    semaine,
    resultats,
    updateJour,
    formatDateRange,
    formatMonthName,
    getPourcentageTravail,
    decimalVersHeuresMinutes,
    selectedMonth,
    setSelectedMonth,
    generateMonthData,
    weeksOfMonth,
    activeWeekIndex,
    setActiveWeek,
    calculerResultatsMois
  };

  return (
    <TimeTrackContext.Provider value={value}>
      {children}
    </TimeTrackContext.Provider>
  );
}

// Hook personnalisé pour utiliser le contexte
export function useTimeTrack() {
  const context = useContext(TimeTrackContext);
  if (context === undefined) {
    throw new Error('useTimeTrack must be used within a TimeTrackProvider');
  }
  return context;
}