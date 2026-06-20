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
import { addConsultation, setConsultations } from '../../features/consultations/consultationsSlice';
import { setAssures } from '../../features/assures/assuresSlice';
import type { Consultation, Assure, PrescriptionMedicament } from '../../types';
import { todayStr } from '../../utils/dateHelpers';
import type { RootState } from '../../store';

const validationSchema = Yup.object({
  assureId: Yup.string().required('Veuillez sélectionner un patient'),
  motif: Yup.string().required('Le motif est requis'),
  observations: Yup.string().required('Les observations sont requises'),
});

const ConsultationFormPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const assures = useSelector((state: RootState) => state.assures.assures);
  const user = useSelector((state: RootState) => state.auth.user);
  const [submitError, setSubmitError] = useState('');
  const [assuresLoading, setAssuresLoading] = useState(true);
  const [medicamentOptions, setMedicamentOptions] = useState<string[]>([]);

  const initialValues = {
    id: '',
    assureId: '',
    medecinId: user?.profilId || '',
    date: todayStr(),
    heure: new Date().toTimeString().slice(0, 5),
    motif: '',
    observations: '',
    prescriptionMedicaments: '',
    prescriptionSpecialiste: '',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aData, pData] = await Promise.all([
          apiService.get<Assure[]>('/assures'),
          apiService.get<PrescriptionMedicament[]>('/prescriptionsMedicaments'),
        ]);
        dispatch(setAssures(aData));
        setMedicamentOptions([...new Set(pData.map((p) => p.medicament).filter(Boolean))].sort());
      } catch (err) {
        console.error('Erreur chargement assurés', err);
      }
      setAssuresLoading(false);
    };
    fetchData();
  }, [dispatch]);

  const handleSubmit = async (values: typeof initialValues) => {
    setSubmitError('');
    try {
      const existingConsults = await apiService.get<Consultation[]>('/consultations');
      const maxId = Math.max(...existingConsults.map((c) => parseInt(c.id)), 0);

      const newConsult: Consultation = {
        id: String(maxId + 1),
        assureId: values.assureId,
        medecinId: values.medecinId,
        date: values.date,
        heure: values.heure,
        motif: values.motif,
        observations: values.observations,
        prescriptionMedicamentsIds: [],
        prescriptionSpecialisteId: '',
      };

      await apiService.post('/consultations', newConsult);
      dispatch(addConsultation(newConsult));

      if (values.prescriptionMedicaments) {
        const existingPrescs = await apiService.get<PrescriptionMedicament[]>('/prescriptionsMedicaments');
        const maxPrescId = Math.max(...existingPrescs.map((p) => parseInt(p.id)), 0);
        const newPresc: PrescriptionMedicament = {
          id: String(maxPrescId + 1),
          assureId: values.assureId,
          medecinId: values.medecinId,
          medicament: values.prescriptionMedicaments,
          posologie: 'Selon prescription',
          duree: 'Selon prescription',
          date: values.date,
        };
        await apiService.post('/prescriptionsMedicaments', newPresc);
      }

      navigate('/consultations');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || (err as Error)?.message
        || 'Erreur lors de l\'enregistrement. Vérifiez les champs et réessayez.';
      setSubmitError(msg);
    }
  };

  if (assuresLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B4513', mb: 3 }}>
        Nouvelle consultation
      </Typography>

      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

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
                        {a.nom} {a.prenom} - **** *** {a.numSecu.slice(-4)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
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
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    name="heure"
                    label="Heure"
                    type="time"
                    value={values.heure}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    name="motif"
                    label="Motif de la consultation"
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
                    name="observations"
                    label="Observations"
                    value={values.observations}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.observations && !!errors.observations}
                    helperText={touched.observations && errors.observations}
                    multiline
                    rows={4}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" sx={{ color: '#8B4513', mb: 1, mt: 1 }}>
                    Prescriptions (optionnel)
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    name="prescriptionMedicaments"
                    label="Prescription de médicaments"
                    value={values.prescriptionMedicaments}
                    onChange={handleChange}
                    placeholder="Ex: Paracétamol 500mg - 1 comprimé 3x/jour pendant 5 jours"
                    inputProps={{ list: 'medicaments-list' }}
                  />
                  <datalist id="medicaments-list">
                    {medicamentOptions.map((opt) => (
                      <option key={opt} value={opt} />
                    ))}
                  </datalist>
                </Grid>
              </Grid>
              <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: { xs: 'center', sm: 'flex-end' }, flexWrap: 'wrap' }}>
                <Button variant="outlined" color="primary" onClick={() => navigate('/consultations')}>
                  Annuler
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  Enregistrer la consultation
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default ConsultationFormPage;
