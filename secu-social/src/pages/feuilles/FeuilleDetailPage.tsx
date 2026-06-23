import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Button, Divider, Table,
  TableBody, TableCell, TableRow, CircularProgress, Chip, Alert, Snackbar
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Print as PrintIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/auth/authSlice';
import { apiService } from '../../services/api';
import type { FeuilleMaladie, Assure, Medecin, Consultation } from '../../types';
import { formatDate } from '../../utils/dateHelpers';

const FeuilleDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [feuille, setFeuille] = useState<FeuilleMaladie | null>(null);
  const [assure, setAssure] = useState<Assure | null>(null);
  const [medecin, setMedecin] = useState<Medecin | null>(null);
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [specialiste, setSpecialiste] = useState<Medecin | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const user = useSelector(selectUser);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feuillesData, assuresData, medecinsData, consultationsData] = await Promise.all([
          apiService.get<FeuilleMaladie[]>('/feuillesMaladie'),
          apiService.get<Assure[]>('/assures'),
          apiService.get<Medecin[]>('/medecins'),
          apiService.get<Consultation[]>('/consultations'),
        ]);

        const f = feuillesData.find((f) => String(f.id) === String(id));
        if (!f) {
          setLoading(false);
          return;
        }
        setFeuille(f);

        const a = assuresData.find((a) => String(a.id) === String(f.assureId));
        if (a) setAssure(a);

        const m = medecinsData.find((m) => String(m.id) === String(f.medecinId));
        if (m) setMedecin(m);

        const c = consultationsData.find((c) => String(c.id) === String(f.consultationId));
        if (c) setConsultation(c);

        // Resolve specialist from prescriptionsSpecialistes or directly from medecins
        if (f.recommandationSpecialiste) {
          // Try to find as a prescription ID first, then directly as medecin ID
          try {
            const prescsData = await apiService.get<Array<{id: string; specialisteId: string}>>('/prescriptionsSpecialistes');
            const presc = prescsData.find(p => String(p.id) === String(f.recommandationSpecialiste));
            if (presc) {
              const sp = medecinsData.find(m => String(m.id) === String(presc.specialisteId));
              if (sp) setSpecialiste(sp);
            } else {
              // Fallback: treat as direct medecin ID
              const sp = medecinsData.find(m => String(m.id) === String(f.recommandationSpecialiste));
              if (sp) setSpecialiste(sp);
            }
          } catch {
            const sp = medecinsData.find(m => String(m.id) === String(f.recommandationSpecialiste));
            if (sp) setSpecialiste(sp);
          }
        }

      } catch (err) {
        console.error('Erreur chargement détail feuille', err);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  const handleValidate = async () => {
    if (!feuille) return;
    setValidating(true);
    try {
      await apiService.patch('/feuillesMaladie', feuille.id, { validee: true });
      setFeuille({ ...feuille, validee: true });
      setSuccessMsg('Feuille de maladie validée avec succès !');
    } catch (err) {
      console.error('Erreur lors de la validation', err);
    }
    setValidating(false);
  };

  if (!feuille) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" color="text.secondary">Feuille de maladie introuvable</Typography>
        <Button onClick={() => navigate('/feuilles-maladie')} sx={{ mt: 2 }}>
          Retour à la liste
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button variant="outlined" size="small" onClick={() => navigate('/feuilles-maladie')} startIcon={<ArrowBackIcon />}>
            Retour
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B4513' }}>
            Détail de la feuille de maladie
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {user?.role === 'assureur' && feuille && !feuille.validee && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={handleValidate}
              disabled={validating}
            >
              {validating ? 'Validation...' : 'Valider'}
            </Button>
          )}
          <Button variant="contained" color="primary" startIcon={<PrintIcon />} onClick={() => window.print()}>
            Imprimer
          </Button>
        </Box>
      </Box>

      <Snackbar open={!!successMsg} autoHideDuration={4000} onClose={() => setSuccessMsg('')}>
        <Alert severity="success" onClose={() => setSuccessMsg('')}>{successMsg}</Alert>
      </Snackbar>

      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 3 }}>
        <Box className="print-header" sx={{ display: 'none', textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B4513', letterSpacing: 2 }}>
            SECU SOCIALE
          </Typography>
          <Typography variant="body1" sx={{ color: '#666' }}>
            Feuille de maladie
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
                Détails de la maladie
              </Typography>
              <Divider sx={{ mb: 1.5, borderColor: '#D2691E' }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary">Date de déclaration</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatDate(feuille.date)}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary">N° Feuille</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>FM-{String(feuille.id).padStart(4, '0')}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">Statut de validation</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={feuille.validee ? 'Validée' : 'En attente'}
                      size="small"
                      color={feuille.validee ? 'success' : 'warning'}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary">Détails/Symptômes</Typography>
                  <Typography variant="body1" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>{feuille.details}</Typography>
                </Grid>
                {feuille.medicamentsPrescrits && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="text.secondary">Médicaments prescrits</Typography>
                    <Typography variant="body1" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>{feuille.medicamentsPrescrits}</Typography>
                  </Grid>
                )}
                {feuille.recommandationSpecialiste && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="text.secondary">Spécialiste attribué</Typography>
                    {specialiste ? (
                      <Box sx={{ mt: 0.5, p: 1.5, border: '1px solid #D2691E', borderRadius: 1, bgcolor: '#FFF8F0' }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          Dr. {specialiste.prenom} {specialiste.nom}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                          {specialiste.specialite}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {specialiste.telephone} &bull; {specialiste.email}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body1" sx={{ mt: 0.5 }}>{feuille.recommandationSpecialiste}</Typography>
                    )}
                  </Grid>
                )}
              </Grid>
            </Box>
          </Grid>

          {consultation && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ border: '1px solid #D2691E', borderRadius: 1, p: 2, bgcolor: '#FFF8F0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#8B4513', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Consultation liée
                  </Typography>
                  <Button size="small" variant="text" onClick={() => navigate(`/consultations/${consultation.id}`)}>
                    Voir la consultation
                  </Button>
                </Box>
                <Divider sx={{ mb: 1.5, borderColor: '#D2691E' }} />
                <Typography variant="body2">
                  <strong>Date :</strong> {formatDate(consultation.date)} à {consultation.heure}
                </Typography>
                <Typography variant="body2">
                  <strong>Motif :</strong> {consultation.motif}
                </Typography>
              </Box>
            </Grid>
          )}

        </Grid>
      </Paper>
    </Box>
  );
};

export default FeuilleDetailPage;
