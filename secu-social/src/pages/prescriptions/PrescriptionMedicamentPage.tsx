import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  Box, Typography, Paper, TextField, Button, Grid, MenuItem,
  Alert, CircularProgress,
} from '@mui/material';
import { apiService } from '../../services/api';
import type { Assure, PrescriptionMedicament } from '../../types';
import { todayStr } from '../../utils/dateHelpers';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

const validationSchema = Yup.object({
  assureId: Yup.string().required('Veuillez sélectionner un patient'),
  medicament: Yup.string().required('Le médicament est requis'),
  posologie: Yup.string().required('La posologie est requise'),
  duree: Yup.string().required('La durée est requise'),
});

const PrescriptionMedicamentPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [assures, setAssures] = useState<Assure[]>([]);
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchAssures = async () => {
      try {
        const data = await apiService.get<Assure[]>('/assures');
        setAssures(data);
      } catch (err) {
        console.error('Erreur', err);
      }
      setLoading(false);
    };
    fetchAssures();
  }, []);

  const handleSubmit = async (values: typeof initialValues) => {
    setSubmitError('');
    setSuccess(false);
    try {
      const existing = await apiService.get<PrescriptionMedicament[]>('/prescriptionsMedicaments');
      const maxId = Math.max(...existing.map((p) => parseInt(p.id)), 0);
      const newPresc: PrescriptionMedicament = {
        id: String(maxId + 1),
        assureId: values.assureId,
        medecinId: user?.profilId || '',
        medicament: values.medicament,
        posologie: values.posologie,
        duree: values.duree,
        date: values.date,
      };
      await apiService.post('/prescriptionsMedicaments', newPresc);
      setSuccess(true);
    } catch (err) {
      setSubmitError('Erreur lors de l\'enregistrement.');
    }
  };

  const initialValues = {
    assureId: '',
    medicament: '',
    posologie: '',
    duree: '',
    date: todayStr(),
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B4513', mb: 3 }}>
        Prescription de médicaments
      </Typography>

      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(false)}>
            Prescription enregistrée avec succès.
          </Alert>
        )}

        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
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
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    name="medicament"
                    label="Médicament"
                    value={values.medicament}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.medicament && !!errors.medicament}
                    helperText={touched.medicament && errors.medicament}
                    placeholder="Ex: Paracétamol 500mg"
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    name="posologie"
                    label="Posologie"
                    value={values.posologie}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.posologie && !!errors.posologie}
                    helperText={touched.posologie && errors.posologie}
                    placeholder="Ex: 1 comprimé 3 fois par jour"
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    name="duree"
                    label="Durée"
                    value={values.duree}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.duree && !!errors.duree}
                    helperText={touched.duree && errors.duree}
                    placeholder="Ex: 5 jours"
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
                <Button type="submit" variant="contained" color="primary">
                  Prescrire
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default PrescriptionMedicamentPage;
