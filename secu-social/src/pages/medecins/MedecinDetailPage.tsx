import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Grid, Button, CircularProgress, Divider, Table, TableBody, TableCell, TableRow, Chip, TableHead } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Edit as EditIcon } from '@mui/icons-material';
import { apiService } from '../../services/api';
import type { Medecin, Assure } from '../../types';

const MedecinDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [medecin, setMedecin] = useState<Medecin | null>(null);
  const [patients, setPatients] = useState<Assure[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [medData, assData] = await Promise.all([
          apiService.get<Medecin[]>('/medecins'),
          apiService.get<Assure[]>('/assures')
        ]);
        const m = medData.find((m) => String(m.id) === String(id));
        if (m) {
          setMedecin(m);
          setPatients(assData.filter(a => String(a.medecinTraitantId) === String(m.id)));
        }
      } catch (err) {
        console.error('Erreur chargement détail médecin', err);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  if (!medecin) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" color="text.secondary">Médecin introuvable</Typography>
        <Button onClick={() => navigate('/medecins')} sx={{ mt: 2 }}>Retour à la liste</Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3, flexWrap: 'wrap', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="outlined" size="small" onClick={() => navigate('/medecins')} startIcon={<ArrowBackIcon />}>Retour</Button>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B4513', fontSize: { xs: '1.3rem', sm: '1.75rem', md: '2rem' } }}>Détails du médecin</Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<EditIcon />} onClick={() => navigate(`/medecins/${id}/edit`)} sx={{ width: { xs: '100%', sm: 'auto' } }}>Modifier</Button>
      </Box>

      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ border: '1px solid #D2691E', borderRadius: 1, p: 2, bgcolor: '#FFF8F0', height: '100%' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#8B4513', mb: 1, textTransform: 'uppercase' }}>Informations Professionnelles</Typography>
              <Divider sx={{ mb: 1.5, borderColor: '#D2691E' }} />
              <Table size="small" sx={{ '& .MuiTableCell-root': { border: 'none', py: 1, pl: 0 } }}>
                <TableBody>
                  <TableRow><TableCell sx={{ color: '#666', width: 150 }}>Matricule</TableCell><TableCell sx={{ fontWeight: 600 }}>{medecin.matricule}</TableCell></TableRow>
                  <TableRow><TableCell sx={{ color: '#666' }}>Nom</TableCell><TableCell sx={{ fontWeight: 600 }}>{medecin.nom}</TableCell></TableRow>
                  <TableRow><TableCell sx={{ color: '#666' }}>Prénom</TableCell><TableCell sx={{ fontWeight: 600 }}>{medecin.prenom}</TableCell></TableRow>
                  <TableRow><TableCell sx={{ color: '#666' }}>Sexe</TableCell><TableCell>
                    {medecin.sexe
                      ? <Chip label={medecin.sexe === 'M' ? 'Masculin' : 'Féminin'} size="small" color={medecin.sexe === 'M' ? 'info' : 'secondary'} />
                      : <span style={{ color: '#999' }}>—</span>}
                  </TableCell></TableRow>
                  <TableRow><TableCell sx={{ color: '#666' }}>Date de naissance</TableCell><TableCell sx={{ fontWeight: 600 }}>
                    {medecin.dateNaissance
                      ? new Date(medecin.dateNaissance).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                      : <span style={{ color: '#999' }}>—</span>}
                  </TableCell></TableRow>
                  <TableRow><TableCell sx={{ color: '#666' }}>Spécialité</TableCell><TableCell>
                    <Chip label={medecin.specialite === 'generaliste' ? 'Généraliste' : 'Spécialiste'} size="small" color={medecin.specialite === 'generaliste' ? 'success' : 'warning'} />
                  </TableCell></TableRow>
                </TableBody>
              </Table>
            </Box>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ border: '1px solid #D2691E', borderRadius: 1, p: 2, height: '100%' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#8B4513', mb: 1, textTransform: 'uppercase' }}>Coordonnées & Autres</Typography>
              <Divider sx={{ mb: 1.5, borderColor: '#D2691E' }} />
              <Table size="small" sx={{ '& .MuiTableCell-root': { border: 'none', py: 1, pl: 0 } }}>
                <TableBody>
                  <TableRow><TableCell sx={{ color: '#666', width: 150 }}>Email</TableCell><TableCell>{medecin.email}</TableCell></TableRow>
                  <TableRow><TableCell sx={{ color: '#666' }}>Téléphone</TableCell><TableCell>{medecin.telephone}</TableCell></TableRow>
                  <TableRow><TableCell sx={{ color: '#666' }}>Aussi assuré ?</TableCell><TableCell>{medecin.estAussiAssure ? <Chip label="Oui" size="small" color="info" /> : <Chip label="Non" size="small" />}</TableCell></TableRow>
                </TableBody>
              </Table>
            </Box>
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <Box sx={{ border: '1px solid #D2691E', borderRadius: 1, p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#8B4513', mb: 1, textTransform: 'uppercase' }}>Patients assignés ({patients.length})</Typography>
              <Divider sx={{ mb: 1.5, borderColor: '#D2691E' }} />
              {patients.length > 0 ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Nom & Prénom</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>N° Sécu</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Téléphone</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {patients.map(p => (
                      <TableRow key={p.id}>
                        <TableCell>{p.nom} {p.prenom}</TableCell>
                        <TableCell>**** *** {p.numSecu.slice(-4)}</TableCell>
                        <TableCell>{p.telephone}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography variant="body2" color="text.secondary">Aucun patient n'est actuellement assigné à ce médecin.</Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default MedecinDetailPage;
