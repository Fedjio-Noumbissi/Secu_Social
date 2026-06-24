import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, TextField, Button, MenuItem,
  Alert, Card, CardContent, Chip,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { apiService } from '../services/api';
import { setAssures, updateAssure, addAssure } from '../features/assures/assuresSlice';
import { setMedecins, updateMedecin } from '../features/medecins/medecinsSlice';
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
  const [activeTab, setActiveTab] = useState<'assures' | 'medecins'>('assures');

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

  // Only généralistes can be treating doctors
  const generalistes = medecins.filter((m) => m.specialite === 'generaliste');
  // For a médecin-assuré, exclude other médecin-assurés from the treating doctor list
  const generalistesForMedecinAssure = generalistes.filter((m) => !m.estAussiAssure);

  // Build list of médecins who are also insured
  const buildMedecinAssures = (): Assure[] => {
    return medecins
      .filter((m) => m.estAussiAssure === true)
      .map((m): Assure => {
        // Only link via assureId — never by email (email can be shared with regular assurés)
        const linked = m.assureId
          ? assures.find((a) => String(a.id) === String(m.assureId))
          : undefined;

        if (linked) return linked;

        // Synthetic profile from medecin data
        return {
          id: `med_${m.id}`,
          nom: m.nom || '',
          prenom: m.prenom || '',
          dateNaissance: '',
          sexe: 'M',
          numSecu: m.matricule || '',
          adresse: m.adresse || '',
          telephone: m.telephone || '',
          email: m.email || '',
          medecinTraitantId: undefined,
        };
      });
  };

  const medecinAssures = buildMedecinAssures();

  // IDs of assurés already linked to a médecin via assureId (exclude from regular tab)
  const linkedAssureIds = new Set(
    medecins
      .filter((m) => m.estAussiAssure === true && m.assureId)
      .map((m) => String(m.assureId))
  );

  // Regular assurés = only exclude those explicitly linked as médecin assuré via assureId
  const pureAssures = assures.filter((a) => !linkedAssureIds.has(String(a.id)));

  const listToShow = activeTab === 'assures' ? pureAssures : medecinAssures;


  const filteredList = listToShow.filter((a) => {
    const q = searchQuery.toLowerCase();
    const nom = (a.nom || '').toLowerCase();
    const prenom = (a.prenom || '').toLowerCase();
    const numSecu = a.numSecu || '';
    return nom.includes(q) || prenom.includes(q) || numSecu.includes(q);
  });

  const isSynthetic = (id: string | number) => String(id).startsWith('med_');

  // For synthetic médecin assurés: create a real assure record before assigning MT
  const resolveRealAssure = async (a: Assure): Promise<Assure> => {
    if (!isSynthetic(a.id)) return a;

    const medecinId = String(a.id).replace('med_', '');
    const medecin = medecins.find((m) => String(m.id) === medecinId);
    if (!medecin) throw new Error('Médecin introuvable');

    // Fetch latest assures to compute next id
    const existingAssures = await apiService.get<Assure[]>('/assures');

    // Check again if already exists (race condition guard)
    const alreadyLinked = existingAssures.find(
      (x) => (medecin.email && x.email === medecin.email) ||
              (medecin.assureId && String(x.id) === String(medecin.assureId))
    );
    if (alreadyLinked) return alreadyLinked;

    const maxId = Math.max(0, ...existingAssures.map((x) => parseInt(x.id) || 0));
    const newAssure: Assure = {
      id: String(maxId + 1),
      nom: medecin.nom || '',
      prenom: medecin.prenom || '',
      dateNaissance: medecin.dateNaissance || '',
      sexe: (medecin.sexe as 'M' | 'F') || 'M',
      numSecu: medecin.matricule || '',
      adresse: medecin.adresse || '',
      telephone: medecin.telephone || '',
      email: medecin.email || '',
      medecinTraitantId: undefined,
    };

    await apiService.post('/assures', newAssure);
    dispatch(addAssure(newAssure));

    // Link assureId back to médecin and update Redux
    try {
      await apiService.patch<Medecin>('/medecins', medecin.id, { assureId: newAssure.id });
      dispatch(updateMedecin({ ...medecin, assureId: newAssure.id }));
    } catch {
      // Non-blocking: link is best-effort
    }

    return newAssure;
  };

  const handleAssign = async () => {
    if (!selectedAssure || !selectedMedecinId) {
      setErrorMessage('Veuillez sélectionner un assuré et un médecin.');
      return;
    }
    try {
      const real = await resolveRealAssure(selectedAssure);
      // Use PATCH — the backend explicitly handles medecinTraitantId in PATCH
      const saved = await apiService.patch<Assure>(
        '/assures', String(real.id),
        { medecinTraitantId: String(selectedMedecinId) }
      );
      dispatch(updateAssure(saved));
      setSelectedAssure(saved);
      setSuccessMessage(`Médecin traitant attribué avec succès à ${saved.prenom} ${saved.nom}.`);
      setErrorMessage('');
    } catch (err) {
      console.error('Erreur attribution MT', err);
      setErrorMessage("Erreur lors de l'attribution. Vérifiez la console.");
    }
  };

  const handleRemove = async () => {
    if (!selectedAssure) return;
    try {
      const real = await resolveRealAssure(selectedAssure);
      // Send null explicitly to clear the medecinTraitantId
      const saved = await apiService.patch<Assure>(
        '/assures', String(real.id),
        { medecinTraitantId: null }
      );
      dispatch(updateAssure(saved));
      setSelectedAssure(saved);
      setSuccessMessage('Médecin traitant retiré avec succès.');
      setErrorMessage('');
    } catch (err) {
      console.error('Erreur retrait MT', err);
      setErrorMessage('Erreur lors du retrait.');
    }
  };

  const getMedecinName = (id?: string) => {
    if (!id) return '';
    const m = medecins.find((med) => String(med.id) === String(id));
    return m ? `Dr. ${m.prenom} ${m.nom}` : id;
  };

  const getSecu = (numSecu?: string) =>
    numSecu && numSecu.length >= 4 ? `**** *** ${numSecu.slice(-4)}` : numSecu || '—';

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B4513', mb: 3, fontSize: { xs: '1.4rem', sm: '1.75rem', md: '2rem' } }}>
        Attribution du médecin traitant
      </Typography>

      {/* Tab switcher */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        <Button
          variant={activeTab === 'assures' ? 'contained' : 'outlined'}
          color="primary"
          size="small"
          startIcon={<PersonIcon />}
          onClick={() => { setActiveTab('assures'); setSelectedAssure(null); setSearchQuery(''); }}
        >
          Assurés ({pureAssures.length})
        </Button>
        <Button
          variant={activeTab === 'medecins' ? 'contained' : 'outlined'}
          color="secondary"
          size="small"
          startIcon={<LocalHospitalIcon />}
          onClick={() => { setActiveTab('medecins'); setSelectedAssure(null); setSearchQuery(''); }}
        >
          Médecins assurés ({medecinAssures.length})
        </Button>
      </Box>

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
        {/* ── Left panel: list ── */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#8B4513' }}>
              1.{' '}
              {activeTab === 'assures'
                ? 'Rechercher un assuré'
                : 'Rechercher un médecin assuré'}
            </Typography>
            <TextField
              fullWidth
              label="Recherche par nom ou n° sécu"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{ mb: 2 }}
            />
            <Box sx={{ maxHeight: { xs: 250, sm: 350 }, overflow: 'auto' }}>
              {filteredList.map((a) => (
                <Card
                  key={a.id}
                  sx={{
                    mb: 1,
                    cursor: 'pointer',
                    border:
                      selectedAssure?.id === a.id
                        ? '2px solid #8B4513'
                        : '1px solid #E8E0D8',
                    bgcolor: selectedAssure?.id === a.id ? '#FFF8F0' : 'white',
                    transition: 'all 0.15s',
                  }}
                  onClick={() => { setSelectedAssure(a); setSelectedMedecinId(''); }}
                >
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {a.nom} {a.prenom}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {getSecu(a.numSecu)}
                        </Typography>
                      </Box>
                      <Chip
                        label={a.medecinTraitantId ? 'MT assigné' : 'Pas de MT'}
                        size="small"
                        color={a.medecinTraitantId ? 'success' : 'error'}
                        variant={a.medecinTraitantId ? 'outlined' : 'filled'}
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))}
              {filteredList.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  {activeTab === 'assures' ? 'Aucun assuré trouvé.' : 'Aucun médecin assuré trouvé.'}
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* ── Right panel: assignment ── */}
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
                      {isSynthetic(selectedAssure.id) ? 'Médecin assuré sélectionné' : 'Assuré sélectionné'}
                    </Typography>
                    <Typography variant="body1">
                      {selectedAssure.prenom} {selectedAssure.nom}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getSecu(selectedAssure.numSecu)}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {selectedAssure.medecinTraitantId ? (
                        <Chip
                          label={`MT actuel : ${getMedecinName(selectedAssure.medecinTraitantId)}`}
                          color="info"
                          size="small"
                        />
                      ) : (
                        <Chip label="Aucun médecin traitant" color="error" size="small" />
                      )}
                    </Box>
                  </CardContent>
                </Card>

                {(() => {
                    const isMedecinAssure = isSynthetic(selectedAssure.id) ||
                      medecins.some(m => m.assureId && String(m.assureId) === String(selectedAssure.id) && m.estAussiAssure);
                    const availableGeneralistes = isMedecinAssure ? generalistesForMedecinAssure : generalistes;
                    return availableGeneralistes.length === 0 ? (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        Aucun médecin généraliste disponible. Veuillez d'abord enregistrer des généralistes.
                      </Alert>
                    ) : (
                      <TextField
                        fullWidth
                        select
                        label="Choisir un médecin généraliste"
                        value={selectedMedecinId}
                        onChange={(e) => setSelectedMedecinId(e.target.value)}
                        size="small"
                        sx={{ mb: 2 }}
                      >
                        {availableGeneralistes.map((med) => (
                          <MenuItem key={med.id} value={med.id}>
                            Dr. {med.prenom} {med.nom} — {med.matricule}
                          </MenuItem>
                        ))}
                      </TextField>
                    );
                  })()}

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAssign}
                    disabled={!selectedMedecinId}
                  >
                    {selectedAssure.medecinTraitantId ? 'Changer le MT' : 'Attribuer le MT'}
                  </Button>
                  {selectedAssure.medecinTraitantId && (
                    <Button variant="outlined" color="error" onClick={handleRemove}>
                      Retirer le MT
                    </Button>
                  )}
                </Box>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
                Sélectionnez d'abord une personne dans la liste de gauche.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AttributionPage;
