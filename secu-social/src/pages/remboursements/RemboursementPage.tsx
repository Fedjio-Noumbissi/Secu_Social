import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, TextField, Button, MenuItem,
  Alert, Card, CardContent, Chip, Divider, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Menu, ListItemIcon, ListItemText
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import InfoIcon from '@mui/icons-material/Info';
import { apiService } from '../../services/api';
import { setAssures } from '../../features/assures/assuresSlice';
import { setFeuilles } from '../../features/feuillesMaladie/feuillesSlice';
import { addRemboursement, setRemboursements, updateRemboursement } from '../../features/remboursements/remboursementsSlice';
import { setMedecins } from '../../features/medecins/medecinsSlice';
import type { Assure, FeuilleMaladie, Remboursement, Medecin, Consultation } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateHelpers';
import PrintableReceipt from '../../components/print/PrintableReceipt';
import type { RootState } from '../../store';

const RemboursementPage = () => {
  const dispatch = useDispatch();
  const assures = useSelector((state: RootState) => state.assures.assures);
  const feuilles = useSelector((state: RootState) => state.feuillesMaladie.feuilles);
  const remboursements = useSelector((state: RootState) => state.remboursements.remboursements);
  const medecins = useSelector((state: RootState) => state.medecins.medecins);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssure, setSelectedAssure] = useState<Assure | null>(null);
  const [selectedFeuille, setSelectedFeuille] = useState<FeuilleMaladie | null>(null);
  const [modePaiement, setModePaiement] = useState<'virement' | 'especes'>('especes');
  const [rib, setRib] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [calculatedMontant, setCalculatedMontant] = useState(0);
  const [calculatedTaux, setCalculatedTaux] = useState(0);
  const [isCalculated, setIsCalculated] = useState(false);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [remboursementDetails, setRemboursementDetails] = useState<Remboursement | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuRemboursement, setMenuRemboursement] = useState<Remboursement | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, r: Remboursement) => {
    setAnchorEl(event.currentTarget);
    setMenuRemboursement(r);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuRemboursement(null);
  };

  const [printData, setPrintData] = useState<{
    remb: Remboursement;
    assure?: Assure;
    medecin?: Medecin;
  } | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aData, fData, rData, mData, cData] = await Promise.all([
          apiService.get<Assure[]>('/assures'),
          apiService.get<FeuilleMaladie[]>('/feuillesMaladie'),
          apiService.get<Remboursement[]>('/remboursements'),
          apiService.get<Medecin[]>('/medecins'),
          apiService.get<Consultation[]>('/consultations'),
        ]);
        dispatch(setAssures(aData));
        dispatch(setFeuilles(fData));
        dispatch(setRemboursements(rData));
        dispatch(setMedecins(mData));
        setConsultations(cData);
      } catch (err) {
        console.error('Erreur chargement', err);
      }
    };
    fetchData();
  }, [dispatch]);

  const filteredAssures = assures.filter((a) => {
    const q = searchQuery.toLowerCase();
    return a.nom.toLowerCase().includes(q) || a.prenom.toLowerCase().includes(q) || a.numSecu.includes(q);
  });

  const getAssureFeuilles = () => {
    if (!selectedAssure) return [];
    return feuilles.filter((f) => String(f.assureId) === String(selectedAssure.id) && f.validee);
  };

  const handleCalculate = (feuille: FeuilleMaladie) => {
    setSelectedFeuille(feuille);
    setIsCalculated(false);

    const consultationId = feuille.consultationId;
      const consultation = consultations.find((c) => String(c.id) === String(consultationId));
    if (consultation) {
      const medecin = medecins.find((m) => String(m.id) === String(feuille.medecinId));
      if (medecin) {
        const taux = medecin.specialite === 'generaliste' ? 100 : 80;
        const montantTotal = Math.floor(Math.random() * 15000) + 3000;
        const montantRembourse = Math.round((montantTotal * taux) / 100);
        setCalculatedTaux(taux);
        setCalculatedMontant(montantRembourse);
        setIsCalculated(true);
      }
    }
  };

  const alreadyRemboursed = (feuilleId: string) => {
    return remboursements.some((r) => String(r.feuilleMaladieId) === String(feuilleId));
  };

  const handleSave = async () => {
    if (!selectedFeuille || !selectedAssure) return;
    if (modePaiement === 'virement' && !rib) {
      setErrorMessage('Veuillez saisir le RIB pour le virement bancaire.');
      return;
    }

    try {
      const existing = await apiService.get<Remboursement[]>('/remboursements');
      const maxId = Math.max(...existing.map((r) => parseInt(r.id)), 0);
      const newRemb: Remboursement = {
        id: String(maxId + 1),
        feuilleMaladieId: selectedFeuille.id,
        assureId: selectedAssure.id,
        consultationId: selectedFeuille.consultationId,
        montantTotal: Math.round(calculatedMontant * 100 / calculatedTaux),
        taux: calculatedTaux,
        montantRembourse: calculatedMontant,
        modePaiement,
        rib: modePaiement === 'virement' ? rib : undefined,
        date: new Date().toISOString().split('T')[0],
        horodatage: new Date().toISOString(),
        imprime: false,
      };
      await apiService.post('/remboursements', newRemb);
      dispatch(addRemboursement(newRemb));
      setSuccessMessage(`Remboursement de ${formatCurrency(calculatedMontant)} enregistré avec succès.`);
      setSelectedFeuille(null);
      setIsCalculated(false);
    } catch (err) {
      setErrorMessage('Erreur lors de l\'enregistrement.');
    }
  };

  const handlePrint = async (remb: Remboursement) => {
    const assure = assures.find((a) => String(a.id) === String(remb.assureId));
    const feuille = feuilles.find((f) => String(f.id) === String(remb.feuilleMaladieId));
    const medecin = feuille ? medecins.find((m) => String(m.id) === String(feuille.medecinId)) : undefined;

    // Mark as printed immediately
    if (!remb.imprime) {
      try {
        await apiService.patch('/remboursements', remb.id, { imprime: true });
        dispatch(updateRemboursement({ ...remb, imprime: true }));
        // Use the updated object for printing
        setPrintData({ remb: { ...remb, imprime: true }, assure, medecin });
      } catch {
        // Even if patch fails, allow printing
        setPrintData({ remb, assure, medecin });
      }
    } else {
      setPrintData({ remb, assure, medecin });
    }
  };

  useEffect(() => {
    if (!printData) return;
    const timeout = setTimeout(() => setPrintData(null), 30000);
    const afterPrint = () => {
      setPrintData(null);
      clearTimeout(timeout);
    };
    window.addEventListener('afterprint', afterPrint);
    const mql = window.matchMedia('print');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!e.matches) setPrintData(null);
    };
    mql.addEventListener('change', handleChange);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('afterprint', afterPrint);
      mql.removeEventListener('change', handleChange);
    };
  }, [printData]);

  return (
    <>
      <Box className={printData ? 'no-print' : ''}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B4513', mb: 3, fontSize: { xs: '1.4rem', sm: '1.75rem', md: '2rem' } }}>
          Remboursements
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
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#8B4513' }}>
                1. Rechercher un assuré
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Nom ou n° sécu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {filteredAssures.map((a) => (
                  <Card
                    key={a.id}
                    sx={{
                      mb: 1, cursor: 'pointer',
                      border: selectedAssure?.id === a.id ? '2px solid #8B4513' : '1px solid #E8E0D8',
                      bgcolor: selectedAssure?.id === a.id ? '#FFF8F0' : 'white',
                    }}
                    onClick={() => {
                      setSelectedAssure(a);
                      setSelectedFeuille(null);
                      setIsCalculated(false);
                      // Pre-fill RIB from assure profile
                      setRib(a.rib || '');
                    }}
                  >
                    <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {a.nom} {a.prenom}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        **** *** {a.numSecu.slice(-4)}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#8B4513' }}>
                2. Sélectionner une feuille
              </Typography>
              {selectedAssure ? (
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {getAssureFeuilles().map((f) => {
                    const rembourse = alreadyRemboursed(f.id);
                    return (
                      <Card
                        key={f.id}
                        sx={{
                          mb: 1, cursor: rembourse ? 'default' : 'pointer',
                          border: selectedFeuille?.id === f.id ? '2px solid #8B4513' : '1px solid #E8E0D8',
                          opacity: rembourse ? 0.6 : 1,
                        }}
                        onClick={() => !rembourse && handleCalculate(f)}
                      >
                        <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {formatDate(f.date)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {f.details.substring(0, 60)}...
                          </Typography>
                          {rembourse && (
                            <Chip label="Remboursé" size="small" color="success" sx={{ mt: 0.5 }} />
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                  {getAssureFeuilles().length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                      Aucune feuille validée.
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  Sélectionnez d'abord un assuré.
                </Typography>
              )}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#8B4513' }}>
                3. Calcul et paiement
              </Typography>
              {isCalculated ? (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Consultation par {calculatedTaux === 100 ? 'un généraliste' : 'un spécialiste'}
                  </Alert>
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="body2" color="text.secondary">Taux de remboursement</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#8B4513' }}>
                      {calculatedTaux}%
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center', py: 1 }}>
                    <Typography variant="body2" color="text.secondary">Montant à rembourser</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#2E7D32' }}>
                      {formatCurrency(calculatedMontant)}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <TextField
                    fullWidth
                    select
                    label="Mode de paiement"
                    value={modePaiement}
                    onChange={(e) => setModePaiement(e.target.value as 'virement' | 'especes')}
                    size="small"
                    sx={{ mb: 2 }}
                  >
                    <MenuItem value="virement">Virement bancaire</MenuItem>
                    <MenuItem value="especes">Espèces (cash)</MenuItem>
                  </TextField>
                  {modePaiement === 'virement' && (
                    <Box sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        label={
                          selectedAssure?.rib
                            ? '💳 Carte Visa (depuis la fiche assuré)'
                            : '💳 Numéro de carte Visa'
                        }
                        value={rib}
                        onChange={(e) => {
                          if (selectedAssure?.rib) return; // locked if from profile
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
                          setRib(digits.replace(/(\d{4})(?=\d)/g, '$1 '));
                        }}
                        size="small"
                        required
                        placeholder="4XXX XXXX XXXX XXXX"
                        slotProps={{
                          htmlInput: {
                            maxLength: 19,
                            readOnly: !!selectedAssure?.rib,
                            style: {
                              fontFamily: 'monospace',
                              letterSpacing: '0.15em',
                              fontSize: '1rem',
                              background: selectedAssure?.rib ? '#f0fdf4' : undefined,
                              cursor: selectedAssure?.rib ? 'default' : undefined,
                            },
                          },
                        }}
                        helperText={
                          selectedAssure?.rib
                            ? '✅ Pré-rempli automatiquement depuis la fiche — non modifiable ici'
                            : '⚠️ Aucun RIB enregistré. Saisissez-le ou mettez à jour la fiche assuré.'
                        }
                        sx={{
                          '& .MuiOutlinedInput-root': selectedAssure?.rib
                            ? { bgcolor: '#f0fdf4', '& fieldset': { borderColor: '#4caf50' } }
                            : {},
                        }}
                      />
                    </Box>
                  )}
                  <Button variant="contained" color="primary" fullWidth onClick={handleSave}>
                    Enregistrer
                  </Button>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  Sélectionnez une feuille de maladie pour calculer le remboursement.
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Paper sx={{ p: 2, mt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#8B4513' }}>
            Historique des derniers remboursements
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Montant</TableCell>
                  <TableCell>Taux</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Mode</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Imprimé</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {remboursements.slice(-5).reverse().map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{formatDate(r.date)}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(r.montantRembourse)}</TableCell>
                    <TableCell>{r.taux}%</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{r.modePaiement === 'virement' ? 'Virement' : 'Espèces'}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Chip
                        label={r.imprime ? 'Oui' : 'Non'}
                        size="small"
                        color={r.imprime ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton onClick={(e) => handleOpenMenu(e, r)} size="small">
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => {
          if (menuRemboursement) {
            setRemboursementDetails(menuRemboursement);
            setDetailsModalOpen(true);
          }
          handleCloseMenu();
        }}>
          <ListItemIcon>
            <InfoIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Détails</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => {
            if (menuRemboursement) {
              handlePrint(menuRemboursement);
            }
            handleCloseMenu();
          }}
          disabled={menuRemboursement?.imprime}
        >
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Reçu</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={detailsModalOpen} onClose={() => setDetailsModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Détails du Remboursement</DialogTitle>
        <DialogContent dividers>
          {remboursementDetails && (() => {
            const a = assures.find(x => String(x.id) === String(remboursementDetails.assureId));
            const f = feuilles.find(x => String(x.id) === String(remboursementDetails.feuilleMaladieId));
            const c = consultations.find(x => String(x.id) === String(remboursementDetails.consultationId));
            const m = f ? medecins.find(x => String(x.id) === String(f.medecinId)) : null;
            return (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="primary">Informations de l'assuré</Typography>
                <Typography variant="body2">Nom: {a?.prenom} {a?.nom}</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>N° Sécu: {a?.numSecu}</Typography>

                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="primary">Consultation</Typography>
                <Typography variant="body2">Médecin: {m ? `Dr ${m.prenom} ${m.nom}` : 'N/A'}</Typography>
                <Typography variant="body2">Spécialité: {m?.specialite === 'generaliste' ? 'Généraliste' : 'Spécialiste'}</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>Motif: {c?.motif}</Typography>

                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="primary">Paiement</Typography>
                <Typography variant="body2">Montant Total: {formatCurrency(remboursementDetails.montantTotal)}</Typography>
                <Typography variant="body2">Taux: {remboursementDetails.taux}%</Typography>
                <Typography variant="body2">Montant Remboursé: {formatCurrency(remboursementDetails.montantRembourse)}</Typography>
                <Typography variant="body2">Mode: {remboursementDetails.modePaiement === 'virement' ? 'Virement Bancaire' : 'Espèces'}</Typography>
                {remboursementDetails.rib && (
                  <Typography variant="body2">RIB: {remboursementDetails.rib}</Typography>
                )}
                <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">Effectué le: {formatDate(remboursementDetails.date)}</Typography>
              </Box>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsModalOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <div
        ref={printRef}
        className={printData ? 'receipt-print-wrapper' : ''}
        style={{
          display: printData ? 'block' : 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          minHeight: '100vh',
          backgroundColor: '#fff',
          zIndex: 99999,
          overflow: 'auto',
          padding: '40px',
          boxSizing: 'border-box',
        }}
      >
        {printData && (
          <>
            <Box sx={{ textAlign: 'center', mb: 2, '@media print': { display: 'none' } }}>
              <Button variant="contained" color="primary" onClick={() => window.print()} startIcon={<PrintIcon />} sx={{ mr: 1 }}>
                Imprimer le reçu
              </Button>
              <Button variant="outlined" onClick={() => setPrintData(null)}>
                Fermer
              </Button>
            </Box>
            <PrintableReceipt
              remboursement={printData.remb}
              assure={printData.assure}
              medecin={printData.medecin}
            />
          </>
        )}
      </div>
    </>
  );
};

export default RemboursementPage;
