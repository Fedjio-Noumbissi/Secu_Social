import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Grid, Button, CircularProgress, Divider, Table, TableBody, TableCell, TableRow } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Edit as EditIcon } from '@mui/icons-material';
import { apiService } from '../../services/api';
import type { Assure, Medecin } from '../../types';
import { formatDate } from '../../utils/dateHelpers';
import MaskedSSN from '../../components/common/MaskedSSN';

const AssureDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assure, setAssure] = useState<Assure | null>(null);
  const [medecinTraitant, setMedecinTraitant] = useState<Medecin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assuresData, medecinsData] = await Promise.all([
          apiService.get<Assure[]>('/assures'),
          apiService.get<Medecin[]>('/medecins'),
        ]);

        const a = assuresData.find((a) => String(a.id) === String(id));
        if (a) {
          setAssure(a);
          if (a.medecinTraitantId) {
            const m = medecinsData.find((m) => String(m.id) === String(a.medecinTraitantId));
            if (m) setMedecinTraitant(m);
          }
        }
      } catch (err) {
        console.error('Erreur chargement détail assuré', err);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  if (!assure) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" color="text.secondary">Assuré introuvable</Typography>
        <Button onClick={() => navigate('/assures')} sx={{ mt: 2 }}>Retour à la liste</Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3, flexWrap: 'wrap', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="outlined" size="small" onClick={() => navigate('/assures')} startIcon={<ArrowBackIcon />}>Retour</Button>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B4513', fontSize: { xs: '1.3rem', sm: '1.75rem', md: '2rem' } }}>Détails de l'assuré</Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<EditIcon />} onClick={() => navigate(`/assures/${id}/edit`)} sx={{ width: { xs: '100%', sm: 'auto' } }}>Modifier</Button>
      </Box>

      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ border: '1px solid #D2691E', borderRadius: 1, p: 2, bgcolor: '#FFF8F0', height: '100%' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#8B4513', mb: 1, textTransform: 'uppercase' }}>Informations Personnelles</Typography>
              <Divider sx={{ mb: 1.5, borderColor: '#D2691E' }} />
              <Table size="small" sx={{ '& .MuiTableCell-root': { border: 'none', py: 1, pl: 0 } }}>
                <TableBody>
                  <TableRow><TableCell sx={{ color: '#666', width: 150 }}>Nom</TableCell><TableCell sx={{ fontWeight: 600 }}>{assure.nom}</TableCell></TableRow>
                  <TableRow><TableCell sx={{ color: '#666' }}>Prénom</TableCell><TableCell sx={{ fontWeight: 600 }}>{assure.prenom}</TableCell></TableRow>
                  <TableRow><TableCell sx={{ color: '#666' }}>Date de naissance</TableCell><TableCell>{formatDate(assure.dateNaissance)}</TableCell></TableRow>
                  <TableRow><TableCell sx={{ color: '#666' }}>Sexe</TableCell><TableCell>{assure.sexe === 'M' ? 'Masculin' : 'Féminin'}</TableCell></TableRow>
                  <TableRow><TableCell sx={{ color: '#666' }}>N° Sécurité sociale</TableCell><TableCell><MaskedSSN value={assure.numSecu} /></TableCell></TableRow>
                </TableBody>
              </Table>
            </Box>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ border: '1px solid #D2691E', borderRadius: 1, p: 2, height: '100%' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#8B4513', mb: 1, textTransform: 'uppercase' }}>Coordonnées & Médical</Typography>
              <Divider sx={{ mb: 1.5, borderColor: '#D2691E' }} />
              <Table size="small" sx={{ '& .MuiTableCell-root': { border: 'none', py: 1, pl: 0 } }}>
                <TableBody>
                  <TableRow><TableCell sx={{ color: '#666', width: 150 }}>Email</TableCell><TableCell>{assure.email}</TableCell></TableRow>
                  <TableRow><TableCell sx={{ color: '#666' }}>Téléphone</TableCell><TableCell>{assure.telephone}</TableCell></TableRow>
                  <TableRow><TableCell sx={{ color: '#666' }}>Adresse</TableCell><TableCell>{assure.adresse}</TableCell></TableRow>
                  <TableRow><TableCell sx={{ color: '#666' }}>Médecin traitant</TableCell><TableCell sx={{ fontWeight: 600, color: medecinTraitant ? '#2E7D32' : 'inherit' }}>{medecinTraitant ? `Dr ${medecinTraitant.prenom} ${medecinTraitant.nom}` : 'Non assigné'}</TableCell></TableRow>
                </TableBody>
              </Table>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default AssureDetailPage;
