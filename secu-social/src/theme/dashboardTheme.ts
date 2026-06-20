import { createTheme } from '@mui/material/styles';

const dashboardTheme = createTheme({
  palette: {
    primary: {
      main: '#8B4513',
      light: '#A0522D',
      dark: '#5D2E0C',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#D2691E',
      light: '#E08E4A',
      dark: '#A0522D',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5F5F0',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#000000',
      secondary: '#4A4A4A',
    },
    error: {
      main: '#D32F2F',
    },
    success: {
      main: '#2E7D32',
    },
    warning: {
      main: '#FF8C00',
    },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 400,
      letterSpacing: '0.01em',
    },
    subtitle2: {
      fontWeight: 300,
      letterSpacing: '0.01em',
    },
    body1: {
      fontWeight: 400,
      fontSize: '0.95rem',
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.85rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '8px 20px',
          fontSize: '0.9rem',
        },
        contained: {
          boxShadow: '0 2px 6px rgba(139, 69, 19, 0.25)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(139, 69, 19, 0.35)',
          },
        },
        containedPrimary: {
          backgroundColor: '#8B4513',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#A0522D',
          },
          '&:disabled': {
            backgroundColor: '#C4B5A5',
            color: '#FFFFFF',
            boxShadow: 'none',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
        outlinedPrimary: {
          borderColor: '#8B4513',
          color: '#8B4513',
          borderWidth: 2,
          '&:hover': {
            borderColor: '#A0522D',
            color: '#A0522D',
            backgroundColor: 'rgba(139, 69, 19, 0.06)',
            borderWidth: 2,
          },
        },
        text: {
          color: '#8B4513',
          '&:hover': {
            backgroundColor: 'rgba(139, 69, 19, 0.06)',
          },
        },
        sizeSmall: {
          padding: '4px 12px',
          fontSize: '0.8rem',
        },
        sizeLarge: {
          padding: '12px 28px',
          fontSize: '1rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          border: '1px solid #E8E0D8',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#8B4513',
            color: '#FFFFFF',
            fontWeight: 600,
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(even)': {
            backgroundColor: '#FAF7F4',
          },
          '&:hover': {
            backgroundColor: '#F0EBE5',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E8E0D8',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#000000',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        standardWarning: {
          backgroundColor: '#FFF3E0',
          color: '#E65100',
        },
        standardError: {
          backgroundColor: '#FFEBEE',
          color: '#C62828',
        },
      },
    },
  },
});

export default dashboardTheme;
