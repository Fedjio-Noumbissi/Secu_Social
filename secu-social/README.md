# Secu Social

Application web de gestion de la sécurité sociale au Cameroun.

## Stack technique

- **Frontend** : React 19 + TypeScript + Vite 8
- **UI** : Material-UI (MUI) v9
- **State** : Redux Toolkit
- **Formulaires** : Formik + Yup
- **Graphiques** : Recharts
- **API mockée** : json-server
- **Export** : jsPDF, PapaParse

## Prérequis

- Node.js >= 18
- npm >= 9

## Installation

```bash
cd secu-social
npm install
```

## Démarrage

Deux terminaux sont nécessaires :

```bash
# Terminal 1 : API mockée (json-server)
npm run server

# Terminal 2 : Application React
npm run dev
```

Ou en une seule commande :

```bash
npm start
```

L'application sera accessible sur `http://localhost:5173` et l'API sur `http://localhost:3001`.

## Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Assureur | assureur@secu-social.cm | admin123 |
| Médecin | medecin@secu-social.cm | medecin123 |
| Spécialiste | specialiste@secu-social.cm | spec123 |
| Assuré | patient@secu-social.cm | patient123 |

## Structure du projet

```
secu-social/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── common/        # Composants réutilisables (MaskedSSN, etc.)
│   │   ├── guards/        # AuthGuard, RoleGuard
│   │   └── layout/        # LandingHeader, DashboardHeader, Sidebar, Footer
│   ├── features/          # Redux slices (auth, assures, medecins, etc.)
│   ├── layouts/           # LandingLayout, DashboardLayout
│   ├── pages/             # Toutes les pages de l'application
│   ├── routes/            # Router, navigation
│   ├── services/          # API service (Axios)
│   ├── theme/             # Thèmes MUI (landing, dashboard)
│   ├── types/             # Interfaces TypeScript
│   └── utils/             # Utilitaires (formatCurrency, maskSSN, etc.)
├── db.json                # Base de données mockée (json-server)
├── package.json
└── README.md
```

## Modules fonctionnels

### Landing page (publique)
- Présentation institutionnelle de Secu Social
- Bouton de connexion
- Chiffres clés

### Authentification
- Connexion par email/mot de passe
- Redirection vers le tableau de bord selon le rôle
- Mot de passe oublié (information)

### Assureur
- **Dashboard** : widgets (nb assurés, total remboursé, alertes)
- **Gestion des assurés** : CRUD complet avec masque n° sécu
- **Gestion des médecins** : CRUD avec contrainte généraliste/spécialiste
- **Attribution du médecin traitant** : recherche assuré + sélection généraliste
- **Remboursements** : calcul automatique (100% généraliste, 80% spécialiste), choix du mode de paiement (virement/espèces), impression
- **Rapports** : graphiques, filtres par période, export PDF/CSV/JSON

### Médecin
- **Dashboard** : consultations du mois, patients
- **Consultations** : enregistrement avec prescriptions
- **Feuilles de maladie** : création et validation
- **Prescriptions** : médicaments et consultation spécialiste

### Assuré
- **Dashboard** : informations personnelles, aperçu remboursements
- **Mon dossier** : profil complet avec médecin traitant
- **Mon historique** : historique des remboursements

## Règles métier implémentées

- Un médecin ne peut être que généraliste OU spécialiste (case à cocher exclusive)
- Un médecin peut être également assuré (checkbox)
- Le médecin traitant doit obligatoirement être un généraliste (filtre)
- Remboursement : 100% si généraliste, 80% si spécialiste
- Numéros de sécurité sociale masqués (4 derniers chiffres seulement)
- Téléphones au format camerounais (+237 6XX XX XX XX)
- Montants en FCFA

## Scripts disponibles

```bash
npm run dev      # Lance le serveur de développement Vite
npm run build    # Build de production
npm run server   # Lance json-server (port 3001)
npm start        # Lance json-server + Vite simultanément
npm run preview  # Prévisualisation du build
```
# Secu_Social
