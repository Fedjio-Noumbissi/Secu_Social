import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, IconButton,
  Menu, MenuItem, ListItemIcon, ListItemText,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@mui/material';
import { Add as AddIcon, Visibility as ViewIcon, MoreVert as MoreVertIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { apiService } from '../../services/api';
import { setConsultations } from '../../features/consultations/consultationsSlice';
import type { Consultation, Assure } from '../../types';
import { formatDate } from '../../utils/dateHelpers';
import type { RootState } from '../../store';
import { selectUser } from '../../features/auth/authSlice';

const ConsultationsListPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const consultations = useSelector((state: RootState) => state.consultations.consultations);
  const [assures, setAssures] = useState<Assure[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeConsultationId, setActiveConsultationId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, consultationId: string) => {
    setAnchorEl(event.currentTarget);
    setActiveConsultationId(consultationId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setActiveConsultationId(null);
  };

  const handleDelete = async (consultId: string) => {
    try {
      await apiService.delete('/consultations', consultId);
      // Reload list
      const updated = await apiService.get<Consultation[]>('/consultations');
      dispatch(setConsultations(updated));
    } catch (err) {
      console.error('Erreur suppression', err);
    }
    setDeleteDialog(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [consultData, assuresData] = await Promise.all([
          apiService.get<Consultation[]>('/consultations'),
          apiService.get<Assure[]>('/assures'),
        ]);
        dispatch(setConsultations(consultData));
        setAssures(assuresData);
      } catch (err) {
        console.error('Erreur chargement', err);
      }
    };
    fetchData();
  }, [dispatch]);

  const getAssureName = (id: string) => {
    const a = assures.find((a) => String(a.id) === String(id));
    return a ? `${a.nom} ${a.prenom}` : id;
  };

  const filteredConsultations = consultations.filter((c) => {
    if (user?.role === 'medecin' && c.medecinId !== user.profilId) {
      return false;
    }
    return true;
  });

  const sorted = [...filteredConsultations].sort((a, b) => b.date.localeCompare(a.date));
  const paginated = sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3, flexWrap: 'wrap', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B4513', fontSize: { xs: '1.4rem', sm: '1.75rem', md: '2rem' } }}>
          Consultations
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => navigate('/consultations/new')} fullWidth={false} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          Nouvelle consultation
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Motif</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Observations</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  Aucune consultation.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>{formatDate(c.date)}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{getAssureName(c.assureId)}</TableCell>
                  <TableCell>{c.motif}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, maxWidth: { xs: 120, sm: 300 }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.observations}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={(e) => handleOpenMenu(e, c.id)}>
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
          count={filteredConsultations.length}
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

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        <MenuItem onClick={() => { navigate(`/consultations/${activeConsultationId}`); handleCloseMenu(); }}>
          <ListItemIcon><ViewIcon fontSize="small" color="primary" /></ListItemIcon>
          <ListItemText>Voir détails</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { navigate(`/consultations/${activeConsultationId}/edit`); handleCloseMenu(); }}>
          <ListItemIcon><EditIcon fontSize="small" color="info" /></ListItemIcon>
          <ListItemText>Modifier</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { activeConsultationId && setDeleteDialog(activeConsultationId); handleCloseMenu(); }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Supprimer</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer cette consultation ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)} color="primary">Annuler</Button>
          <Button onClick={() => deleteDialog && handleDelete(deleteDialog)} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConsultationsListPage;
