export type Role = 'assureur' | 'medecin';
export type Specialite = 'generaliste' | 'specialiste';
export type Sexe = 'M' | 'F';
export type ModePaiement = 'virement' | 'especes';

export interface User {
  id: string;
  email: string;
  password: string;
  role: Role;
  profilId?: string;
  accountLocked?: boolean;
  failedAttempts?: number;
}

export interface Assure {
  id: string;
  userId?: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  sexe: Sexe;
  numSecu: string;
  adresse: string;
  telephone: string;
  email: string;
  medecinTraitantId?: string;
}

export interface Medecin {
  id: string;
  userId?: string;
  matricule: string;
  nom: string;
  prenom: string;
  specialite: Specialite;
  email: string;
  telephone: string;
  adresse: string;
  estAussiAssure: boolean;
  assureId?: string;
}

export interface Consultation {
  id: string;
  assureId: string;
  medecinId: string;
  date: string;
  heure: string;
  motif: string;
  observations: string;
  prescriptionMedicamentsIds?: string[];
  prescriptionSpecialisteId?: string;
}

export interface PrescriptionMedicament {
  id: string;
  assureId: string;
  medecinId: string;
  medicament: string;
  posologie: string;
  duree: string;
  date: string;
}

export interface PrescriptionSpecialiste {
  id: string;
  assureId: string;
  medecinIdGeneraliste: string;
  specialisteId: string;
  motif: string;
  justificatif: string;
  date: string;
}

export interface FeuilleMaladie {
  id: string;
  consultationId: string;
  assureId: string;
  medecinId: string;
  date: string;
  details: string;
  medicamentsPrescrits: string;
  recommandationSpecialiste: string;
  validee: boolean;
}

export interface Remboursement {
  id: string;
  feuilleMaladieId: string;
  assureId: string;
  consultationId: string;
  montantTotal: number;
  taux: number;
  montantRembourse: number;
  modePaiement: ModePaiement;
  rib?: string;
  date: string;
  horodatage: string;
  imprime: boolean;
}

export interface DashboardStats {
  nbAssures: number;
  nbMedecins: number;
  totalRembourse: number;
  remboursementsEnAttente: number;
  consultationsMois: number;
}
