# TimeTrack - Application de calcul des heures supplémentaires

Une application web moderne pour calculer et gérer les heures supplémentaires des employés avec une interface élégante et intuitive.

## Fonctionnalités

- **Calcul automatique des heures supplémentaires** selon les règles légales françaises
- **Tableau de bord** avec visualisation des données et statistiques
- **Feuille de temps** personnalisable pour saisir les heures travaillées
- **Gestion des absences** (congés payés, RTT, maladie, etc.)
- **Export Excel** des données saisies pour l'intégration avec les systèmes de paie
- **Interface moderne** et responsive inspirée des applications professionnelles actuelles

## Technologies utilisées

- React 18
- Tailwind CSS
- SheetJS (pour l'export Excel)
- Lucide React (pour les icônes)
- Date-fns (pour la manipulation des dates)

## Installation

1. Clonez ce dépôt
```bash
git clone https://github.com/votre-nom/timetrack-app.git
cd timetrack-app
```

2. Installez les dépendances
```bash
npm install
```

3. Lancez l'application en mode développement
```bash
npm start
```

4. Accédez à l'application sur http://localhost:3000

## Structure du projet

- `src/components/` - Composants React organisés par fonctionnalité
- `src/context/` - Contexte React pour la gestion de l'état global
- `src/utils/` - Fonctions utilitaires pour les calculs et l'export
- `src/constants/` - Constantes et données statiques
- `public/` - Ressources statiques

## Utilisation

1. Configurez vos informations personnelles dans l'onglet "Paramètres"
2. Définissez la semaine de travail en sélectionnant une date de début
3. Saisissez vos heures travaillées pour chaque jour
4. Consultez les résultats dans le tableau de bord
5. Exportez les données en Excel si nécessaire

## Logique de calcul

L'application utilise la logique suivante pour calculer les heures supplémentaires :

1. **Calcul du seuil hebdomadaire ajusté** : 
   - 35 heures par défaut pour 5 jours travaillés (7h/jour)
   - Les jours d'absence (CP, RTT, etc.) sont exclus du calcul

2. **Catégorisation des heures** :
   - Heures normales : jusqu'au seuil ajusté
   - Heures diverses : entre le seuil ajusté et 35h
   - Heures supplémentaires à 25% : entre 35h et 43h
   - Heures supplémentaires à 50% : au-delà de 43h

## Personnalisation

Vous pouvez personnaliser différents paramètres dans l'application :
- Heures contractuelles par jour (par défaut : 7h)
- Seuil hebdomadaire (par défaut : 35h)
- Seuil pour le passage à 50% (par défaut : 43h)

## Licence

MIT