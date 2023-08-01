import { FC, useState, StrictMode } from 'react';
import { Container, CssBaseline, PaletteMode } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { RouterProvider, createHashRouter } from 'react-router-dom';
import SettingsPage from './Pages/Settings';
import HomePage from './Pages/Home';
import IApp from './interfaces/IApp';

const App: FC<IApp> = ({ settings }) => {
  const [themeState, setThemeState] = useState(settings?.theme);

  const theme = createTheme({
    palette: {
      mode: themeState as PaletteMode,
    },
  });

  const router = createHashRouter([
    {
      path: '/',
      element: <HomePage />,
    },
    {
      path: '/settings',
      element: (
        <SettingsPage themeState={themeState} setThemeState={setThemeState} />
      ),
    },
  ]);

  return (
    <StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container>
          <RouterProvider router={router} />
        </Container>
      </ThemeProvider>
    </StrictMode>
  );
};

export default App;
