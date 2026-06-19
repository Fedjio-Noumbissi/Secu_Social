import { createContext, useContext, ReactNode } from 'react';
import type { Role } from '../types';

interface NavigationItem {
  label: string;
  path: string;
  icon: string;
  roles: Role[];
}

const navigationItems: NavigationItem[] = [
  { label: 'Tableau de bord', path: '/dashboard', icon: 'dashboard', roles: ['assureur', 'medecin'] },
  { label: 'Assurés', path: '/assures', icon: 'people', roles: ['assureur'] },
  { label: 'Médecins', path: '/medecins', icon: 'medical_services', roles: ['assureur'] },
  { label: 'Attribution MT', path: '/attribution', icon: 'assignment_ind', roles: ['assureur'] },
  { label: 'Consultations', path: '/consultations', icon: 'event_note', roles: ['medecin'] },
  { label: 'Feuilles de maladie', path: '/feuilles-maladie', icon: 'description', roles: ['medecin'] },
  { label: 'Prescriptions', path: '/prescriptions/medicaments', icon: 'medication', roles: ['medecin'] },
  { label: 'Remboursements', path: '/remboursements', icon: 'payments', roles: ['assureur'] },
  { label: 'Rapports', path: '/rapports', icon: 'bar_chart', roles: ['assureur'] },
];

export const getNavigationByRole = (role: Role): NavigationItem[] => {
  return navigationItems.filter((item) => item.roles.includes(role));
};

export { navigationItems };
export type { NavigationItem };
