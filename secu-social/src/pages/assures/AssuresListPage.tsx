import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Button, TextField, InputAdornment, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Tooltip, TablePagination, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { apiService } from '../../services/api';
import { setAssures, removeAssure } from '../../features/assures/assuresSlice';
import type { Assure, Medecin } from '../../types';
import { formatDate } from '../../utils/dateHelpers';
import MaskedSSN from '../../components/common/MaskedSSN';
import type { RootState } from '../../store';

const AssuresListPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const assures = useSelector((state: RootState) => state.assures.assures);
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assuresData, medecinsData] = await Promise.all([
          apiService.get<Assure[]>('/assures'),
          apiService.get<Medecin[]>('/medecins'),
        ]);
        dispatch(setAssures(assuresData));
        setMedecins(medecinsData);
      } catch (err) {
        console.error('Erreur chargement assurés', err);
      }
    };
    fetchData();
  }, [dispatch]);

  const filteredAssures = assures.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.nom.toLowerCase().includes(q) ||
      a.prenom.toLowerCase().includes(q) ||
      a.numSecu.includes(q) ||
      a.email.toLowerCase().includes(q)
    );
  });

  const paginatedAssures = filteredAssures.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleDelete = async (id: string) => {
    try {
      await apiService.delete('/assures', id);
      dispatch(removeAssure(id));
    } catch (err) {
      console.error('Erreur suppression', err);
    }
    setDeleteDialog(null);
  };

  const getMedecinName = (medecinId?: string) => {
    if (!medecinId) return null;
    const med = medecins.find((m) => String(m.id) === String(medecinId));
    return med ? `${med.prenom} ${med.nom}` : null;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B4513' }}>
          Gestion des assurés
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/assures/new')}
        >
          Nouvel assuré
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher par nom, prénom, n° sécu ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
          size="small"
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>N° Sécurité sociale</TableCell>
              <TableCell>Nom & Prénom</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Date naissance</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Téléphone</TableCell>
              <TableCell>Médecin traitant</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedAssures.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    Aucun assuré trouvé.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedAssures.map((assure) => {
                const hasMedecinTraitant = !!assure.medecinTraitantId;
                return (
                  <TableRow key={assure.id} hover>
                    <TableCell>
                      <MaskedSSN value={assure.numSecu} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {assure.nom} {assure.prenom}
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{formatDate(assure.dateNaissance)}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{assure.telephone}</TableCell>
                    <TableCell>
                      {hasMedecinTraitant ? (
                        <Chip
                          label={getMedecinName(assure.medecinTraitantId)}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      ) : (
                        <Chip
                          label="Non assigné"
                          size="small"
                          color="error"
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Voir détails">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/assures/${assure.id}`)}
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Modifier">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/assures/${assure.id}/edit`)}
                          sx={{ color: '#8B4513' }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          onClick={() => setDeleteDialog(assure.id)}
                          sx={{ color: '#C62828' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredAssures.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Lignes par page"
        />
      </TableContainer>

      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer cet assuré ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="primary" onClick={() => setDeleteDialog(null)}>Annuler</Button>
          <Button
            onClick={() => deleteDialog && handleDelete(deleteDialog)}
            variant="contained"
            color="error"
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssuresListPage;
