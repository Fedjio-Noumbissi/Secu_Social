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
import { addFeuille, updateFeuille } from '../../features/feuillesMaladie/feuillesSlice';
import { setAssures } from '../../features/assures/assuresSlice';
import { setConsultations } from '../../features/consultations/consultationsSlice';
import type { FeuilleMaladie, Assure, Consultation, PrescriptionMedicament, Medecin, PrescriptionSpecialiste } from '../../types';
import { todayStr } from '../../utils/dateHelpers';
import type { RootState } from '../../store';

const validationSchema = Yup.object({
  assureId: Yup.string().required('Veuillez sélectionner un patient'),
  consultationId: Yup.string().required('Veuillez sélectionner une consultation'),
  details: Yup.string().required('Les détails sont requis'),
});

const FeuilleFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const dispatch = useDispatch();

  const consultations = useSelector((state: RootState) => state.consultations.consultations);
  const user = useSelector((state: RootState) => state.auth.user);
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(true);
  const [medicamentOptions, setMedicamentOptions] = useState<string[]>([]);
  const [specialistes, setSpecialistes] = useState<Medecin[]>([]);
  const [myPatients, setMyPatients] = useState<Assure[]>([]);
  const [formValues, setFormValues] = useState<typeof initialValues | null>(null);

  const initialValues = {
    assureId: '',
    consultationId: '',
    medecinId: user?.profilId || '',
    date: todayStr(),
    details: '',
    medicamentsPrescrits: '',
    recommandationSpecialiste: '',
    motifSpecialiste: '',
    justificatifSpecialiste: '',
    validee: true,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aData, cData, pData, mData, pSpecData] = await Promise.all([
          apiService.get<Assure[]>('/assures'),
          apiService.get<Consultation[]>('/consultations'),
          apiService.get<PrescriptionMedicament[]>('/prescriptionsMedicaments'),
          apiService.get<Medecin[]>('/medecins'),
          apiService.get<PrescriptionSpecialiste[]>('/prescriptionsSpecialistes'),
        ]);
        dispatch(setAssures(aData));
        dispatch(setConsultations(cData));
        setMedicamentOptions([...new Set(pData.map((p) => p.medicament).filter(Boolean))].sort());
        setSpecialistes(mData.filter((m) => m.specialite === 'specialiste'));

        const assignedIds = new Set(
          pSpecData
            .filter(p => String(p.specialisteId) === String(user?.profilId))
            .map(p => String(p.assureId))
        );
        const patients = aData.filter(
          a => String(a.medecinTraitantId) === String(user?.profilId) || assignedIds.has(String(a.id))
        );
        setMyPatients(patients);

        if (isEdit && id) {
          const existingFeuilles = await apiService.get<FeuilleMaladie[]>('/feuillesMaladie');
          const existing = existingFeuilles.find(f => String(f.id) === id);
          if (existing) {
            setFormValues({
              assureId: existing.assureId,
              consultationId: existing.consultationId,
              medecinId: existing.medecinId,
              date: existing.date,
              details: existing.details,
              medicamentsPrescrits: existing.medicamentsPrescrits,
              recommandationSpecialiste: '',
              motifSpecialiste: '',
              justificatifSpecialiste: '',
              validee: existing.validee,
            });
          }
        }
      } catch (err) {
        console.error('Erreur chargement', err);
      }
      setLoading(false);
    };
    fetchData();
  }, [dispatch, id, isEdit]);


  const handleSubmit = async (values: typeof initialValues) => {
    setSubmitError('');
    try {
      if (isEdit && id) {
        const updated: Partial<FeuilleMaladie> = {
          assureId: values.assureId,
          consultationId: values.consultationId,
          date: values.date,
          details: values.details,
          medicamentsPrescrits: values.medicamentsPrescrits,
          recommandationSpecialiste: values.recommandationSpecialiste,
          validee: values.validee,
        };
        await apiService.patch('/feuillesMaladie', id, updated);
        dispatch(updateFeuille({ id, ...updated } as FeuilleMaladie));
        navigate('/feuilles-maladie');
        return;
      }
      const existing = await apiService.get<FeuilleMaladie[]>('/feuillesMaladie');
      const maxId = Math.max(...existing.map((f) => parseInt(f.id)), 0);
      let recomm = values.recommandationSpecialiste;
      if (values.recommandationSpecialiste) {
        const existingPresc = await apiService.get<PrescriptionSpecialiste[]>('/prescriptionsSpecialistes');
        const maxPrescId = Math.max(...existingPresc.map((p) => parseInt(p.id)), 0);
        const newPrescId = String(maxPrescId + 1);
        const newPresc: PrescriptionSpecialiste = {
          id: newPrescId,
          assureId: values.assureId,
          medecinIdGeneraliste: values.medecinId,
          specialisteId: values.recommandationSpecialiste,
          motif: values.motifSpecialiste || 'Non précisé',
          justificatif: values.justificatifSpecialiste || 'Non précisé',
          date: values.date,
        };
        await apiService.post('/prescriptionsSpecialistes', newPresc);
        recomm = newPrescId;
      }

      const newFeuille: FeuilleMaladie = {
        id: String(maxId + 1),
        consultationId: values.consultationId,
        assureId: values.assureId,
        medecinId: values.medecinId,
        date: values.date,
        details: values.details,
        medicamentsPrescrits: values.medicamentsPrescrits,
        recommandationSpecialiste: recomm,
        validee: values.validee,
      };
      await apiService.post('/feuillesMaladie', newFeuille);
      dispatch(addFeuille(newFeuille));
      navigate('/feuilles-maladie');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || (err as Error)?.message
        || 'Erreur lors de l\'enregistrement. Vérifiez les champs et réessayez.';
      setSubmitError(msg);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B4513', mb: 3 }}>
        {isEdit ? 'Modifier la feuille de maladie' : 'Nouvelle feuille de maladie'}
      </Typography>

      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

        <Formik
          initialValues={formValues || initialValues}
          enableReinitialize
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
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
                    {myPatients.map((a) => (
                      <MenuItem key={a.id} value={String(a.id)}>
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
                    {[...consultations]
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .filter((c) => !values.assureId || String(c.assureId) === String(values.assureId))
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
                    slotProps={{ inputLabel: { shrink: true } }}
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
                    placeholder="Ex: Paracétamol 500mg - 1 comprimé 3x/jour"
                    slotProps={{ htmlInput: { list: 'medicaments-list' } }}
                  />
                  <datalist id="medicaments-list">
                    {medicamentOptions.map((opt) => (
                      <option key={opt} value={opt} />
                    ))}
                  </datalist>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    select
                    name="recommandationSpecialiste"
                    label="Recommandation spécialiste (optionnel)"
                    value={values.recommandationSpecialiste}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.recommandationSpecialiste && !!errors.recommandationSpecialiste}
                    helperText={touched.recommandationSpecialiste && errors.recommandationSpecialiste}
                  >
                    <MenuItem value="">
                      <em>Aucun</em>
                    </MenuItem>
                    {specialistes.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        Dr. {s.prenom} {s.nom}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    name="motifSpecialiste"
                    label="Motif"
                    value={values.motifSpecialiste}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ex: Douleurs persistantes"
                    disabled={!values.recommandationSpecialiste}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    name="justificatifSpecialiste"
                    label="Justificatif"
                    value={values.justificatifSpecialiste}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ex: Examen clinique"
                    disabled={!values.recommandationSpecialiste}
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
