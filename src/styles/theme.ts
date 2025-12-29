import { createTheme } from '@mui/material/styles';

// Custom dark theme with teal accents
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#26a69a',
      light: '#64d8cb',
      dark: '#00766c'
    },
    secondary: {
      main: '#ff7043',
      light: '#ffa270',
      dark: '#c63f17'
    },
    background: {
      default: '#0d1117',
      paper: '#161b22'
    }
  },
  typography: {
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em'
    }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    }
  }
});

export default theme;

