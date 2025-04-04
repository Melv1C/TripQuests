import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors'; // Example color imports

// A basic theme instance for TripQuest app
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // A nice blue color for primary actions
    },
    secondary: {
      main: '#2e7d32', // Green color for secondary actions (nature/travel themed)
    },
    error: {
      main: red.A400, // Standard error color
    },
    background: {
      default: '#f5f5f5', // Light grey background
      paper: '#ffffff', // White background for "paper" elements
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none', // Don't uppercase button text
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Slightly rounded buttons
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Rounded cards
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)', // Subtle shadow
        },
      },
    },
  },
});

export default theme; 