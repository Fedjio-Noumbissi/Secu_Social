import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Button, Chip, Divider, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import { apiService } from '../../services/api';
import type { Consultation, Assure, Medecin, PrescriptionMedicament, FeuilleMaladie } from '../../types';
import { formatDate, formatTime } from '../../utils/dateHelpers';

const ConsultationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [assure, setAssure] = useState<Assure | null>(null);
  const [medecin, setMedecin] = useState<Medecin | null>(null);
  const [prescriptions, setPrescriptions] = useState<PrescriptionMedicament[]>([]);
  const [feuilles, setFeuilles] = useState<FeuilleMaladie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [consultations, assures, medecins, prescs, feuillesData] = await Promise.all([
          apiService.get<Consultation[]>('/consultations'),
          apiService.get<Assure[]>('/assures'),
          apiService.get<Medecin[]>('/medecins'),
          apiService.get<PrescriptionMedicament[]>('/prescriptionsMedicaments'),
          apiService.get<FeuilleMaladie[]>('/feuillesMaladie'),
        ]);

        const consult = consultations.find((c) => c.id === id);
        if (!consult) return;
        setConsultation(consult);

        const a = assures.find((a) => a.id === consult.assureId);
        if (a) setAssure(a);

        const m = medecins.find((m) => m.id === consult.medecinId);
        if (m) setMedecin(m);

        const filteredPrescs = prescs.filter((p) =>
          consult.prescriptionMedicamentsIds?.includes(p.id)
        );
        setPrescriptions(filteredPrescs);

        const filteredFeuilles = feuillesData.filter(
          (f) => f.consultationId === consult.id
        );
        setFeuilles(filteredFeuilles);
      } catch (err) {
        console.error('Erreur chargement détail consultation', err);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  if (!consultation) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" color="text.secondary">Consultation introuvable</Typography>
        <Button onClick={() => navigate('/consultations')} sx={{ mt: 2 }}>
          Retour à la liste
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button variant="outlined" size="small" onClick={() => navigate('/consultations')} startIcon={<ArrowBackIcon />}>
            Retour
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B4513' }}>
            Détail de la consultation
          </Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<PrintIcon />} onClick={() => window.print()}>
          Imprimer
        </Button>
      </Box>

      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 3 }}>
        <Box className="print-header" sx={{ display: 'none', textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B4513', letterSpacing: 2 }}>
            SECU SOCIAL
          </Typography>
          <Typography variant="body1" sx={{ color: '#666' }}>
            Détail de la consultation médicale
          </Typography>
          <Divider sx={{ my: 1, borderColor: '#8B4513' }} />
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ border: '1px solid #D2691E', borderRadius: 1, p: 2, bgcolor: '#FFF8F0' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#8B4513', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                Patient
              </Typography>
              <Divider sx={{ mb: 1.5, borderColor: '#D2691E' }} />
              <Table size="small" sx={{ '& .MuiTableCell-root': { border: 'none', py: 0.5, pl: 0 } }}>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ width: 140, color: '#666' }}>Nom & Prénoms</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{assure ? `${assure.nom} ${assure.prenom}` : '—'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ width: 140, color: '#666' }}>N° Sécurité sociale</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{assure ? `**** *** ${assure.numSecu.slice(-4)}` : '—'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ border: '1px solid #D2691E', borderRadius: 1, p: 2, bgcolor: '#FFF8F0' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#8B4513', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                Médecin
              </Typography>
              <Divider sx={{ mb: 1.5, borderColor: '#D2691E' }} />
              <Table size="small" sx={{ '& .MuiTableCell-root': { border: 'none', py: 0.5, pl: 0 } }}>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ width: 140, color: '#666' }}>Nom & Prénoms</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{medecin ? `Dr ${medecin.nom} ${medecin.prenom}` : '—'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ width: 140, color: '#666' }}>Spécialité</TableCell>
                    <TableCell>
                      <Chip
                        label={medecin?.specialite === 'generaliste' ? 'Généraliste' : 'Spécialiste'}
                        size="small"
                        color={medecin?.specialite === 'generaliste' ? 'primary' : 'secondary'}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ border: '1px solid #D2691E', borderRadius: 1, p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#8B4513', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                Détails de la consultation
              </Typography>
              <Divider sx={{ mb: 1.5, borderColor: '#D2691E' }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary">Date</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatDate(consultation.date)}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary">Heure</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatTime(consultation.heure)}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">N° Consultation</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>CONS-{consultation.id.padStart(4, '0')}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary">Motif</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>{consultation.motif}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary">Observations</Typography>
                  <Typography variant="body1" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>{consultation.observations}</Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {prescriptions.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ border: '1px solid #D2691E', borderRadius: 1, p: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#8B4513', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Prescriptions médicamenteuses
                </Typography>
                <Divider sx={{ mb: 1.5, borderColor: '#D2691E' }} />
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Médicament</TableCell>
                        <TableCell>Posologie</TableCell>
                        <TableCell>Durée</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {prescriptions.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell sx={{ fontWeight: 600 }}>{p.medicament}</TableCell>
                          <TableCell>{p.posologie}</TableCell>
                          <TableCell>{p.duree}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Grid>
          )}

          {feuilles.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ border: '1px solid #D2691E', borderRadius: 1, p: 2, bgcolor: '#FFF8F0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#8B4513', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Feuille de maladie
                </Typography>
                <Divider sx={{ mb: 1.5, borderColor: '#D2691E' }} />
                {feuilles.map((f) => (
                  <Box key={f.id} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      <strong>Date :</strong> {formatDate(f.date)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Détails :</strong> {f.details}
                    </Typography>
                    <Chip
                      label={f.validee ? 'Validée' : 'Non validée'}
                      size="small"
                      color={f.validee ? 'success' : 'warning'}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                ))}
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default ConsultationDetailPage;
