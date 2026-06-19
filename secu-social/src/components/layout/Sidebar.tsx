import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUserRole } from '../../features/auth/authSlice';
import { getNavigationByRole } from '../../routes/navigation';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  MedicalServices as MedicalServicesIcon,
  AssignmentInd as AssignmentIndIcon,
  EventNote as EventNoteIcon,
  Description as DescriptionIcon,
  Medication as MedicationIcon,
  Payments as PaymentsIcon,
  BarChart as BarChartIcon,
  Folder as FolderIcon,
  History as HistoryIcon,
} from '@mui/icons-material';

const iconMap: Record<string, React.ReactNode> = {
  dashboard: <DashboardIcon />,
  people: <PeopleIcon />,
  medical_services: <MedicalServicesIcon />,
  assignment_ind: <AssignmentIndIcon />,
  event_note: <EventNoteIcon />,
  description: <DescriptionIcon />,
  medication: <MedicationIcon />,
  payments: <PaymentsIcon />,
  bar_chart: <BarChartIcon />,
  folder: <FolderIcon />,
  history: <HistoryIcon />,
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const DRAWER_WIDTH = 260;

const Sidebar = ({ open, onClose }: SidebarProps) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = useSelector(selectUserRole);

  const navItems = userRole ? getNavigationByRole(userRole) : [];

  const handleNavigate = (path: string) => {
    navigate(path);
    if (!isDesktop) onClose();
  };

  const drawerContent = (
    <Box sx={{ mt: 1 }}>
      <List sx={{ px: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          return (
            <ListItemButton
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                backgroundColor: isActive ? 'rgba(139, 69, 19, 0.08)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(139, 69, 19, 0.12)',
                },
                '& .MuiListItemIcon-root': {
                  color: isActive ? '#8B4513' : '#666',
                },
                '& .MuiListItemText-primary': {
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#8B4513' : '#333',
                  fontFamily: '"Centray", "Roboto", sans-serif',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {iconMap[item.icon] || <DashboardIcon />}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={isDesktop ? 'permanent' : 'temporary'}
      open={isDesktop ? true : open}
      onClose={onClose}
      sx={{
        width: isDesktop ? DRAWER_WIDTH : 'auto',
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          mt: isDesktop ? '64px' : 0,
          height: isDesktop ? 'calc(100% - 64px)' : '100%',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
export { DRAWER_WIDTH };
