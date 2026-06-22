import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess, loginFailure, setLoading } from '../features/auth/authSlice';
import { apiService } from '../services/api';
import type { User } from '../types';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  Link,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Lock } from '@mui/icons-material';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    dispatch(setLoading(true));

    try {
      const response = await apiService.post<{ token: string; user: User & { nom: string; prenom: string } }>('/auth/login', { email, password });
      localStorage.setItem('auth_token', response.token);
      dispatch(loginSuccess({ ...response.user, nom: response.user.nom || '', prenom: response.user.prenom || '' }));
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Erreur de connexion au serveur.';
      setError(msg);
      dispatch(loginFailure(msg));
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #FF8C00 0%, #FFD700 50%, #FF8C00 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 4,
            backdropFilter: 'blur(10px)',
            background: 'rgba(255,255,255,0.95)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFD700, #FF8C00)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                fontSize: 28,
              }}
              role="img"
              aria-label="Secu Sociale"
            >
              SS
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#2C1810' }}>
              Connexion
            </Typography>
            <Typography variant="body2" sx={{ color: '#5D4037', mt: 0.5 }}>
              Secu Sociale – Sécurité sociale du Cameroun
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: '#8B4513' }} />
                    </InputAdornment>
                  ),
                },
              }}
              autoComplete="email"
            />
            <TextField
              fullWidth
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#8B4513' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              autoComplete="current-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                background: 'linear-gradient(135deg, #8B4513, #A0522D)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1rem',
                '&:hover': {
                  background: 'linear-gradient(135deg, #A0522D, #8B4513)',
                },
              }}
            >
              {isSubmitting ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Se connecter'}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Link
              href="#"
              underline="hover"
              sx={{ color: '#8B4513', cursor: 'pointer', fontSize: '0.9rem' }}
              onClick={() => alert('Veuillez contacter l\'administrateur pour réinitialiser votre mot de passe.')}
            >
              Mot de passe oublié ?
            </Link>
          </Box>

          <Box sx={{ mt: 3, p: 2, bgcolor: '#FFF8E1', borderRadius: 2, fontSize: '0.8rem', color: '#5D4037' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
              Comptes de démonstration :
            </Typography>
            <Typography variant="caption" sx={{ display: 'block' }}>
              Assureur : assureur@secu-social.cm / admin123
            </Typography>
            <Typography variant="caption" sx={{ display: 'block' }}>
              Médecin : medecin@secu-social.cm / medecin123
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
