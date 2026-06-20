import { useState, ReactNode } from 'react';
import { Box, IconButton, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardHeader from '../components/layout/DashboardHeader';
import DashboardFooter from '../components/layout/DashboardFooter';
import Sidebar from '../components/layout/Sidebar';
import PrintStyles from '../components/print/PrintStyles';

interface DashboardLayoutProps {
  children?: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <>
      <PrintStyles />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <DashboardHeader />
      <Box sx={{ display: 'flex', flex: 1 }}>
        {!isDesktop && (
          <IconButton
            onClick={(e) => { (e.target as HTMLElement).blur(); setMobileOpen(true); }}
            sx={{ position: 'fixed', top: 12, left: 8, zIndex: 1200, color: '#8B4513' }}
            aria-label="Ouvrir le menu"
          >
            <MenuIcon />
          </IconButton>
        )}
        <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, md: 3 },
            display: 'flex',
            flexDirection: 'column',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          {children}
        </Box>
      </Box>
      <Box>
        <DashboardFooter />
      </Box>
    </Box>
    </>
  );
};

export default DashboardLayout;
