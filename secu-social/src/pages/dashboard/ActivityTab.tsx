import { useMemo } from 'react';
import { Box, Grid, Paper, Typography, List, ListItem, ListItemText, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { CalendarToday as CalendarIcon, People as PeopleIcon, Description as DescriptionIcon } from '@mui/icons-material';
import type { Consultation, Assure, Medecin } from '../../types';
import { formatDate } from '../../utils/dateHelpers';
import { maskSSN } from '../../utils/maskSSN';

interface ActivityTabProps {
  consultations: Consultation[];
  assures: Assure[];
  medecins: Medecin[];
  userId?: string;
  role: string;
}

const ActivityTab = ({ consultations, assures, medecins, userId, role }: ActivityTabProps) => {
  const now = new Date();
  const monthConsultations = consultations.filter((c) => {
    const d = new Date(c.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const todayConsultations = consultations.filter((c) => c.date === now.toISOString().split('T')[0]);

  const getAssureName = (id: string) => {
    const a = assures.find(a => a.id === id);
    return a ? `${a.prenom} ${a.nom}` : 'Inconnu';
  };

  const getMedecinName = (id: string) => {
    const m = medecins.find(m => m.id === id);
    return m ? `Dr ${m.prenom} ${m.nom}` : 'Inconnu';
  };

  const myConsultations = role === 'medecin'
    ? consultations.filter(c => {
        const m = medecins.find(m => m.userId === userId);
        return m && c.medecinId === m.id;
      })
    : consultations;

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Paper sx={{ p: 2, textAlign: 'center', borderTop: '4px solid #8B4513' }}>
            <CalendarIcon sx={{ fontSize: { xs: 24, md: 32 }, color: '#8B4513', mb: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{monthConsultations.length}</Typography>
            <Typography variant="body2" color="text.secondary">Consultations ce mois</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Paper sx={{ p: 2, textAlign: 'center', borderTop: '4px solid #2E7D32' }}>
            <CalendarIcon sx={{ fontSize: { xs: 24, md: 32 }, color: '#2E7D32', mb: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{todayConsultations.length}</Typography>
            <Typography variant="body2" color="text.secondary">Aujourd'hui</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Paper sx={{ p: 2, textAlign: 'center', borderTop: '4px solid #D2691E' }}>
            <PeopleIcon sx={{ fontSize: { xs: 24, md: 32 }, color: '#D2691E', mb: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{assures.length}</Typography>
            <Typography variant="body2" color="text.secondary">Assurés</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#8B4513' }}>
          Consultations ({myConsultations.length})
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Motif</TableCell>
                <TableCell>Médecin</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>N° Sécu</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {myConsultations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">Aucune consultation.</TableCell>
                </TableRow>
              ) : (
                myConsultations.slice().reverse().map((c) => {
                  const assure = assures.find(a => a.id === c.assureId);
                  return (
                    <TableRow key={c.id}>
                      <TableCell>{formatDate(c.date)}</TableCell>
                      <TableCell>{getAssureName(c.assureId)}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{c.motif}</TableCell>
                      <TableCell>{getMedecinName(c.medecinId)}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{assure ? maskSSN(assure.numSecu) : '-'}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ActivityTab;
