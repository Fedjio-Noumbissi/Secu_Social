import { useState } from 'react';
import { AppBar, Toolbar, Typography, Box, Avatar, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, logout } from '../../features/auth/authSlice';
import LogoutIcon from '@mui/icons-material/Logout';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { apiService } from '../../services/api';
import type { User } from '../../types';

const DashboardHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    if (newPassword !== confirmPassword) {
      return setPasswordError('Les nouveaux mots de passe ne correspondent pas.');
    }
    if (!user) return;
    
    try {
      const dbUser = await apiService.getById<User>('/users', user.id);
      if (dbUser.password !== oldPassword) {
        return setPasswordError('L\'ancien mot de passe est incorrect.');
      }
      
      await apiService.patch('/users', user.id, { password: newPassword });
      setPasswordSuccess('Mot de passe mis à jour avec succès.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setOpenPasswordDialog(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (err) {
      setPasswordError('Erreur lors du changement de mot de passe.');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'assureur': return 'Assureur';
      case 'medecin': return 'Médecin';
      default: return '';
    }
  };

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: { xs: '40px', sm: 0 } }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8B4513, #D2691E)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 'bold',
              color: '#fff',
            }}
            role="img"
            aria-label="Secu Sociale"
          >
            SS
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#8B4513', letterSpacing: 1, display: { xs: 'none', sm: 'block' } }}>
            Secu Sociale
          </Typography>
        </Box>

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', display: { xs: 'none', md: 'block' } }}>
              {getRoleLabel(user.role)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#8B4513', fontSize: '0.85rem' }}>
                {user.nom?.[0] || user.email[0].toUpperCase()}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {user.nom ? `${user.prenom} ${user.nom}` : user.email}
                </Typography>
              </Box>
            </Box>
            <Tooltip title="Changer mot de passe">
              <IconButton onClick={() => setOpenPasswordDialog(true)} size="small" sx={{ color: '#8B4513' }}>
                <VpnKeyIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Déconnexion">
              <IconButton onClick={handleLogout} size="small" sx={{ color: '#8B4513' }}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Toolbar>

      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
        <DialogTitle>Changer de mot de passe</DialogTitle>
        <DialogContent>
          {passwordError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{passwordError}</Alert>}
          {passwordSuccess && <Alert severity="success" sx={{ mb: 2, mt: 1 }}>{passwordSuccess}</Alert>}
          <TextField fullWidth margin="dense" label="Ancien mot de passe" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
          <TextField fullWidth margin="dense" label="Nouveau mot de passe" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <TextField fullWidth margin="dense" label="Confirmer le nouveau mot de passe" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)} color="primary">Annuler</Button>
          <Button onClick={handleChangePassword} variant="contained" color="primary">Enregistrer</Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default DashboardHeader;
