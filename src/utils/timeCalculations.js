/**
 * Convertit un format hh:mm en nombre décimal d'heures
 * @param {string} temps - Temps au format "hh:mm"
 * @returns {number} - Heures en décimal
 */
export const heuresMinutesVersDecimal = (temps) => {
    if (!temps) return 0;
    const [heures, minutes] = temps.split(':').map(Number);
    return heures + minutes / 60;
  };
  
  /**
   * Convertit un nombre décimal d'heures en format hh:mm
   * @param {number} decimal - Heures en décimal
   * @returns {string} - Temps au format "hh:mm"
   */
  export const decimalVersHeuresMinutes = (decimal) => {
    if (decimal === 0 || isNaN(decimal)) return '00:00';
    const heures = Math.floor(decimal);
    const minutes = Math.round((decimal - heures) * 60);
    return `${heures.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
  
  /**
   * Calcule la durée entre deux heures
   * @param {string} debut - Heure de début au format "hh:mm"
   * @param {string} fin - Heure de fin au format "hh:mm"
   * @returns {number} - Durée en décimal
   */
  export const calculerDuree = (debut, fin) => {
    if (!debut || !fin) return 0;
    const debutDecimal = heuresMinutesVersDecimal(debut);
    const finDecimal = heuresMinutesVersDecimal(fin);
    return finDecimal > debutDecimal ? finDecimal - debutDecimal : 0;
  };
  
  /**
   * Valide un format d'heure
   * @param {string} temps - Temps à valider
   * @returns {boolean} - Vrai si le format est valide
   */
  export const validerFormatHeure = (temps) => {
    if (!temps) return true;
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(temps);
  };
  
  /**
   * Formate un temps pour l'affichage
   * @param {number} heures - Heures en décimal
   * @returns {string} - Temps formaté avec unité
   */
  export const formaterTempsAffichage = (heures) => {
    if (heures === 0) return '0h';
    
    const h = Math.floor(heures);
    const m = Math.round((heures - h) * 60);
    
    if (m === 0) return `${h}h`;
    return `${h}h${m}m`;
  };