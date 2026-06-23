import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, Chip, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Menu, MenuItem, ListItemIcon, ListItemText
} from '@mui/material';
import { Add as AddIcon, Visibility as VisibilityIcon, Delete as DeleteIcon, MoreVert as MoreVertIcon, Edit as EditIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/auth/authSlice';
import { apiService } from '../../services/api';
import type { FeuilleMaladie, Assure } from '../../types';
import { formatDate } from '../../utils/dateHelpers';

const FeuillesListPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [feuilles, setFeuilles] = useState<FeuilleMaladie[]>([]);
  const [assures, setAssures] = useState<Assure[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeFeuilleId, setActiveFeuilleId] = useState<string | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setAnchorEl(event.currentTarget);
    setActiveFeuilleId(id);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setActiveFeuilleId(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fData, aData] = await Promise.all([
          apiService.get<FeuilleMaladie[]>('/feuillesMaladie'),
          apiService.get<Assure[]>('/assures'),
        ]);
        setFeuilles(fData);
        setAssures(aData);
      } catch (err) {
        console.error('Erreur chargement', err);
      }
    };
    fetchData();
  }, []);

  const getAssureName = (id: string) => {
    const a = assures.find((a) => String(a.id) === String(id));
    return a ? `${a.nom} ${a.prenom}` : id;
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.delete('/feuillesMaladie', id);
      setFeuilles((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error('Erreur suppression', err);
    }
    setDeleteDialog(null);
  };

  const filteredFeuilles = feuilles.filter((f) => {
    if (user?.role === 'medecin') {
      return f.medecinId === user.profilId;
    }
    return true;
  });

  const sorted = [...filteredFeuilles].sort((a, b) => b.date.localeCompare(a.date));
  const paginated = sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B4513' }}>
          Feuilles de maladie
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => navigate('/feuilles-maladie/new')}>
          Nouvelle feuille
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Détails</TableCell>
              <TableCell align="center">Validée</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  Aucune feuille de maladie.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((f) => (
                <TableRow key={f.id} hover>
                  <TableCell>{formatDate(f.date)}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{getAssureName(f.assureId)}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, maxWidth: { xs: 150, sm: 400 }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {f.details}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={f.validee ? 'Validée' : 'En attente'}
                      color={f.validee ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={(e) => handleOpenMenu(e, f.id)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredFeuilles.length}
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

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => { navigate(`/feuilles-maladie/${activeFeuilleId}`); handleCloseMenu(); }}>
          <ListItemIcon><VisibilityIcon fontSize="small" color="primary" /></ListItemIcon>
          <ListItemText>Voir détails</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { navigate(`/feuilles-maladie/${activeFeuilleId}/edit`); handleCloseMenu(); }}>
          <ListItemIcon><EditIcon fontSize="small" color="info" /></ListItemIcon>
          <ListItemText>Modifier</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { activeFeuilleId && setDeleteDialog(activeFeuilleId); handleCloseMenu(); }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Supprimer</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer cette feuille de maladie ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)} color="primary">
            Annuler
          </Button>
          <Button onClick={() => deleteDialog && handleDelete(deleteDialog)} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeuillesListPage;
