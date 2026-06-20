import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  Box, Typography, Paper, TextField, Button, Grid, MenuItem,
  FormControlLabel, Checkbox, Alert, CircularProgress,
} from '@mui/material';
import { apiService } from '../../services/api';
import { addMedecin, updateMedecin, setMedecins } from '../../features/medecins/medecinsSlice';
import type { Medecin } from '../../types';

const validationSchema = Yup.object({
  matricule: Yup.string().required('Le matricule est requis'),
  nom: Yup.string().required('Le nom est requis'),
  prenom: Yup.string().required('Le prénom est requis'),
  specialite: Yup.string()
    .required('La spécialité est requise')
    .oneOf(['generaliste', 'specialiste'], 'Un médecin ne peut être que généraliste ou spécialiste'),
  email: Yup.string().email('Email invalide').required('L\'email est requis'),
  telephone: Yup.string()
    .required('Le téléphone est requis')
    .matches(/^\+237[6-9]\d{8}$/, 'Format: +237XXXXXXXXX (9 chiffres après +237)'),
  adresse: Yup.string().required('L\'adresse est requise'),
});

const MedecinFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEditing = !!id;
  const [initialValues, setInitialValues] = useState<Medecin>({
    id: '',
    matricule: '',
    nom: '',
    prenom: '',
    specialite: 'generaliste',
    email: '',
    telephone: '+237',
    adresse: '',
    estAussiAssure: false,
  });
  const [loading, setLoading] = useState(isEditing);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiService.get<Medecin[]>('/medecins');
        dispatch(setMedecins(data));
        if (id) {
          const medecin = data.find((m) => m.id === id);
          if (medecin) setInitialValues(medecin);
        }
      } catch (err) {
        console.error('Erreur chargement', err);
      }
      setLoading(false);
    };
    fetchData();
  }, [id, dispatch]);

  const handleSubmit = async (values: Medecin) => {
    setSubmitError('');
    try {
      if (isEditing) {
        await apiService.put('/medecins', id!, values);
        dispatch(updateMedecin(values));
      } else {
        const { id: _, ...body } = values;
        const created = await apiService.post<Medecin>('/medecins', body);
        dispatch(addMedecin(created));
      }
      navigate('/medecins');
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
        {isEditing ? 'Modifier un médecin' : 'Enregistrer un nouveau médecin'}
      </Typography>

      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    name="matricule"
                    label="Matricule"
                    value={values.matricule}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.matricule && !!errors.matricule}
                    helperText={touched.matricule && errors.matricule}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    name="specialite"
                    label="Spécialité"
                    select
                    value={values.specialite}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.specialite && !!errors.specialite}
                    helperText={touched.specialite && errors.specialite}
                    required
                  >
                    <MenuItem value="generaliste">Généraliste</MenuItem>
                    <MenuItem value="specialiste">Spécialiste</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    name="nom"
                    label="Nom"
                    value={values.nom}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.nom && !!errors.nom}
                    helperText={touched.nom && errors.nom}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    name="prenom"
                    label="Prénom"
                    value={values.prenom}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.prenom && !!errors.prenom}
                    helperText={touched.prenom && errors.prenom}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    name="telephone"
                    label="Téléphone"
                    value={values.telephone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.telephone && !!errors.telephone}
                    helperText={touched.telephone && errors.telephone}
                    placeholder="+237XXXXXXXXX"
                    inputProps={{ maxLength: 16 }}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    name="email"
                    label="Email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && !!errors.email}
                    helperText={touched.email && errors.email}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    name="adresse"
                    label="Adresse"
                    value={values.adresse}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.adresse && !!errors.adresse}
                    helperText={touched.adresse && errors.adresse}
                    multiline
                    rows={2}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.estAussiAssure}
                        onChange={(e) => setFieldValue('estAussiAssure', e.target.checked)}
                      />
                    }
                    label="Ce médecin est également un assuré"
                  />
                </Grid>
              </Grid>
              <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: { xs: 'center', sm: 'flex-end' }, flexWrap: 'wrap' }}>
                <Button variant="outlined" color="primary" onClick={() => navigate('/medecins')}>
                  Annuler
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  {isEditing ? 'Enregistrer les modifications' : 'Enregistrer le médecin'}
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default MedecinFormPage;
