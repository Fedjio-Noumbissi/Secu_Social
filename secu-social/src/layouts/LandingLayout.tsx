import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import LandingHeader from '../components/layout/LandingHeader';
import LandingFooter from '../components/layout/LandingFooter';

const LandingLayout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <LandingHeader />
      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>
      <LandingFooter />
    </Box>
  );
};

export default LandingLayout;
