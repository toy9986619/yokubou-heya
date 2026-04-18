'use client';

import { useMemo } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const AppThemeProvider = ({ children }) => {
  // Don't pass noSsr — it forces reading matchMedia on first client render,
  // which mismatches the SSR default (false) and triggers hydration warnings.
  // Default behavior keeps SSR/first-client render consistent, then the
  // post-mount effect updates to the real value (brief light-mode flash).
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = useMemo(
    () =>
      createTheme({
        palette: { mode: prefersDark ? 'dark' : 'light' },
      }),
    [prefersDark],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default AppThemeProvider;
