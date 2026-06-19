import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store';
import { selectIsAuthenticated } from './features/auth/authSlice';
import landingTheme from './theme/landingTheme';
import dashboardTheme from './theme/dashboardTheme';
import AppRouter from './routes/AppRouter';

const ThemedApp = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const theme = useMemo(() => {
    return isAuthenticated ? dashboardTheme : landingTheme;
  }, [isAuthenticated]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRouter />
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <ThemedApp />
    </Provider>
  );
};

export default App;
