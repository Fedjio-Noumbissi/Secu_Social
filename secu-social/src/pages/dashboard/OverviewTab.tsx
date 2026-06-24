import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  People as PeopleIcon,
  MedicalServices as MedIcon,
  Payments as PaymentsIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import type { DashboardStats, Remboursement, Consultation, Assure, FeuilleMaladie } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateHelpers';

interface OverviewTabProps {
  stats: DashboardStats;
  role: string;
  recentRemboursements: Remboursement[];
  consultations: Consultation[];
  feuilles: FeuilleMaladie[];
  assures: Assure[];
  userName: string;
}

const OverviewTab = ({ stats, role, recentRemboursements, consultations, feuilles, assures, userName }: OverviewTabProps) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, color: '#5D4037' }}>
        Bonjour, {userName}
      </Typography>

      {role === 'assureur' && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ borderLeft: '4px solid #8B4513' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Assurés</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.nbAssures}</Typography>
                  </Box>
                  <PeopleIcon sx={{ fontSize: { xs: 32, md: 40 }, color: '#8B4513', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ borderLeft: '4px solid #A0522D' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Médecins</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.nbMedecins}</Typography>
                  </Box>
                  <MedIcon sx={{ fontSize: { xs: 32, md: 40 }, color: '#A0522D', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ borderLeft: '4px solid #D2691E' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total remboursé</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1rem', md: '1.3rem' } }}>
                      {formatCurrency(stats.totalRembourse)}
                    </Typography>
                  </Box>
                  <PaymentsIcon sx={{ fontSize: { xs: 32, md: 40 }, color: '#D2691E', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ borderLeft: '4px solid #2E7D32' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Consultations/mois</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.consultationsMois}</Typography>
                  </Box>
                  <ScheduleIcon sx={{ fontSize: { xs: 32, md: 40 }, color: '#2E7D32', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {role === 'medecin' && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ borderLeft: '4px solid #8B4513' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Consultations ce mois</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.consultationsMois}</Typography>
                  </Box>
                  <ScheduleIcon sx={{ fontSize: { xs: 32, md: 40 }, color: '#8B4513', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ borderLeft: '4px solid #A0522D' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total assurés</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.nbAssures}</Typography>
                  </Box>
                  <PeopleIcon sx={{ fontSize: { xs: 32, md: 40 }, color: '#A0522D', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ borderLeft: '4px solid #D2691E' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Médecins</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.nbMedecins}</Typography>
                  </Box>
                  <MedIcon sx={{ fontSize: { xs: 32, md: 40 }, color: '#D2691E', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {role === 'assureur' && recentRemboursements.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#8B4513' }}>
            Remboursements récents
          </Typography>
          <List dense>
            {recentRemboursements.slice(0, 5).map((r) => (
              <ListItem key={r.id} divider>
                <ListItemText
                  primary={`${formatCurrency(r.montantRembourse)} - Taux: ${r.taux}%`}
                  secondary={`${formatDate(r.date)} - ${r.modePaiement === 'virement' ? 'Virement' : 'Espèces'}`}
                />
                <Chip
                  label={r.taux === 100 ? 'Généraliste' : 'Spécialiste'}
                  size="small"
                  color={r.taux === 100 ? 'success' : 'warning'}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {role === 'medecin' && consultations.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#8B4513' }}>
            Dernières consultations
          </Typography>
          <List dense>
            {consultations.slice(-5).reverse().map((c) => (
              <ListItem key={c.id} divider>
                <ListItemText
                  primary={c.motif}
                  secondary={c.observations ? `${c.observations.substring(0, 60)}...` : formatDate(c.date)}
                />
                <Chip label={formatDate(c.date)} size="small" variant="outlined" />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
      {role === 'medecin' && feuilles && feuilles.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#8B4513' }}>
            Dernières feuilles de maladie
          </Typography>
          <List dense>
            {feuilles.slice(-5).reverse().map((f) => {
              const assure = assures.find(a => String(a.id) === String(f.assureId));
              return (
                <ListItem key={f.id} divider>
                  <ListItemText
                    primary={`Feuille pour ${assure?.prenom || ''} ${assure?.nom || ''}`}
                    secondary={f.details ? `${f.details.substring(0, 60)}...` : formatDate(f.date)}
                  />
                  <Chip label={formatDate(f.date)} size="small" variant="outlined" />
                  {f.validee && <Chip label="Validée" size="small" color="success" sx={{ ml: 1 }} />}
                </ListItem>
              );
            })}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default OverviewTab;
