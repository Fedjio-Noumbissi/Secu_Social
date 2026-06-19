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
} from '@mui/icons-material';
import { apiService } from '../../services/api';
import { setMedecins, removeMedecin } from '../../features/medecins/medecinsSlice';
import type { Medecin } from '../../types';
import type { RootState } from '../../store';

const MedecinsListPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const medecins = useSelector((state: RootState) => state.medecins.medecins);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiService.get<Medecin[]>('/medecins');
        dispatch(setMedecins(data));
      } catch (err) {
        console.error('Erreur chargement médecins', err);
      }
    };
    fetchData();
  }, [dispatch]);

  const filteredMedecins = medecins.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.nom.toLowerCase().includes(q) ||
      m.prenom.toLowerCase().includes(q) ||
      m.matricule.toLowerCase().includes(q) ||
      m.specialite.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q)
    );
  });

  const paginatedMedecins = filteredMedecins.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleDelete = async (id: string) => {
    try {
      await apiService.delete('/medecins', id);
      dispatch(removeMedecin(id));
    } catch (err) {
      console.error('Erreur suppression', err);
    }
    setDeleteDialog(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B4513' }}>
          Gestion des médecins
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/medecins/new')}
        >
          Nouveau médecin
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher par nom, prénom, matricule ou spécialité..."
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
              <TableCell>Matricule</TableCell>
              <TableCell>Nom & Prénom</TableCell>
              <TableCell>Spécialité</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Téléphone</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Email</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Assuré ?</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedMedecins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    Aucun médecin trouvé.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedMedecins.map((medecin) => (
                <TableRow key={medecin.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{medecin.matricule}</TableCell>
                  <TableCell>{medecin.nom} {medecin.prenom}</TableCell>
                  <TableCell>
                    <Chip
                      label={medecin.specialite === 'generaliste' ? 'Généraliste' : 'Spécialiste'}
                      size="small"
                      color={medecin.specialite === 'generaliste' ? 'success' : 'warning'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{medecin.telephone}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{medecin.email}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    {medecin.estAussiAssure ? (
                      <Chip label="Oui" size="small" color="info" />
                    ) : (
                      <Chip label="Non" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Modifier">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/medecins/${medecin.id}/edit`)}
                        sx={{ color: '#8B4513' }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton
                        size="small"
                        onClick={() => setDeleteDialog(medecin.id)}
                        sx={{ color: '#C62828' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredMedecins.length}
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
            Êtes-vous sûr de vouloir supprimer ce médecin ? Cette action est irréversible.
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

export default MedecinsListPage;
