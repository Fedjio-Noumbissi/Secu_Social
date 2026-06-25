import { Box, Grid, Paper, Typography, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { CalendarToday as CalendarIcon, People as PeopleIcon } from '@mui/icons-material';
import type { Consultation, Assure, Medecin, FeuilleMaladie } from '../../types';
import { formatDate } from '../../utils/dateHelpers';
import { maskSSN } from '../../utils/maskSSN';

interface ActivityTabProps {
  consultations: Consultation[];
  feuilles: FeuilleMaladie[];
  assures: Assure[];
  medecins: Medecin[];
  userId?: string;
  role: string;
}

const ActivityTab = ({ consultations, feuilles, assures, medecins, userId, role }: ActivityTabProps) => {
  const now = new Date();
  const monthConsultations = consultations.filter((c) => {
    const d = new Date(c.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const todayConsultations = consultations.filter((c) => c.date === now.toISOString().split('T')[0]);

  const getAssureName = (id: string) => {
    const a = assures.find(a => String(a.id) === String(id));
    return a ? `${a.prenom} ${a.nom}` : 'Inconnu';
  };

  const getMedecinName = (id: string) => {
    const m = medecins.find(m => String(m.id) === String(id));
    return m ? `Dr ${m.prenom} ${m.nom}` : 'Inconnu';
  };

  const myConsultations = role === 'medecin'
    ? consultations.filter(c => {
        const m = medecins.find(m => String(m.userId) === String(userId));
        return m && String(c.medecinId) === String(m.id);
      })
    : consultations;

  const myFeuilles = role === 'medecin'
    ? feuilles.filter(f => {
        const m = medecins.find(m => String(m.userId) === String(userId));
        return m && String(f.medecinId) === String(m.id);
      })
    : feuilles;

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

      {role === 'medecin' && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#8B4513' }}>
            Mes Patients ({assures.length})
          </Typography>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Prénom</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>N° Sécu</TableCell>
                  <TableCell>Sexe</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Téléphone</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assures.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">Aucun patient attribué.</TableCell>
                  </TableRow>
                ) : (
                  assures.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell sx={{ fontWeight: 500 }}>{a.nom}</TableCell>
                      <TableCell>{a.prenom}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{maskSSN(a.numSecu)}</TableCell>
                      <TableCell>{a.sexe}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{a.telephone}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#8B4513' }}>
          Consultations ({myConsultations.length})
        </Typography>
        <TableContainer sx={{ overflowX: 'auto' }}>
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

      {role === 'medecin' && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#8B4513' }}>
            Feuilles de maladie ({myFeuilles.length})
          </Typography>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Détails</TableCell>
                  <TableCell>Médecin</TableCell>
                  <TableCell>Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {myFeuilles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">Aucune feuille de maladie.</TableCell>
                  </TableRow>
                ) : (
                  myFeuilles.slice().reverse().map((f) => {
                    return (
                      <TableRow key={f.id}>
                        <TableCell>{formatDate(f.date)}</TableCell>
                        <TableCell>{getAssureName(f.assureId)}</TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{f.details.substring(0, 50)}...</TableCell>
                        <TableCell>{getMedecinName(f.medecinId)}</TableCell>
                        <TableCell>
                          <Chip label={f.validee ? 'Validée' : 'En attente'} size="small" color={f.validee ? 'success' : 'warning'} />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default ActivityTab;
