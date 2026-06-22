import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Button, TextField, InputAdornment, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Tooltip, TablePagination, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Select, MenuItem, FormControl, InputLabel,
  Menu, ListItemIcon, ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import LockResetIcon from '@mui/icons-material/LockReset';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { apiService } from '../../services/api';
import { setMedecins, removeMedecin } from '../../features/medecins/medecinsSlice';
import type { Medecin, User } from '../../types';
import type { RootState } from '../../store';

const MedecinsListPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const medecins = useSelector((state: RootState) => state.medecins.medecins);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [filterSpecialite, setFilterSpecialite] = useState<string>('toutes');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [passwordDialog, setPasswordDialog] = useState<{ open: boolean, password?: string }>({ open: false });
  const [resetDialog, setResetDialog] = useState<string | null>(null);
  const [unlockDialog, setUnlockDialog] = useState<string | null>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeMedecinId, setActiveMedecinId] = useState<string | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, medecinId: string) => {
    setAnchorEl(event.currentTarget);
    setActiveMedecinId(medecinId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setActiveMedecinId(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [medecinsData, usersData] = await Promise.all([
          apiService.get<Medecin[]>('/medecins'),
          apiService.get<User[]>('/users')
        ]);
        dispatch(setMedecins(medecinsData));
        setUsers(usersData);
      } catch (err) {
        console.error('Erreur chargement', err);
      }
    };
    fetchData();
  }, [dispatch]);

  const filteredMedecins = medecins.filter((m) => {
    const q = search.toLowerCase();
    const matchesSearch = (
      m.nom.toLowerCase().includes(q) ||
      m.prenom.toLowerCase().includes(q) ||
      m.matricule.toLowerCase().includes(q) ||
      m.specialite.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q)
    );
    const matchesSpecialite = filterSpecialite === 'toutes' || m.specialite === filterSpecialite;
    return matchesSearch && matchesSpecialite;
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

  const getUserByMedecinId = (medecinId: string) => {
    return users.find(u => u.profilId === String(medecinId) && u.role === 'medecin');
  };

  const handleViewPassword = (medecinId: string) => {
    const user = getUserByMedecinId(medecinId);
    if (user) {
      setPasswordDialog({ open: true, password: user.password });
    } else {
      setPasswordDialog({ open: true, password: 'Aucun compte associé' });
    }
  };

  const handleResetPassword = async (medecinId: string) => {
    const user = getUserByMedecinId(medecinId);
    if (user) {
      try {
        await apiService.patch('/users', user.id, { password: '00000' });
        setUsers(users.map(u => u.id === user.id ? { ...u, password: '00000' } : u));
      } catch (err) {
        console.error('Erreur réinitialisation', err);
      }
    }
    setResetDialog(null);
  };

  const handleUnlockAccount = async (medecinId: string) => {
    const user = getUserByMedecinId(medecinId);
    if (user) {
      try {
        await apiService.patch('/users', user.id, { accountLocked: false, failedAttempts: 0 });
        setUsers(users.map(u => u.id === user.id ? { ...u, accountLocked: false, failedAttempts: 0 } : u));
      } catch (err) {
        console.error('Erreur déblocage', err);
      }
    }
    setUnlockDialog(null);
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

      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          sx={{ flex: 1, minWidth: 200 }}
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
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="filter-specialite-label">Spécialité</InputLabel>
          <Select
            labelId="filter-specialite-label"
            value={filterSpecialite}
            label="Spécialité"
            onChange={(e) => setFilterSpecialite(e.target.value)}
          >
            <MenuItem value="toutes">Toutes</MenuItem>
            <MenuItem value="generaliste">Généraliste</MenuItem>
            <MenuItem value="specialiste">Spécialiste</MenuItem>
          </Select>
        </FormControl>
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
                    <IconButton size="small" onClick={(e) => handleOpenMenu(e, medecin.id)}>
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

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => { navigate(`/medecins/${activeMedecinId}`); handleCloseMenu(); }}>
          <ListItemIcon><VisibilityIcon fontSize="small" color="primary" /></ListItemIcon>
          <ListItemText>Voir détails</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { activeMedecinId && handleViewPassword(activeMedecinId); handleCloseMenu(); }}>
          <ListItemIcon><VpnKeyIcon fontSize="small" sx={{ color: '#F57C00' }} /></ListItemIcon>
          <ListItemText>Voir mot de passe</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { activeMedecinId && setResetDialog(activeMedecinId); handleCloseMenu(); }}>
          <ListItemIcon><LockResetIcon fontSize="small" sx={{ color: '#1976D2' }} /></ListItemIcon>
          <ListItemText>Réinitialiser (00000)</ListItemText>
        </MenuItem>
        {activeMedecinId && getUserByMedecinId(activeMedecinId)?.accountLocked && (
          <MenuItem onClick={() => { setUnlockDialog(activeMedecinId); handleCloseMenu(); }}>
            <ListItemIcon><LockOpenIcon fontSize="small" sx={{ color: '#4CAF50' }} /></ListItemIcon>
            <ListItemText>Débloquer compte</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => { navigate(`/medecins/${activeMedecinId}/edit`); handleCloseMenu(); }}>
          <ListItemIcon><EditIcon fontSize="small" sx={{ color: '#8B4513' }} /></ListItemIcon>
          <ListItemText>Modifier</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { activeMedecinId && setDeleteDialog(activeMedecinId); handleCloseMenu(); }}>
          <ListItemIcon><DeleteIcon fontSize="small" sx={{ color: '#C62828' }} /></ListItemIcon>
          <ListItemText>Supprimer</ListItemText>
        </MenuItem>
      </Menu>

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

      <Dialog open={passwordDialog.open} onClose={() => setPasswordDialog({ open: false })}>
        <DialogTitle>Mot de passe du médecin</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Le mot de passe actuel de ce médecin est : <strong>{passwordDialog.password}</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog({ open: false })} color="primary" variant="contained">Fermer</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!resetDialog} onClose={() => setResetDialog(null)}>
        <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Voulez-vous vraiment réinitialiser le mot de passe de ce médecin à <strong>00000</strong> ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="primary" onClick={() => setResetDialog(null)}>Annuler</Button>
          <Button onClick={() => resetDialog && handleResetPassword(resetDialog)} variant="contained" color="error">Réinitialiser</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!unlockDialog} onClose={() => setUnlockDialog(null)}>
        <DialogTitle>Débloquer le compte</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Voulez-vous vraiment débloquer ce compte médecin (remettre les tentatives à zéro) ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="primary" onClick={() => setUnlockDialog(null)}>Annuler</Button>
          <Button onClick={() => unlockDialog && handleUnlockAccount(unlockDialog)} variant="contained" color="success">Débloquer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MedecinsListPage;
