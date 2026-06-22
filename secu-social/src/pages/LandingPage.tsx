import { Box, Container, Typography, Button, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import GroupsIcon from '@mui/icons-material/Groups';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #FF8C00 0%, #FFD700 50%, #FF8C00 100%)',
          py: { xs: 8, md: 12 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 250,
            height: 250,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              fontSize: 40,
              border: '3px solid rgba(0,0,0,0.15)',
            }}
            role="img"
            aria-label="Secu Sociale"
          >
            ⚕
          </Box>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              color: '#2C1810',
              mb: 2,
              fontSize: { xs: '2rem', md: '3.5rem' },
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            Bienvenue sur Secu Sociale
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#5D4037',
              mb: 4,
              maxWidth: 600,
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.25rem' },
            }}
          >
            La plateforme de gestion de la sécurité sociale au Cameroun. Gérez vos
            assurés, consultations, remboursements et bien plus encore.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                py: 1.5,
                px: 4,
                fontSize: '1.1rem',
                background: '#2C1810',
                color: '#FFD700',
                '&:hover': { background: '#5D4037' },
              }}
            >
              Accéder à mon espace
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #FFF8E1, #FFE0B2)',
                borderRadius: 4,
                height: '100%',
              }}
            >
              <LocalHospitalIcon sx={{ fontSize: 48, color: '#FF8C00', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#2C1810', mb: 1 }}>
                Pour les Médecins
              </Typography>
              <Typography variant="body1" sx={{ color: '#5D4037' }}>
                Gérez vos consultations, prescriptions et feuilles de maladie.
                Accédez aux dossiers de vos patients en toute simplicité.
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #FFE0B2, #FFCC80)',
                borderRadius: 4,
                height: '100%',
              }}
            >
              <SecurityIcon sx={{ fontSize: 48, color: '#D2691E', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#2C1810', mb: 1 }}>
                Pour les Assureurs
              </Typography>
              <Typography variant="body1" sx={{ color: '#5D4037' }}>
                Gérez les assurés, les médecins, les remboursements et accédez
                aux rapports et statistiques détaillés.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C1810', mb: 4 }}>
            Quelques chiffres clés
          </Typography>
          <Grid container spacing={3} sx={{ justifyContent: "center" }}>
            {[
              { icon: <GroupsIcon />, label: 'Assurés actifs', value: '2 500+' },
              { icon: <LocalHospitalIcon />, label: 'Médecins partenaires', value: '150+' },
              { icon: <MonetizationOnIcon />, label: 'Remboursés (2025)', value: '50M FCFA' },
              { icon: <SecurityIcon />, label: 'Années d\'existence', value: '10+' },
            ].map((stat, idx) => (
              <Grid size={{ xs: 6, md: 3 }} key={idx}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    bgcolor: '#FFF8E1',
                    borderRadius: 3,
                    border: '1px solid #FFE0B2',
                  }}
                >
                  <Box sx={{ color: '#FF8C00', mb: 1 }}>{stat.icon}</Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#2C1810' }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#5D4037' }}>
                    {stat.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;
