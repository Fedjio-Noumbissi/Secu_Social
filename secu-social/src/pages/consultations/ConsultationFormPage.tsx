import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  Box, Typography, Paper, TextField, Button, Grid, MenuItem,
  Alert, CircularProgress,
} from '@mui/material';
import { apiService } from '../../services/api';
import { addConsultation, updateConsultation } from '../../features/consultations/consultationsSlice';
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
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const dispatch = useDispatch();
  const assures = useSelector((state: RootState) => state.assures.assures);
  const user = useSelector((state: RootState) => state.auth.user);
  const [submitError, setSubmitError] = useState('');
  const [assuresLoading, setAssuresLoading] = useState(true);
  const [medicamentOptions, setMedicamentOptions] = useState<string[]>([]);
  const [formValues, setFormValues] = useState<typeof initialValues | null>(null);

  const initialValues = {
    id: '',
    assureId: '',
    medecinId: user?.profilId || '',
    date: todayStr(),
    heure: new Date().toTimeString().slice(0, 5),
    motif: '',
    observations: '',
    medicament: '',
    posologie: '',
    duree: '',
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

        if (isEdit && id) {
          const allConsults = await apiService.get<Consultation[]>('/consultations');
          const existing = allConsults.find(c => String(c.id) === id);
          if (existing) {
            setFormValues({
              id: existing.id,
              assureId: existing.assureId,
              medecinId: existing.medecinId,
              date: existing.date,
              heure: existing.heure,
              motif: existing.motif,
              observations: existing.observations,
              medicament: '',
              posologie: '',
              duree: '',
              prescriptionSpecialiste: '',
            });
          }
        }
      } catch (err) {
        console.error('Erreur chargement assurés', err);
      }
      setAssuresLoading(false);
    };
    fetchData();
  }, [dispatch, id, isEdit]);

  const handleSubmit = async (values: typeof initialValues) => {
    setSubmitError('');
    try {
      if (isEdit && id) {
        // Update existing consultation
        const updated: Partial<Consultation> = {
          assureId: values.assureId,
          medecinId: values.medecinId,
          date: values.date,
          heure: values.heure,
          motif: values.motif,
          observations: values.observations,
        };
        await apiService.patch('/consultations', id, updated);
        dispatch(updateConsultation({ id, ...updated } as Consultation));
        navigate('/consultations');
        return;
      }

      const existingConsults = await apiService.get<Consultation[]>('/consultations');
      const maxId = Math.max(...existingConsults.map((c) => parseInt(c.id)), 0);

      let prescIds: string[] = [];
      if (values.medicament) {
        const existingPrescs = await apiService.get<PrescriptionMedicament[]>('/prescriptionsMedicaments');
        const maxPrescId = Math.max(...existingPrescs.map((p) => parseInt(p.id)), 0);
        const newPrescId = String(maxPrescId + 1);
        const newPresc: PrescriptionMedicament = {
          id: newPrescId,
          assureId: values.assureId,
          medecinId: values.medecinId,
          medicament: values.medicament,
          posologie: values.posologie || 'Selon prescription',
          duree: values.duree || 'Selon prescription',
          date: values.date,
        };
        await apiService.post('/prescriptionsMedicaments', newPresc);
        prescIds.push(newPrescId);
      }

      const newConsult: Consultation = {
        id: String(maxId + 1),
        assureId: values.assureId,
        medecinId: values.medecinId,
        date: values.date,
        heure: values.heure,
        motif: values.motif,
        observations: values.observations,
        prescriptionMedicamentsIds: prescIds,
        prescriptionSpecialisteId: '',
      };

      await apiService.post('/consultations', newConsult);
      dispatch(addConsultation(newConsult));
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
        {isEdit ? 'Modifier la consultation' : 'Nouvelle consultation'}
      </Typography>

      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

        <Formik
          initialValues={formValues || initialValues}
          enableReinitialize
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
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
                    {assures
                      .filter(a => a.medecinTraitantId === user?.profilId)
                      .map((a) => (
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
                    slotProps={{ inputLabel: { shrink: true } }}
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
                    slotProps={{ inputLabel: { shrink: true } }}
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
                    name="medicament"
                    label="Médicament (optionnel)"
                    value={values.medicament}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ex: Paracétamol 500mg"
                    slotProps={{ htmlInput: { list: 'medicaments-list' } }}
                  />
                  <datalist id="medicaments-list">
                    {medicamentOptions.map((opt) => (
                      <option key={opt} value={opt} />
                    ))}
                  </datalist>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    name="posologie"
                    label="Posologie"
                    value={values.posologie}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ex: 1 comprimé 3 fois par jour"
                    disabled={!values.medicament}
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
                    placeholder="Ex: 5 jours"
                    disabled={!values.medicament}
                  />
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
