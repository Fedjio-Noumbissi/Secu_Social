import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';

const LandingHeader = () => {
  const navigate = useNavigate();

  return (
    <AppBar position="sticky" elevation={0}>
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          <Box
            component={Link}
            to="/"
            sx={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFD700, #FF8C00)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 'bold',
                color: '#000',
                border: '2px solid rgba(0,0,0,0.2)',
              }}
              role="img"
              aria-label="Secu Sociale"
            >
              SS
            </Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: '#FFF', letterSpacing: 1, display: { xs: 'none', sm: 'block' } }}
            >
              Secu Sociale
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/login')}
              sx={{ fontWeight: 600 }}
            >
              Connexion
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default LandingHeader;
