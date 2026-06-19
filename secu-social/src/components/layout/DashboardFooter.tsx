import { Box, Typography, Container } from '@mui/material';

const DashboardFooter = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#F5F5F0',
        borderTop: '1px solid #E8E0D8',
        py: 2,
        mt: 'auto',
      }}
    >
      <Container maxWidth={false} sx={{ px: 3 }}>
        <Typography variant="body2" sx={{ color: '#8B4513', textAlign: 'center', fontSize: '0.8rem' }}>
          &copy; {new Date().getFullYear()} Secu Social – Sécurité sociale du Cameroun. Tous droits réservés.
        </Typography>
      </Container>
    </Box>
  );
};

export default DashboardFooter;
