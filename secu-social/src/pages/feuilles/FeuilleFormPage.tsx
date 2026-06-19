import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  Box, Typography, Paper, TextField, Button, Grid, MenuItem,
  Alert, CircularProgress,
} from '@mui/material';
import { apiService } from '../../services/api';
import { addFeuille, setFeuilles } from '../../features/feuillesMaladie/feuillesSlice';
import { setAssures } from '../../features/assures/assuresSlice';
import { setConsultations } from '../../features/consultations/consultationsSlice';
import type { FeuilleMaladie, Assure, Consultation } from '../../types';
import { todayStr } from '../../utils/dateHelpers';
import type { RootState } from '../../store';

const validationSchema = Yup.object({
  assureId: Yup.string().required('Veuillez sélectionner un patient'),
  consultationId: Yup.string().required('Veuillez sélectionner une consultation'),
  details: Yup.string().required('Les détails sont requis'),
});

const FeuilleFormPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const assures = useSelector((state: RootState) => state.assures.assures);
  const consultations = useSelector((state: RootState) => state.consultations.consultations);
  const user = useSelector((state: RootState) => state.auth.user);
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(true);

  const initialValues = {
    assureId: '',
    consultationId: '',
    medecinId: user?.profilId || '',
    date: todayStr(),
    details: '',
    medicamentsPrescrits: '',
    recommandationSpecialiste: '',
    validee: true,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aData, cData] = await Promise.all([
          apiService.get<Assure[]>('/assures'),
          apiService.get<Consultation[]>('/consultations'),
        ]);
        dispatch(setAssures(aData));
        dispatch(setConsultations(cData));
      } catch (err) {
        console.error('Erreur chargement', err);
      }
      setLoading(false);
    };
    fetchData();
  }, [dispatch]);

  const filteredConsultations = consultations.filter(
    (c) => !c.assureId || (initialValues.assureId ? c.assureId === initialValues.assureId : true)
  );

  const handleSubmit = async (values: typeof initialValues) => {
    setSubmitError('');
    try {
      const existing = await apiService.get<FeuilleMaladie[]>('/feuillesMaladie');
      const maxId = Math.max(...existing.map((f) => parseInt(f.id)), 0);
      const newFeuille: FeuilleMaladie = {
        id: String(maxId + 1),
        consultationId: values.consultationId,
        assureId: values.assureId,
        medecinId: values.medecinId,
        date: values.date,
        details: values.details,
        medicamentsPrescrits: values.medicamentsPrescrits,
        recommandationSpecialiste: values.recommandationSpecialiste,
        validee: values.validee,
      };
      await apiService.post('/feuillesMaladie', newFeuille);
      dispatch(addFeuille(newFeuille));
      navigate('/feuilles-maladie');
    } catch (err) {
      setSubmitError('Erreur lors de l\'enregistrement.');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B4513', mb: 3 }}>
        Nouvelle feuille de maladie
      </Typography>

      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    select
                    name="assureId"
                    label="Patient"
                    value={values.assureId}
                    onChange={(e) => {
                      setFieldValue('assureId', e.target.value);
                      setFieldValue('consultationId', '');
                    }}
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
                    name="consultationId"
                    label="Consultation liée"
                    value={values.consultationId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.consultationId && !!errors.consultationId}
                    helperText={touched.consultationId && errors.consultationId}
                    required
                  >
                    {consultations
                      .filter((c) => !values.assureId || c.assureId === values.assureId)
                      .map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.date} - {c.motif}
                        </MenuItem>
                      ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    name="date"
                    label="Date"
                    type="date"
                    value={values.date}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    name="details"
                    label="Détails de la feuille de maladie"
                    value={values.details}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.details && !!errors.details}
                    helperText={touched.details && errors.details}
                    multiline
                    rows={3}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    name="medicamentsPrescrits"
                    label="Médicaments prescrits"
                    value={values.medicamentsPrescrits}
                    onChange={handleChange}
                    multiline
                    rows={2}
                    placeholder="Ex: Paracétamol 500mg - 1 comprimé 3x/jour"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    name="recommandationSpecialiste"
                    label="Recommandation spécialiste"
                    value={values.recommandationSpecialiste}
                    onChange={handleChange}
                    multiline
                    rows={2}
                    placeholder="Si une consultation spécialiste est recommandée, précisez le motif"
                  />
                </Grid>
              </Grid>
              <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: { xs: 'center', sm: 'flex-end' }, flexWrap: 'wrap' }}>
                <Button variant="outlined" color="primary" onClick={() => navigate('/feuilles-maladie')}>
                  Annuler
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  Enregistrer la feuille de maladie
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default FeuilleFormPage;
