import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  Box, Typography, Paper, TextField, Button, Grid, MenuItem,
  Alert, CircularProgress,
} from '@mui/material';
import { apiService } from '../../services/api';
import type { Assure, Medecin, PrescriptionSpecialiste } from '../../types';
import { todayStr } from '../../utils/dateHelpers';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

const validationSchema = Yup.object({
  assureId: Yup.string().required('Veuillez sélectionner un patient'),
  specialisteId: Yup.string().required('Veuillez sélectionner un spécialiste'),
  motif: Yup.string().required('Le motif est requis'),
  justificatif: Yup.string().required('Le justificatif est requis'),
});

const PrescriptionSpecialistePage = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [assures, setAssures] = useState<Assure[]>([]);
  const [specialistes, setSpecialistes] = useState<Medecin[]>([]);
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aData, mData] = await Promise.all([
          apiService.get<Assure[]>('/assures'),
          apiService.get<Medecin[]>('/medecins'),
        ]);
        setAssures(aData);
        setSpecialistes(mData.filter((m) => m.specialite === 'specialiste'));
      } catch (err) {
        console.error('Erreur', err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSubmit = async (values: typeof initialValues) => {
    setSubmitError('');
    setSuccess(false);
    try {
      const existing = await apiService.get<PrescriptionSpecialiste[]>('/prescriptionsSpecialistes');
      const maxId = Math.max(...existing.map((p) => parseInt(p.id)), 0);
      const newPresc: PrescriptionSpecialiste = {
        id: String(maxId + 1),
        assureId: values.assureId,
        medecinIdGeneraliste: user?.profilId || '',
        specialisteId: values.specialisteId,
        motif: values.motif,
        justificatif: values.justificatif,
        date: values.date,
      };
      await apiService.post('/prescriptionsSpecialistes', newPresc);
      setSuccess(true);
    } catch (err) {
      setSubmitError('Erreur lors de l\'enregistrement.');
    }
  };

  const initialValues = {
    assureId: '',
    specialisteId: '',
    motif: '',
    justificatif: '',
    date: todayStr(),
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B4513', mb: 3 }}>
        Prescription consultation spécialiste
      </Typography>

      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(false)}>
            Prescription spécialiste enregistrée avec succès.
          </Alert>
        )}

        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    select
                    name="assureId"
                    label="Patient"
                    value={values.assureId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.assureId && !!errors.assureId}
                    helperText={touched.assureId && errors.assureId}
                    required
                  >
                    {assures.map((a) => (
                      <MenuItem key={a.id} value={a.id}>
                        {a.nom} {a.prenom}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    select
                    name="specialisteId"
                    label="Spécialiste"
                    value={values.specialisteId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.specialisteId && !!errors.specialisteId}
                    helperText={touched.specialisteId && errors.specialisteId}
                    required
                  >
                    {specialistes.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        Dr. {s.prenom} {s.nom}
                      </MenuItem>
                    ))}
                  </TextField>
                  {specialistes.length === 0 && (
                    <Typography variant="caption" color="error">
                      Aucun spécialiste disponible. Veuillez d'abord enregistrer des spécialistes.
                    </Typography>
                  )}
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    name="motif"
                    label="Motif de la recommandation"
                    value={values.motif}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.motif && !!errors.motif}
                    helperText={touched.motif && errors.motif}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    name="justificatif"
                    label="Justificatif"
                    value={values.justificatif}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.justificatif && !!errors.justificatif}
                    helperText={touched.justificatif && errors.justificatif}
                    multiline
                    rows={4}
                    placeholder="Ex: Examen clinique révèle... IRM recommandée..."
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    name="date"
                    label="Date"
                    type="date"
                    value={values.date}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
              <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: { xs: 'center', sm: 'flex-end' }, flexWrap: 'wrap' }}>
                <Button variant="outlined" color="primary" onClick={() => navigate('/consultations')}>
                  Annuler
                </Button>
                <Button type="submit" variant="contained" color="primary" disabled={specialistes.length === 0}>
                  Prescrire consultation spécialiste
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default PrescriptionSpecialistePage;
