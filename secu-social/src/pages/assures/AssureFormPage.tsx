import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  Box, Typography, Paper, TextField, Button, Grid, MenuItem,
  Alert, CircularProgress,
} from '@mui/material';
import { apiService } from '../../services/api';
import { addAssure, updateAssure, setAssures } from '../../features/assures/assuresSlice';
import type { Assure } from '../../types';

const validationSchema = Yup.object({
  nom: Yup.string().required('Le nom est requis'),
  prenom: Yup.string().required('Le prénom est requis'),
  dateNaissance: Yup.string().required('La date de naissance est requise'),
  sexe: Yup.string().required('Le sexe est requis').oneOf(['M', 'F']),
  numSecu: Yup.string()
    .required('Le numéro de sécurité sociale est requis')
    .min(13, 'Doit contenir 13 chiffres')
    .max(13, 'Doit contenir 13 chiffres'),
  adresse: Yup.string().required('L\'adresse est requise'),
  telephone: Yup.string()
    .required('Le téléphone est requis')
    .matches(/^\+237[6-9]\d{8}$/, 'Format: +237XXXXXXXXX (9 chiffres après +237)'),
  email: Yup.string().email('Email invalide').required('L\'email est requis'),
});

const AssureFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEditing = !!id;
  const [initialValues, setInitialValues] = useState<Assure>({
    id: '',
    nom: '',
    prenom: '',
    dateNaissance: '',
    sexe: 'M',
    numSecu: '',
    adresse: '',
    telephone: '+237',
    email: '',
  });
  const [loading, setLoading] = useState(isEditing);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const assuresData = await apiService.get<Assure[]>('/assures');
        dispatch(setAssures(assuresData));
        if (id) {
          const assure = assuresData.find((a) => a.id === id);
          if (assure) {
            setInitialValues(assure);
          }
        }
      } catch (err) {
        console.error('Erreur chargement', err);
      }
      setLoading(false);
    };
    fetchData();
  }, [id, dispatch]);

  const handleSubmit = async (values: Assure) => {
    setSubmitError('');
    try {
      if (isEditing) {
        await apiService.put('/assures', id!, values);
        dispatch(updateAssure(values));
      } else {
        const { id: _, ...body } = values;
        const created = await apiService.post<Assure>('/assures', body);
        dispatch(addAssure(created));
      }
      navigate('/assures');
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
        {isEditing ? 'Modifier un assuré' : 'Inscrire un nouvel assuré'}
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
                    name="dateNaissance"
                    label="Date de naissance"
                    type="date"
                    value={values.dateNaissance}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.dateNaissance && !!errors.dateNaissance}
                    helperText={touched.dateNaissance && errors.dateNaissance}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    name="sexe"
                    label="Sexe"
                    select
                    value={values.sexe}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.sexe && !!errors.sexe}
                    helperText={touched.sexe && errors.sexe}
                    required
                  >
                    <MenuItem value="M">Masculin</MenuItem>
                    <MenuItem value="F">Féminin</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    name="numSecu"
                    label="Numéro de sécurité sociale"
                    value={values.numSecu}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.numSecu && !!errors.numSecu}
                    helperText={touched.numSecu && errors.numSecu}
                    inputProps={{ maxLength: 13 }}
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
              </Grid>
              <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: { xs: 'center', sm: 'flex-end' }, flexWrap: 'wrap' }}>
                <Button variant="outlined" color="primary" onClick={() => navigate('/assures')}>
                  Annuler
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  {isEditing ? 'Enregistrer les modifications' : 'Inscrire l\'assuré'}
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default AssureFormPage;
