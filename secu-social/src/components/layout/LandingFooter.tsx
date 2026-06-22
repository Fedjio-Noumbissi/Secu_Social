import { Box, Typography, Container } from '@mui/material';

const LandingFooter = () => {
  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(135deg, #2C1810, #5D4037)',
        color: '#FFD700',
        py: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Secu Sociale
            </Typography>
            <Typography variant="body2" sx={{ color: '#D4A574', maxWidth: 300 }}>
              Sécurité sociale au Cameroun – Protéger et prendre soin de chaque citoyen.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Contact
            </Typography>
            <Typography variant="body2" sx={{ color: '#D4A574' }}>
              Yaoundé, Cameroun
            </Typography>
            <Typography variant="body2" sx={{ color: '#D4A574' }}>
              +237 222 22 22 22
            </Typography>
            <Typography variant="body2" sx={{ color: '#D4A574' }}>
              contact@secu-social.cm
            </Typography>
          </Box>
        </Box>
        <Box sx={{ borderTop: '1px solid rgba(255, 215, 0, 0.2)', mt: 3, pt: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#D4A574' }}>
            &copy; {new Date().getFullYear()} Secu Sociale. Tous droits réservés.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingFooter;
