import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  Box, Typography, Paper, TextField, Button, Grid, MenuItem,
  FormControlLabel, Checkbox, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import { apiService } from '../../services/api';
import { addMedecin, updateMedecin, setMedecins } from '../../features/medecins/medecinsSlice';
import type { Medecin } from '../../types';

const validationSchema = Yup.object({
  matricule: Yup.string()
    .required('Le matricule est requis')
    .matches(/^MED-\d{3}$/, 'Le matricule doit être au format MED-XXX (ex: MED-001)'),
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
  sexe: Yup.string().oneOf(['M', 'F'], 'Veuillez choisir un sexe').required('Le sexe est requis'),
  dateNaissance: Yup.string().required('La date de naissance est requise'),
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
    sexe: 'M' as 'M' | 'F',
    dateNaissance: '',
  });
  const [loading, setLoading] = useState(isEditing);
  const [submitError, setSubmitError] = useState('');
  const [generatedPasswordDialog, setGeneratedPasswordDialog] = useState<{ email: string, password: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiService.get<Medecin[]>('/medecins');
        dispatch(setMedecins(data));
        if (id) {
          const medecin = data.find((m) => String(m.id) === String(id));
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
      // — Unicité du matricule —
      const allMedecins = await apiService.get<Medecin[]>('/medecins');
      const duplicate = allMedecins.find(
        (m) =>
          m.matricule === values.matricule &&
          String(m.id) !== String(id)   // ignore self when editing
      );
      if (duplicate) {
        setSubmitError(
          `Le matricule « ${values.matricule} » est déjà attribué au Dr. ${duplicate.prenom} ${duplicate.nom}.`
        );
        return;
      }

      if (isEditing) {
        await apiService.put('/medecins', id!, values);
        dispatch(updateMedecin(values));
        navigate('/medecins');
      } else {
        const { id: _, ...body } = values;
        const created = await apiService.post<Medecin>('/medecins', body);
        dispatch(addMedecin(created));

        const password = '00000';
        await apiService.post('/users', {
          email: created.email,
          password: password,
          role: 'medecin',
          profilId: String(created.id)
        });

        setGeneratedPasswordDialog({ email: created.email, password });
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || (err as Error)?.message
        || 'Erreur lors de l\'enregistrement. Vérifiez les champs et réessayez.';
      setSubmitError(msg);
    }
  };

  const handleCloseDialog = () => {
    setGeneratedPasswordDialog(null);
    navigate('/medecins');
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ maxWidth: { xs: '100%', sm: 720, md: 960 }, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B4513', mb: 3, fontSize: { xs: '1.4rem', sm: '1.75rem', md: '2rem' } }}>
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
                    slotProps={{ htmlInput: { maxLength: 16 } }}
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
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    select
                    name="sexe"
                    label="Sexe"
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
                    name="dateNaissance"
                    label="Date de naissance"
                    type="date"
                    value={values.dateNaissance}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.dateNaissance && !!errors.dateNaissance}
                    helperText={touched.dateNaissance && errors.dateNaissance}
                    slotProps={{ inputLabel: { shrink: true } }}
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
                <Button variant="outlined" color="primary" onClick={() => navigate('/medecins')} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                  Annuler
                </Button>
                <Button type="submit" variant="contained" color="primary" sx={{ width: { xs: '100%', sm: 'auto' } }}>
                  {isEditing ? 'Enregistrer les modifications' : 'Enregistrer le médecin'}
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>

      <Dialog open={!!generatedPasswordDialog} onClose={handleCloseDialog}>
        <DialogTitle>Compte médecin créé avec succès</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Un compte utilisateur a été généré pour ce médecin. Veuillez lui communiquer ces informations pour qu'il puisse se connecter :
            <br /><br />
            <strong>Email :</strong> {generatedPasswordDialog?.email}<br />
            <strong>Mot de passe :</strong> {generatedPasswordDialog?.password}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary" variant="contained">
            J'ai noté le mot de passe
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MedecinFormPage;
