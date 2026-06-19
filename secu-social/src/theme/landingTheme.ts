import { createTheme } from '@mui/material/styles';

const landingTheme = createTheme({
  palette: {
    primary: {
      main: '#FFD700',
      light: '#FFED4A',
      dark: '#DAA520',
      contrastText: '#000000',
    },
    secondary: {
      main: '#FF8C00',
      light: '#FFA640',
      dark: '#CC7000',
      contrastText: '#000000',
    },
    background: {
      default: '#FFF8E1',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C1810',
      secondary: '#5D4037',
    },
  },
  typography: {
    fontFamily: '"Gabriola", "Garamond", "Papyrus", "Centray", serif',
    h1: {
      fontFamily: '"Gabriola", "Garamond", serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Gabriola", "Garamond", serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: '"Gabriola", "Garamond", serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Gabriola", "Garamond", serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Gabriola", "Garamond", serif',
      fontWeight: 500,
    },
    h6: {
      fontFamily: '"Gabriola", "Garamond", serif',
      fontWeight: 500,
    },
    body1: {
      fontFamily: '"Centray", "Garamond", serif',
    },
    body2: {
      fontFamily: '"Centray", "Garamond", serif',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          borderRadius: 8,
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
          color: '#000000',
          '&:hover': {
            background: 'linear-gradient(135deg, #FFED4A 0%, #FFA640 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(255, 215, 0, 0.15)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #FF8C00 0%, #FFD700 100%)',
        },
      },
    },
  },
});

export default landingTheme;
