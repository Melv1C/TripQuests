import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors'; // Removed unused teal import

// A theme instance for TripQuest app using the coral/orange color from the icon
const theme = createTheme({
  palette: {
    primary: {
      main: '#F37A61', // Coral/orange color from the icon
      light: '#FF9980', // Lighter version
      dark: '#D15A41', // Darker version
      contrastText: '#ffffff', // White text on primary color background
    },
    secondary: {
      main: '#26A69A', // Teal as complementary color (works well with travel/nature theme)
      light: '#64D8CB',
      dark: '#00766C',
      contrastText: '#ffffff', // White text on secondary color background
    },
    error: {
      main: red.A400, // Standard error color
    },
    background: {
      default: '#f8f8f8', // Slightly lighter grey background
      paper: '#ffffff', // White background for "paper" elements
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif', // Updated to use Poppins as primary font
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none', // Don't uppercase button text
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Slightly rounded buttons
        },
        contained: {
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)', // Add subtle shadow to contained buttons
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
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)', // Subtle shadow for navbar
        },
      },
    },
  },
});

export default theme; 