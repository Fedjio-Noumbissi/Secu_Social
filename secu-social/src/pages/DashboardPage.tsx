import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Payments as PaymentsIcon,
  EventNote as EventNoteIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { selectUser } from '../features/auth/authSlice';
import { apiService } from '../services/api';
import type { Assure, Medecin, Remboursement, Consultation, DashboardStats } from '../types';
import OverviewTab from './dashboard/OverviewTab';
import RemboursementsTab from './dashboard/RemboursementsTab';
import ActivityTab from './dashboard/ActivityTab';
import AlertsTab from './dashboard/AlertsTab';
import type { PrescriptionSpecialiste, FeuilleMaladie } from '../types';

const allTabs = [
  { label: 'Vue d\'ensemble', icon: <DashboardIcon />, roles: ['assureur', 'medecin'], component: 'overview' as const },
  { label: 'Remboursements', icon: <PaymentsIcon />, roles: ['assureur'], component: 'remboursements' as const },
  { label: 'Activité', icon: <EventNoteIcon />, roles: ['assureur', 'medecin'], component: 'activity' as const },
  { label: 'Alertes', icon: <WarningIcon />, roles: ['assureur'], component: 'alerts' as const },
];

const DashboardPage = () => {
  const user = useSelector(selectUser);
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState<DashboardStats>({
    nbAssures: 0,
    nbMedecins: 0,
    totalRembourse: 0,
    remboursementsEnAttente: 0,
    consultationsMois: 0,
  });
  const [recentRemboursements, setRecentRemboursements] = useState<Remboursement[]>([]);
  const [assures, setAssures] = useState<Assure[]>([]);
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [remboursements, setRemboursements] = useState<Remboursement[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [feuillesMaladie, setFeuillesMaladie] = useState<FeuilleMaladie[]>([]);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assuresData, medecinsData, rembData, consultData, prescriptionsData, feuillesData] = await Promise.all([
          apiService.get<Assure[]>('/assures'),
          apiService.get<Medecin[]>('/medecins'),
          apiService.get<Remboursement[]>('/remboursements'),
          apiService.get<Consultation[]>('/consultations'),
          apiService.get<PrescriptionSpecialiste[]>('/prescriptionsSpecialistes').catch(() => []),
          apiService.get<FeuilleMaladie[]>('/feuillesMaladie').catch(() => []),
        ]);

        const isMedecin = user?.role === 'medecin';
        
        let filteredAssures = assuresData;
        let myAssureIds: string[] = [];

        if (isMedecin) {
          const assignedAssureIds = prescriptionsData
            .filter(p => String(p.specialisteId) === String(user?.profilId))
            .map(p => String(p.assureId));
            
          const consultedAssureIds = consultData
            .filter(c => String(c.medecinId) === String(user?.profilId))
            .map(c => String(c.assureId));

          const feuillesAssureIds = feuillesData
            .filter(f => String(f.medecinId) === String(user?.profilId))
            .map(f => String(f.assureId));

          const allMyAssureIds = new Set([
            ...assignedAssureIds,
            ...consultedAssureIds,
            ...feuillesAssureIds
          ]);
            
          filteredAssures = assuresData.filter(
            a => String(a.medecinTraitantId) === String(user?.profilId) || allMyAssureIds.has(String(a.id))
          );
          myAssureIds = filteredAssures.map(a => String(a.id));
        }

        const filteredConsultations = isMedecin 
          ? consultData.filter(c => String(c.medecinId) === String(user?.profilId) || myAssureIds.includes(String(c.assureId))) 
          : consultData;
          
        const filteredFeuilles = isMedecin
          ? feuillesData.filter(f => String(f.medecinId) === String(user?.profilId) || myAssureIds.includes(String(f.assureId)))
          : feuillesData;

        // Build greeting name with title and specialty
        if (user?.profilId) {
          if (isMedecin) {
            const medProfil = medecinsData.find(m => String(m.id) === String(user.profilId));
            if (medProfil) {
              const specialiteLabel = medProfil.specialite === 'generaliste' ? 'Généraliste' : 'Spécialiste';
              setDisplayName(`Dr. ${medProfil.prenom} ${medProfil.nom} (${specialiteLabel})`);
            }
          } else {
            const agentProfil = assuresData.find(a => String(a.id) === String(user.profilId));
            if (agentProfil) setDisplayName(`${agentProfil.prenom} ${agentProfil.nom} (Assureur)`);
            else setDisplayName(user.email || '');
          }
        } else {
          setDisplayName(user?.email || '');
        }

        setAssures(filteredAssures);
        setMedecins(medecinsData);
        setConsultations(filteredConsultations);
        setFeuillesMaladie(filteredFeuilles);
        setRecentRemboursements(rembData.slice(-3).reverse());
        setRemboursements(rembData);

        const totalRemb = rembData.reduce((sum, r) => sum + r.montantRembourse, 0);
        const now = new Date();
        const monthConsultations = filteredConsultations.filter((c) => {
          const d = new Date(c.date);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });

        setStats({
          nbAssures: filteredAssures.length,
          nbMedecins: medecinsData.length,
          totalRembourse: totalRemb,
          remboursementsEnAttente: rembData.filter((r) => {
            const days = (new Date().getTime() - new Date(r.date).getTime()) / (1000 * 60 * 60 * 24);
            return days > 30;
          }).length,
          consultationsMois: monthConsultations.length,
        });
      } catch (err) {
        console.error('Erreur chargement données dashboard', err);
      }
    };
    fetchData();
  }, [user?.role, user?.profilId]);

  const role = user?.role;
  const visibleTabs = useMemo(
    () => allTabs.filter(t => t.roles.includes(role || '')),
    [role]
  );

  const safeIndex = Math.min(activeTab, visibleTabs.length - 1);

  const renderTab = () => {
    if (safeIndex < 0 || safeIndex >= visibleTabs.length) return null;
    const comp = visibleTabs[safeIndex].component;
    switch (comp) {
      case 'overview':
        return (
          <OverviewTab
            stats={stats}
            role={role || ''}
            recentRemboursements={recentRemboursements}
            consultations={consultations}
            feuilles={feuillesMaladie}
            assures={assures}
            userName={displayName || user?.email || ''}
          />
        );
      case 'remboursements':
        return <RemboursementsTab remboursements={remboursements} />;
      case 'activity':
        return (
          <ActivityTab
            consultations={consultations}
            feuilles={feuillesMaladie}
            assures={assures}
            medecins={medecins}
            userId={user?.id}
            role={role || ''}
          />
        );
      case 'alerts':
        return <AlertsTab remboursements={remboursements} assures={assures} medecins={medecins} />;
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B4513', mb: 1, fontSize: { xs: '1.4rem', sm: '1.75rem', md: '2rem' } }}>
        Tableau de bord
      </Typography>

      <Tabs
        value={safeIndex}
        onChange={(_, v) => setActiveTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          mb: 3,
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 },
          '& .Mui-selected': { color: '#8B4513 !important' },
          '& .MuiTabs-indicator': { backgroundColor: '#8B4513' },
        }}
      >
        {visibleTabs.map((tab) => (
          <Tab key={tab.label} icon={tab.icon} label={tab.label} iconPosition="start" />
        ))}
      </Tabs>

      {renderTab()}
    </Box>
  );
};

export default DashboardPage;
