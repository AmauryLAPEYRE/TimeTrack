// Types d'absence
export const TYPES_ABSENCE = [
    { id: 'cp', label: 'Congé payé', excluDecompte: true, color: '#4F46E5' },
    { id: 'rtt', label: 'RTT', excluDecompte: true, color: '#3B82F6' },
    { id: 'maladie', label: 'Maladie', excluDecompte: false, color: '#EF4444' },
    { id: 'js', label: 'Jour de solidarité', excluDecompte: true, color: '#F59E0B' },
    { id: 'at', label: 'Accident du travail', excluDecompte: true, color: '#EC4899' },
    { id: 'ef', label: 'Événement familial', excluDecompte: true, color: '#8B5CF6' }
  ];
  
  // Jours de la semaine
  export const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  
  // Navigation items
  export const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: 'Home' },
    { id: 'timesheet', label: 'Timesheet', icon: 'Clock' },
    { id: 'settings', label: 'Paramètres', icon: 'Settings' },
    { id: 'reports', label: 'Rapports', icon: 'BarChart2', disabled: true },
    { id: 'team', label: 'Équipe', icon: 'Users', disabled: true }
  ];