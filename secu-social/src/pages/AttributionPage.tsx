import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, TextField, Button, MenuItem,
  Alert, Card, CardContent, Chip, Autocomplete,
} from '@mui/material';
import { apiService } from '../services/api';
import { setAssures, updateAssure } from '../features/assures/assuresSlice';
import { setMedecins } from '../features/medecins/medecinsSlice';
import type { Assure, Medecin } from '../types';
import type { RootState } from '../store';

const AttributionPage = () => {
  const dispatch = useDispatch();
  const assures = useSelector((state: RootState) => state.assures.assures);
  const medecins = useSelector((state: RootState) => state.medecins.medecins);
  const [selectedAssure, setSelectedAssure] = useState<Assure | null>(null);
  const [selectedMedecinId, setSelectedMedecinId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assuresData, medecinsData] = await Promise.all([
          apiService.get<Assure[]>('/assures'),
          apiService.get<Medecin[]>('/medecins'),
        ]);
        dispatch(setAssures(assuresData));
        dispatch(setMedecins(medecinsData));
      } catch (err) {
        console.error('Erreur chargement données', err);
      }
    };
    fetchData();
  }, [dispatch]);

  const generalistes = medecins.filter((m) => m.specialite === 'generaliste');

  const filteredAssures = assures.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.nom.toLowerCase().includes(q) ||
      a.prenom.toLowerCase().includes(q) ||
      a.numSecu.includes(q)
    );
  });

  const handleAssign = async () => {
    if (!selectedAssure || !selectedMedecinId) {
      setErrorMessage('Veuillez sélectionner un assuré et un médecin.');
      return;
    }

    try {
      const updatedAssure = { ...selectedAssure, medecinTraitantId: selectedMedecinId };
      await apiService.put('/assures', selectedAssure.id, updatedAssure);
      dispatch(updateAssure(updatedAssure));
      setSelectedAssure(updatedAssure);
      setSuccessMessage(
        `Médecin traitant attribué avec succès à ${updatedAssure.prenom} ${updatedAssure.nom}.`
      );
      setErrorMessage('');
    } catch (err) {
      setErrorMessage('Erreur lors de l\'attribution.');
    }
  };

  const handleRemove = async () => {
    if (!selectedAssure) return;
    try {
      const updatedAssure = { ...selectedAssure, medecinTraitantId: undefined };
      await apiService.put('/assures', selectedAssure.id, updatedAssure);
      dispatch(updateAssure(updatedAssure));
      setSelectedAssure(updatedAssure);
      setSuccessMessage('Médecin traitant retiré avec succès.');
      setErrorMessage('');
    } catch (err) {
      setErrorMessage('Erreur lors du retrait.');
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B4513', mb: 3 }}>
        Attribution du médecin traitant
      </Typography>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#8B4513' }}>
              1. Rechercher un assuré
            </Typography>
            <TextField
              fullWidth
              label="Recherche par nom ou n° sécu"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{ mb: 2 }}
            />
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {filteredAssures.map((assure) => (
                <Card
                  key={assure.id}
                  sx={{
                    mb: 1,
                    cursor: 'pointer',
                    border: selectedAssure?.id === assure.id ? '2px solid #8B4513' : '1px solid #E8E0D8',
                    bgcolor: selectedAssure?.id === assure.id ? '#FFF8F0' : 'white',
                  }}
                  onClick={() => setSelectedAssure(assure)}
                >
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {assure.nom} {assure.prenom}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          **** *** {assure.numSecu.slice(-4)}
                        </Typography>
                      </Box>
                      {!assure.medecinTraitantId ? (
                        <Chip label="Pas de MT" color="error" size="small" />
                      ) : (
                        <Chip label="MT assigné" color="success" size="small" variant="outlined" />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
              {filteredAssures.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  Aucun assuré trouvé.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#8B4513' }}>
              2. Sélectionner un généraliste
            </Typography>
            {selectedAssure ? (
              <>
                <Card sx={{ mb: 2, bgcolor: '#FAF7F4' }}>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Assuré sélectionné
                    </Typography>
                    <Typography variant="body1">
                      {selectedAssure.prenom} {selectedAssure.nom}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      **** *** {selectedAssure.numSecu.slice(-4)}
                    </Typography>
                    {selectedAssure.medecinTraitantId ? (
                      <Chip
                        label={`MT actuel: ${medecins.find(m => m.id === selectedAssure.medecinTraitantId)?.prenom || ''} ${medecins.find(m => m.id === selectedAssure.medecinTraitantId)?.nom || ''}`}
                        color="info"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    ) : (
                      <Chip label="Aucun médecin traitant" color="error" size="small" sx={{ mt: 1 }} />
                    )}
                  </CardContent>
                </Card>

                <TextField
                  fullWidth
                  select
                  label="Choisir un médecin généraliste"
                  value={selectedMedecinId}
                  onChange={(e) => setSelectedMedecinId(e.target.value)}
                  size="small"
                  sx={{ mb: 2 }}
                >
                  {generalistes.map((med) => (
                    <MenuItem key={med.id} value={med.id}>
                      Dr. {med.prenom} {med.nom} - {med.matricule}
                    </MenuItem>
                  ))}
                </TextField>

                {generalistes.length === 0 && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Aucun médecin généraliste disponible. Veuillez d'abord enregistrer des généralistes.
                  </Alert>
                )}

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAssign}
                    disabled={!selectedMedecinId || generalistes.length === 0}
                  >
                    {selectedAssure.medecinTraitantId ? 'Changer le MT' : 'Attribuer le MT'}
                  </Button>
                  {selectedAssure.medecinTraitantId && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleRemove}
                    >
                      Retirer le MT
                    </Button>
                  )}
                </Box>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                Veuillez d'abord sélectionner un assuré dans la liste de gauche.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AttributionPage;
