import ExcelJS from 'exceljs';
import { decimalVersHeuresMinutes } from './timeCalculations';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TYPES_ABSENCE } from '../constants';

/**
 * Crée un style de cellule avec bordure
 * @returns {Object} Style de cellule
 */
const createBorderedStyle = (options = {}) => {
  const borderStyle = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };
  
  return {
    border: borderStyle,
    alignment: { horizontal: 'center', vertical: 'middle' },
    ...options
  };
};

/**
 * Exporte les données d'une semaine ou d'un mois entier en fichier Excel
 * @param {Object|Array} data - Données d'une semaine ou tableau de semaines
 * @param {Object} salaireInfo - Informations du salarié
 * @param {Object} resultats - Résultats des calculs (utilisé seulement pour une semaine)
 * @param {Boolean} isMonthExport - Indique si c'est un export mensuel
 * @param {String} monthName - Nom du mois pour le nom de fichier
 */
export const exporterExcel = async (data, salaireInfo, resultats, isMonthExport = false, monthName = '') => {
  // Création du workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'TimeTrack';
  workbook.lastModifiedBy = `${salaireInfo.prenom} ${salaireInfo.nom}`;
  workbook.created = new Date();
  workbook.modified = new Date();
  
  // Déterminer si on exporte une semaine ou plusieurs
  const semaines = isMonthExport ? data : [data];
  
  // Calculer les totaux pour l'ensemble du mois
  const totauxMois = {
    totalHeuresTravaillees: 0,
    heuresDiverses: 0,
    heuresSupp25: 0,
    heuresSupp50: 0
  };
  
  // Si c'est un export mensuel, ajouter d'abord la feuille récapitulative
  if (isMonthExport) {
    // Créer la feuille récapitulative
    const recapSheet = workbook.addWorksheet('Récapitulatif Mensuel');
    
    // Configuration des colonnes
    recapSheet.columns = [
      { header: 'Semaine', key: 'semaine', width: 10 },
      { header: 'Période', key: 'periode', width: 20 },
      { header: 'Jours', key: 'jours', width: 10 },
      { header: 'Total heures', key: 'total', width: 15 },
      { header: 'Heures div.', key: 'diverses', width: 15 },
      { header: 'HS 25%', key: 'hs25', width: 15 },
      { header: 'HS 50%', key: 'hs50', width: 15 }
    ];
    
    // Styliser les en-têtes
    recapSheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4472C4' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    
    // Ajouter les titres et informations
    recapSheet.mergeCells('A1:G1');
    recapSheet.getCell('A1').value = 'RÉCAPITULATIF MENSUEL';
    recapSheet.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
    recapSheet.getCell('A1').alignment = { horizontal: 'center' };
    
    // Information employé
    recapSheet.insertRow(2, []);
    recapSheet.insertRow(3, []);
    recapSheet.getCell('A3').value = 'Employé :';
    recapSheet.getCell('B3').value = `${salaireInfo.prenom} ${salaireInfo.nom}`;
    recapSheet.getCell('A3').font = { bold: true };
    
    recapSheet.getCell('A4').value = 'Société :';
    recapSheet.getCell('B4').value = salaireInfo.societe;
    recapSheet.getCell('A4').font = { bold: true };
    
    // Information période
    if (semaines.length > 0) {
      const debutMois = new Date(semaines[0].dateDebut);
      const finMois = new Date(semaines[semaines.length - 1].dateFin);
      
      recapSheet.getCell('A6').value = 'Période :';
      recapSheet.getCell('B6').value = format(debutMois, 'dd MMMM', { locale: fr }) + 
                                      ' au ' + 
                                      format(finMois, 'dd MMMM yyyy', { locale: fr });
      recapSheet.getCell('A6').font = { bold: true };
    }
    
    // En-tête tableau
    recapSheet.insertRow(8, [
      'Semaine', 'Période', 'Jours', 'Total heures', 'Heures div.', 'HS 25%', 'HS 50%'
    ]);
    
    // Styliser cette nouvelle ligne d'en-tête
    recapSheet.getRow(8).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4472C4' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    
    // Remplir les données par semaine
    let row = 9;
    semaines.forEach(semaine => {
      const debutSemaine = new Date(semaine.dateDebut);
      const finSemaine = new Date(semaine.dateFin);
      const periodeSemaine = `${format(debutSemaine, 'dd/MM', { locale: fr })} - ${format(finSemaine, 'dd/MM', { locale: fr })}`;
      
      // Résultats de la semaine
      const resultatsSemaine = semaine.resultats;
      
      // Ajouter aux totaux mensuels
      totauxMois.totalHeuresTravaillees += resultatsSemaine.totalHeuresTravaillees;
      totauxMois.heuresDiverses += resultatsSemaine.heuresDiverses;
      totauxMois.heuresSupp25 += resultatsSemaine.heuresSupp25;
      totauxMois.heuresSupp50 += resultatsSemaine.heuresSupp50;
      
      recapSheet.insertRow(row, [
        `S${semaine.numeroSemaine}`,
        periodeSemaine,
        semaine.jours.length,
        decimalVersHeuresMinutes(resultatsSemaine.totalHeuresTravaillees),
        decimalVersHeuresMinutes(resultatsSemaine.heuresDiverses),
        decimalVersHeuresMinutes(resultatsSemaine.heuresSupp25),
        decimalVersHeuresMinutes(resultatsSemaine.heuresSupp50)
      ]);
      
      // Style pour les cellules
      recapSheet.getRow(row).eachCell((cell) => {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
      
      row++;
    });
    
    // Ajouter la ligne de total
    recapSheet.insertRow(row, [
      'TOTAL',
      '',
      semaines.reduce((acc, s) => acc + s.jours.length, 0),
      decimalVersHeuresMinutes(totauxMois.totalHeuresTravaillees),
      decimalVersHeuresMinutes(totauxMois.heuresDiverses),
      decimalVersHeuresMinutes(totauxMois.heuresSupp25),
      decimalVersHeuresMinutes(totauxMois.heuresSupp50)
    ]);
    
    // Style pour les totaux
    recapSheet.getRow(row).eachCell((cell, colNumber) => {
      cell.font = { bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9E1F2' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  }
  
  // Exporter chaque semaine dans une feuille séparée
  for (const semaine of semaines) {
    // Si résultats pas fournis, utiliser ceux de la semaine
    const resultatsSemaine = resultats || semaine.resultats;
    
    // Déterminer le mois actuel basé sur la date de début
    const debutSemaine = new Date(semaine.dateDebut);
    const finSemaine = new Date(semaine.dateFin);
    const moisActuel = format(debutSemaine, 'MMMM', { locale: fr }).toUpperCase();
    
    // Nom de feuille pour la semaine
    const isPartialWeek = semaine.jours.length < 7;
    let worksheetName = `Semaine ${semaine.numeroSemaine}`;
    if (isPartialWeek) {
      worksheetName += ` (${semaine.jours.length}j)`;
    }
    
    // Création de la feuille
    const worksheet = workbook.addWorksheet(worksheetName);
    
    // Initialisation des variables pour le suivi des lignes et valeurs cumulées
    let rowIndex = 1;
    let cumulHeuresVal = 0;
    
    // Définir des largeurs de colonnes spécifiques et uniformes
    // IMPORTANT: Toutes les colonnes d'heures (début/fin) doivent avoir exactement la même largeur
    const hourColumnWidth = 10;
    worksheet.getColumn('A').width = 14; // Date
    worksheet.getColumn('B').width = 12; // Jour de la semaine
    worksheet.getColumn('C').width = hourColumnWidth; // Début matin
    worksheet.getColumn('D').width = hourColumnWidth; // Fin matin
    worksheet.getColumn('E').width = hourColumnWidth; // Début après-midi
    worksheet.getColumn('F').width = hourColumnWidth; // Fin après-midi
    worksheet.getColumn('G').width = 12; // Total heures jour
    worksheet.getColumn('H').width = 12; // Cumul heures
    worksheet.getColumn('I').width = hourColumnWidth; // HS 25%
    worksheet.getColumn('J').width = hourColumnWidth; // HS 50%
    
    // Titre principal
    worksheet.mergeCells('A1:D1');
    worksheet.getCell('A1').value = 'Calcul heures de travail';
    worksheet.getCell('A1').font = { bold: true, color: { argb: 'FF0000' }, size: 14 };
    worksheet.getCell('A1').alignment = { horizontal: 'left' };
    
    // Société et numéro de semaine
    worksheet.getCell('G1').value = 'SOCIETE';
    worksheet.getCell('H1').value = salaireInfo.societe;
    worksheet.getCell('G2').value = 'SEMAINE';
    worksheet.getCell('H2').value = semaine.numeroSemaine.toString();
    worksheet.getCell('G1').font = { bold: true };
    worksheet.getCell('G2').font = { bold: true };
    
    // Ligne de période et PAE
    worksheet.getCell('A3').value = 'période';
    worksheet.getCell('B3').value = 'Element Variables';
    worksheet.getCell('C3').value = 'PAE :';
    worksheet.getCell('D3').value = moisActuel;
    worksheet.getCell('D3').fill = { 
      type: 'pattern', 
      pattern: 'solid', 
      fgColor: { argb: 'CCFFCC' } 
    };
    
    // Dates avec fond vert clair
    worksheet.getCell('A4').value = 'Date de début du calendrier :';
    worksheet.getCell('B4').value = format(debutSemaine, 'yyyy-MM-dd');
    worksheet.getCell('B4').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'CCFFCC' }
    };
    worksheet.getCell('B4').border = { outline: true };
    
    worksheet.getCell('A5').value = 'Date de fin du calendrier :';
    worksheet.getCell('B5').value = format(finSemaine, 'yyyy-MM-dd');
    worksheet.getCell('B5').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'CCFFCC' }
    };
    worksheet.getCell('B5').border = { outline: true };
    
    // Tableau des seuils - restructuré et amélioré visuellement
    // Créer une fusion pour le titre du tableau
    worksheet.mergeCells('G5:I5');
    worksheet.getCell('G5').value = 'Seuils d\'heures';
    worksheet.getCell('G5').font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getCell('G5').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4472C4' } };
    worksheet.getCell('G5').alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getCell('G5').border = createBorderedStyle().border;
    
    // En-têtes du tableau des seuils
    worksheet.getCell('G6').value = 'Type';
    worksheet.getCell('H6').value = 'Plage';
    worksheet.getCell('I6').value = 'Code';
    
    ['G6', 'H6', 'I6'].forEach(cell => {
      worksheet.getCell(cell).font = { bold: true };
      worksheet.getCell(cell).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9E1F2' } };
      worksheet.getCell(cell).alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getCell(cell).border = createBorderedStyle().border;
    });
    
    // Données du tableau des seuils
    const seuilsData = [
      { type: 'Hebdo (normal)', plage: salaireInfo.seuilHebdo.toString(), code: 'HN', color: 'CCFFCC' },
      { type: 'HS à 25%', plage: `${salaireInfo.seuilHebdo}-${salaireInfo.seuilHS2}`, code: 'HS 25%', color: 'FFC000' },
      { type: 'HS à 50%', plage: `>${salaireInfo.seuilHS2}`, code: 'HS 50%', color: 'FF99CC' }
    ];
    
    let seuilRow = 7;
    seuilsData.forEach(seuil => {
      worksheet.getCell(`G${seuilRow}`).value = seuil.type;
      worksheet.getCell(`H${seuilRow}`).value = seuil.plage;
      worksheet.getCell(`I${seuilRow}`).value = seuil.code;
      
      // Style des cellules
      ['G', 'H'].forEach(col => {
        worksheet.getCell(`${col}${seuilRow}`).border = createBorderedStyle().border;
        worksheet.getCell(`${col}${seuilRow}`).alignment = { horizontal: 'center', vertical: 'middle' };
      });
      
      // Code avec couleur
      worksheet.getCell(`I${seuilRow}`).border = createBorderedStyle().border;
      worksheet.getCell(`I${seuilRow}`).alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getCell(`I${seuilRow}`).font = { bold: true };
      worksheet.getCell(`I${seuilRow}`).fill = { 
        type: 'pattern', 
        pattern: 'solid', 
        fgColor: { argb: seuil.color } 
      };
      
      seuilRow++;
    });
    
    // En-têtes pour le tableau des heures - Structure plus cohérente
    rowIndex = 10; // Positionnement fixe pour l'en-tête du tableau
    
    // Fusionner les cellules pour le titre du tableau
    worksheet.mergeCells(`A${rowIndex}:J${rowIndex}`);
    worksheet.getCell(`A${rowIndex}`).value = 'RELEVÉ DES HEURES TRAVAILLÉES';
    worksheet.getCell(`A${rowIndex}`).font = { bold: true, color: { argb: 'FFFFFF' }, size: 12 };
    worksheet.getCell(`A${rowIndex}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2F5597' } };
    worksheet.getCell(`A${rowIndex}`).alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getCell(`A${rowIndex}`).border = createBorderedStyle().border;
    
    rowIndex++;
    
    // En-têtes du tableau - redessinés pour éviter les chevauchements
    const headers = [
      { row: rowIndex, col: 'A', value: 'Date', rowspan: 2 },
      { row: rowIndex, col: 'B', value: 'Jour', rowspan: 2 },
      { row: rowIndex, col: 'C', value: 'Matin', colspan: 2 },
      { row: rowIndex, col: 'E', value: 'Après-midi', colspan: 2 },
      { row: rowIndex, col: 'G', value: 'Total heures', colspan: 2 },
      { row: rowIndex, col: 'I', value: 'Heures supp.', colspan: 2 },
      { row: rowIndex + 1, col: 'C', value: 'Début' },
      { row: rowIndex + 1, col: 'D', value: 'Fin' },
      { row: rowIndex + 1, col: 'E', value: 'Début' },
      { row: rowIndex + 1, col: 'F', value: 'Fin' },
      { row: rowIndex + 1, col: 'G', value: 'Jour' },
      { row: rowIndex + 1, col: 'H', value: 'Cumul' },
      { row: rowIndex + 1, col: 'I', value: 'HS 25%' },
      { row: rowIndex + 1, col: 'J', value: 'HS 50%' }
    ];
    
    // Appliquer les en-têtes avec les fusions appropriées
    headers.forEach(header => {
      if (header.colspan) {
        worksheet.mergeCells(`${header.col}${header.row}:${String.fromCharCode(header.col.charCodeAt(0) + header.colspan - 1)}${header.row}`);
      }
      if (header.rowspan) {
        worksheet.mergeCells(`${header.col}${header.row}:${header.col}${header.row + header.rowspan - 1}`);
      }
      
      worksheet.getCell(`${header.col}${header.row}`).value = header.value;
      worksheet.getCell(`${header.col}${header.row}`).font = { bold: true, color: { argb: 'FFFFFF' } };
      worksheet.getCell(`${header.col}${header.row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '000000' } };
      worksheet.getCell(`${header.col}${header.row}`).alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getCell(`${header.col}${header.row}`).border = createBorderedStyle().border;
    });
    
    // Colorer les colonnes des heures supplémentaires
    worksheet.getCell(`I${rowIndex+1}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC000' } };
    worksheet.getCell(`J${rowIndex+1}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF99CC' } };
    
    // Avancer au début des données
    rowIndex += 2;
    
    // Styles pour les cellules de données
    const dataStyle = createBorderedStyle();
    const totalCellStyle = createBorderedStyle({
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'CCFFCC' } }
    });
    const cumulCellStyle = createBorderedStyle({
      font: { color: { argb: 'FF0000' }, bold: true }
    });
    
    // Préparer un tableau pour calculer combien d'heures supp par jour
    // (pour les distribuer proportionnellement si nécessaire)
    const joursTravailles = semaine.jours.filter(j => j.heuresTravaillees > 0);
    const totalHeuresToutes = joursTravailles.reduce((acc, j) => acc + j.heuresTravaillees, 0);
    
    // Facteur de proportion pour distribuer les heures supplémentaires
    const facteurHS25 = totalHeuresToutes > 0 ? resultatsSemaine.heuresSupp25 / totalHeuresToutes : 0;
    const facteurHS50 = totalHeuresToutes > 0 ? resultatsSemaine.heuresSupp50 / totalHeuresToutes : 0;
    
    // Réinitialiser le cumul pour les données des jours
    cumulHeuresVal = 0;
    
    // Ajouter les données des jours
    semaine.jours.forEach((jour, index) => {
      const jourDate = new Date(jour.date);
      
      // Données du jour
      worksheet.getCell(`A${rowIndex}`).value = format(jourDate, 'dd/MM/yyyy');
      worksheet.getCell(`B${rowIndex}`).value = jour.jour;
      
      // Appliquer les styles de base à TOUTES les cellules pour garantir l'uniformité
      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach(col => {
        worksheet.getCell(`${col}${rowIndex}`).style = dataStyle;
      });
      
      // Gestion des absences et congés
      if (jour.absence) {
        // Si c'est une absence, afficher le type d'absence
        const typeAbsence = TYPES_ABSENCE.find(t => t.id === jour.typeAbsence);
        const absenceText = typeAbsence ? typeAbsence.label : 'abs';
        
        // Mettre le type d'absence dans la colonne des heures journalières
        worksheet.getCell(`G${rowIndex}`).value = absenceText;
        worksheet.getCell(`G${rowIndex}`).style = createBorderedStyle({
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EAF2F8' } }
        });
      } else {
        // Si ce n'est pas une absence, afficher les heures
        worksheet.getCell(`C${rowIndex}`).value = jour.matin.debut;
        worksheet.getCell(`D${rowIndex}`).value = jour.matin.fin;
        worksheet.getCell(`E${rowIndex}`).value = jour.apresmidi.debut;
        worksheet.getCell(`F${rowIndex}`).value = jour.apresmidi.fin;
        
        // Heures journalières
        worksheet.getCell(`G${rowIndex}`).value = decimalVersHeuresMinutes(jour.heuresTravaillees);
        worksheet.getCell(`G${rowIndex}`).style = totalCellStyle;
      }
      
      // Calculer le cumul des heures travaillées
      cumulHeuresVal += jour.heuresTravaillees;
      
      // Ne pas afficher le cumul pour les week-ends s'il n'y a pas d'heures travaillées
      if ((jour.jour === 'Samedi' || jour.jour === 'Dimanche') && jour.heuresTravaillees === 0) {
        // Cellule vide mais avec style de bordure conservé
      } else {
        // Pour les jours de semaine ou weekends avec heures, afficher le cumul
        worksheet.getCell(`H${rowIndex}`).value = decimalVersHeuresMinutes(cumulHeuresVal);
        worksheet.getCell(`H${rowIndex}`).style = cumulCellStyle;
      }
      
      // Afficher les heures supplémentaires proportionnellement pour chaque jour travaillé
      if (jour.heuresTravaillees > 0) {
        // Calculer les heures supplémentaires proportionnelles pour ce jour
        const hsJour25 = jour.heuresTravaillees * facteurHS25;
        const hsJour50 = jour.heuresTravaillees * facteurHS50;
        
        // Uniquement afficher si ces valeurs sont significatives
        if (hsJour25 > 0.01) {
          worksheet.getCell(`I${rowIndex}`).value = decimalVersHeuresMinutes(hsJour25);
          worksheet.getCell(`I${rowIndex}`).style = createBorderedStyle({
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2CC' } }
          });
        }
        
        if (hsJour50 > 0.01) {
          worksheet.getCell(`J${rowIndex}`).value = decimalVersHeuresMinutes(hsJour50);
          worksheet.getCell(`J${rowIndex}`).style = createBorderedStyle({
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FCE4D6' } }
          });
        }
      }
      
      rowIndex++;
    });
    
    // Ligne de totaux
    rowIndex += 1;
    worksheet.getCell(`F${rowIndex}`).value = 'TOTAL:';
    worksheet.getCell(`F${rowIndex}`).font = { bold: true };
    worksheet.getCell(`F${rowIndex}`).alignment = { horizontal: 'right' };
    
    worksheet.getCell(`G${rowIndex}`).value = decimalVersHeuresMinutes(resultatsSemaine.totalHeuresTravaillees);
    worksheet.getCell(`G${rowIndex}`).font = { bold: true };
    worksheet.getCell(`G${rowIndex}`).alignment = { horizontal: 'center' };
    worksheet.getCell(`G${rowIndex}`).fill = { 
      type: 'pattern', 
      pattern: 'solid', 
      fgColor: { argb: 'CCFFCC' } 
    };
    
    // Si des heures supplémentaires existent, les afficher
    if (resultatsSemaine.heuresSupp25 > 0) {
      worksheet.getCell(`I${rowIndex}`).value = decimalVersHeuresMinutes(resultatsSemaine.heuresSupp25);
      worksheet.getCell(`I${rowIndex}`).font = { bold: true };
      worksheet.getCell(`I${rowIndex}`).alignment = { horizontal: 'center' };
      worksheet.getCell(`I${rowIndex}`).fill = { 
        type: 'pattern', 
        pattern: 'solid', 
        fgColor: { argb: 'FFC000' } 
      };
    }
    
    if (resultatsSemaine.heuresSupp50 > 0) {
      worksheet.getCell(`J${rowIndex}`).value = decimalVersHeuresMinutes(resultatsSemaine.heuresSupp50);
      worksheet.getCell(`J${rowIndex}`).font = { bold: true };
      worksheet.getCell(`J${rowIndex}`).alignment = { horizontal: 'center' };
      worksheet.getCell(`J${rowIndex}`).fill = { 
        type: 'pattern', 
        pattern: 'solid', 
        fgColor: { argb: 'FF99CC' } 
      };
    }
    
    // Signatures
    rowIndex += 3;
    worksheet.getCell(`B${rowIndex}`).value = 'SIGNATURE SALARIE';
    worksheet.getCell(`B${rowIndex}`).font = { bold: true };
    
    worksheet.getCell(`G${rowIndex}`).value = 'SIGNATURE RESPONSABLE';
    worksheet.getCell(`G${rowIndex}`).font = { bold: true };
    
    // Ajout d'un tableau récapitulatif détaillé et plus structuré
    rowIndex += 3;
    worksheet.getCell(`A${rowIndex}`).value = 'RÉCAPITULATIF SEMAINE';
    worksheet.getCell(`A${rowIndex}`).font = { bold: true, size: 12 };
    worksheet.mergeCells(`A${rowIndex}:E${rowIndex}`);
    worksheet.getCell(`A${rowIndex}`).alignment = { horizontal: 'center' };
    worksheet.getCell(`A${rowIndex}`).fill = { 
      type: 'pattern', 
      pattern: 'solid', 
      fgColor: { argb: 'E2EFDA' } 
    };
    
    rowIndex += 2;
    // En-tête du tableau récapitulatif
    worksheet.getCell(`A${rowIndex}`).value = 'Type d\'heures';
    worksheet.getCell(`B${rowIndex}`).value = 'Quantité';
    worksheet.getCell(`C${rowIndex}`).value = 'Majoration';
    worksheet.getCell(`D${rowIndex}`).value = 'Information';
    worksheet.getCell(`E${rowIndex}`).value = 'Code';
    
    ['A', 'B', 'C', 'D', 'E'].forEach(col => {
      worksheet.getCell(`${col}${rowIndex}`).font = { bold: true };
      worksheet.getCell(`${col}${rowIndex}`).fill = { 
        type: 'pattern', 
        pattern: 'solid', 
        fgColor: { argb: 'DDEBF7' } 
      };
      worksheet.getCell(`${col}${rowIndex}`).border = createBorderedStyle().border;
      worksheet.getCell(`${col}${rowIndex}`).alignment = { horizontal: 'center' };
    });
    
    // Élargir la colonne des informations pour éviter la troncature
    worksheet.getColumn('D').width = 25;
    
    // Lignes du tableau récapitulatif - spécifiques à la semaine actuelle
    // IMPORTANT: Utiliser toujours les données de la semaine courante
    rowIndex += 1;
    
    // Déterminer les valeurs pour la semaine actuelle
    const heuresNormalesSemaine = Math.min(
      resultatsSemaine.totalHeuresTravaillees, 
      resultatsSemaine.seuilAjuste
    );
    
    worksheet.getCell(`A${rowIndex}`).value = 'Heures normales';
    worksheet.getCell(`B${rowIndex}`).value = decimalVersHeuresMinutes(heuresNormalesSemaine);
    worksheet.getCell(`C${rowIndex}`).value = '0%';
    worksheet.getCell(`D${rowIndex}`).value = 'Heures contractuelles';
    worksheet.getCell(`E${rowIndex}`).value = 'HN';
    
    // Style pour les heures normales
    ['A', 'B', 'C', 'D', 'E'].forEach(col => {
      worksheet.getCell(`${col}${rowIndex}`).border = createBorderedStyle().border;
      worksheet.getCell(`${col}${rowIndex}`).alignment = { horizontal: 'center' };
    });
    worksheet.getCell(`E${rowIndex}`).fill = { 
      type: 'pattern', 
      pattern: 'solid', 
      fgColor: { argb: 'CCFFCC' } 
    };
    
    // Heures diverses si présentes
    if (resultatsSemaine.heuresDiverses > 0) {
      rowIndex += 1;
      worksheet.getCell(`A${rowIndex}`).value = 'Heures diverses';
      worksheet.getCell(`B${rowIndex}`).value = decimalVersHeuresMinutes(resultatsSemaine.heuresDiverses);
      worksheet.getCell(`C${rowIndex}`).value = '0%';
      worksheet.getCell(`D${rowIndex}`).value = 'Entre seuil ajusté et 35h';
      worksheet.getCell(`E${rowIndex}`).value = 'HD';
      
      ['A', 'B', 'C', 'D', 'E'].forEach(col => {
        worksheet.getCell(`${col}${rowIndex}`).border = createBorderedStyle().border;
        worksheet.getCell(`${col}${rowIndex}`).alignment = { horizontal: 'center' };
      });
      worksheet.getCell(`E${rowIndex}`).fill = { 
        type: 'pattern', 
        pattern: 'solid', 
        fgColor: { argb: 'BDD7EE' } 
      };
    }
    
    // Heures supplémentaires 25% si présentes
    if (resultatsSemaine.heuresSupp25 > 0) {
      rowIndex += 1;
      worksheet.getCell(`A${rowIndex}`).value = 'Heures supp. 25%';
      worksheet.getCell(`B${rowIndex}`).value = decimalVersHeuresMinutes(resultatsSemaine.heuresSupp25);
      worksheet.getCell(`C${rowIndex}`).value = '25%';
      worksheet.getCell(`D${rowIndex}`).value = `De ${salaireInfo.seuilHebdo}h à ${salaireInfo.seuilHS2}h`;
      worksheet.getCell(`E${rowIndex}`).value = 'HS 25%';
      
      ['A', 'B', 'C', 'D', 'E'].forEach(col => {
        worksheet.getCell(`${col}${rowIndex}`).border = createBorderedStyle().border;
        worksheet.getCell(`${col}${rowIndex}`).alignment = { horizontal: 'center' };
      });
      worksheet.getCell(`E${rowIndex}`).fill = { 
        type: 'pattern', 
        pattern: 'solid', 
        fgColor: { argb: 'FFC000' } 
      };
    }
    
    // Heures supplémentaires 50% si présentes
    if (resultatsSemaine.heuresSupp50 > 0) {
      rowIndex += 1;
      worksheet.getCell(`A${rowIndex}`).value = 'Heures supp. 50%';
      worksheet.getCell(`B${rowIndex}`).value = decimalVersHeuresMinutes(resultatsSemaine.heuresSupp50);
      worksheet.getCell(`C${rowIndex}`).value = '50%';
      worksheet.getCell(`D${rowIndex}`).value = `Au-delà de ${salaireInfo.seuilHS2}h`;
      worksheet.getCell(`E${rowIndex}`).value = 'HS 50%';
      
      ['A', 'B', 'C', 'D', 'E'].forEach(col => {
        worksheet.getCell(`${col}${rowIndex}`).border = createBorderedStyle().border;
        worksheet.getCell(`${col}${rowIndex}`).alignment = { horizontal: 'center' };
      });
      worksheet.getCell(`E${rowIndex}`).fill = { 
        type: 'pattern', 
        pattern: 'solid', 
        fgColor: { argb: 'FF99CC' } 
      };
    }
    
    // Ligne de total
    rowIndex += 1;
    worksheet.getCell(`A${rowIndex}`).value = 'TOTAL';
    worksheet.getCell(`B${rowIndex}`).value = decimalVersHeuresMinutes(resultatsSemaine.totalHeuresTravaillees);
    
    ['A', 'B', 'C', 'D', 'E'].forEach(col => {
      worksheet.getCell(`${col}${rowIndex}`).font = { bold: true };
      worksheet.getCell(`${col}${rowIndex}`).fill = { 
        type: 'pattern', 
        pattern: 'solid', 
        fgColor: { argb: 'DDEBF7' } 
      };
      worksheet.getCell(`${col}${rowIndex}`).border = createBorderedStyle().border;
      worksheet.getCell(`${col}${rowIndex}`).alignment = { horizontal: 'center' };
    });
  }
  
  // Générer le fichier
  const buffer = await workbook.xlsx.writeBuffer();
  
  // Créer un Blob et télécharger
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  
  // Nom du fichier
  if (isMonthExport) {
    a.download = `heures_${salaireInfo.nom}_${salaireInfo.prenom}_${monthName || 'mois'}.xlsx`;
  } else {
    a.download = `heures_${salaireInfo.nom}_${salaireInfo.prenom}_semaine${semaines[0].numeroSemaine}.xlsx`;
  }
  
  a.click();
  window.URL.revokeObjectURL(url);
};