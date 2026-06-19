import { AppBar, Toolbar, Typography, Box, Button, Avatar, IconButton, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, logout } from '../../features/auth/authSlice';
import LogoutIcon from '@mui/icons-material/Logout';

const DashboardHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pl: { xs: '36px', sm: 0 } }}>
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
            aria-label="Secu Social"
          >
            SS
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#8B4513' }}>
            Secu Social
          </Typography>
        </Box>

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
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
            <Tooltip title="Déconnexion">
              <IconButton onClick={handleLogout} size="small" sx={{ color: '#8B4513' }}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default DashboardHeader;
