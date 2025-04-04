import { useAtomValue } from 'jotai';
import { Link as RouterLink } from 'react-router-dom';

// MUI components
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

// MUI icons
import ExploreIcon from '@mui/icons-material/Explore';
import AddIcon from '@mui/icons-material/Add';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import GroupsIcon from '@mui/icons-material/Groups';

// App imports
import { currentUserAtom, userDataAtom, isAuthLoadingAtom } from '../store/atoms/authAtoms';

// Feature card component for home page
interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FeatureCard = ({ title, description, icon }: FeatureCardProps) => {
  return (
    <Card
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 8,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
            color: 'primary.main',
          }}
        >
          {icon}
          <Typography variant="h6" component="h3" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

// Main HomePage component
export const HomePage = () => {
  // Get auth state from Jotai
  const currentUser = useAtomValue(currentUserAtom);
  const userData = useAtomValue(userDataAtom);
  const isAuthLoading = useAtomValue(isAuthLoadingAtom);
  
  // App features for feature cards
  const features = [
    {
      title: 'Create Quests',
      description: 'Design creative challenges for your travel group to complete during your trip.',
      icon: <PhotoCameraIcon fontSize="large" />,
    },
    {
      title: 'Compete with Friends',
      description: 'Complete quests, earn points, and climb the leaderboard to be the ultimate traveler.',
      icon: <EmojiEventsIcon fontSize="large" />,
    },
    {
      title: 'Social Experience',
      description: 'Share your travel experiences and review submissions from your fellow travelers.',
      icon: <GroupsIcon fontSize="large" />,
    },
  ];

  // Loading state
  if (isAuthLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        mb: 10,
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          background: 'linear-gradient(to bottom, #ffffff, #f8f8f8)',
          mb: 6,
          pb: 4,
          pt: { xs: 4, md: 6 },
          borderBottom: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Stack spacing={4} alignItems="center" textAlign="center">
            {/* App Icon and Title in same row on larger screens */}
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, 
                alignItems: 'center',
                justifyContent: { sm: 'center' },
                gap: { xs: 3, sm: 4 },
                width: '100%'
              }}
            >
              <Box
                component="img"
                src="/icon.png"
                alt="TripQuest Logo"
                sx={{
                  width: { xs: 80, sm: 100, md: 120 },
                  height: { xs: 80, sm: 100, md: 120 },
                  mb: { xs: 2, sm: 0 },
                  borderRadius: 3,
                  boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
                }}
              />
              <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography
                  component="h1"
                  variant="h3"
                  color="text.primary"
                  fontWeight="bold"
                  sx={{ mb: 2 }}
                >
                  Welcome to TripQuest
                </Typography>
                
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ maxWidth: '600px' }}
                >
                  Transform your travels into exciting adventures with gamified quests and challenges
                </Typography>
              </Box>
            </Box>
            
            {/* Welcome message for logged in users */}
            {userData && (
              <Typography variant="subtitle1" color="primary" sx={{ m: 0 }}>
                Welcome back, {userData.pseudo}!
              </Typography>
            )}
            
            {/* Call to action buttons - conditional based on auth state */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              justifyContent="center"
              sx={{ mt: { xs: 2, sm: 3 } }}
            >
              {!currentUser ? (
                // Not logged in - show auth buttons
                <>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    size="large"
                    color="primary"
                    sx={{ fontWeight: 'bold', px: 4, py: 1.5 }}
                  >
                    Get Started
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="outlined"
                    size="large"
                    color="primary"
                    sx={{ 
                      fontWeight: 'bold', 
                      px: 4, 
                      py: 1.5,
                    }}
                  >
                    Sign In
                  </Button>
                </>
              ) : (
                // Logged in - show app navigation buttons
                <>
                  <Button
                    component={RouterLink}
                    to="/dashboard"
                    variant="contained"
                    size="large"
                    color="primary"
                    startIcon={<ExploreIcon />}
                    sx={{ fontWeight: 'bold', px: 3, py: 1 }}
                  >
                    Your Dashboard
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/create-trip"
                    variant="outlined"
                    size="large"
                    color="primary"
                    startIcon={<AddIcon />}
                    sx={{ 
                      fontWeight: 'bold', 
                      px: 3, 
                      py: 1,
                    }}
                  >
                    Create Trip
                  </Button>
                </>
              )}
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="md">
        <Typography variant="h4" component="h2" sx={{ mb: 5, textAlign: 'center' }}>
          Make Your Travels Unforgettable
        </Typography>
        
        <Grid container spacing={6}>
          {features.map((feature, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
              <FeatureCard
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            </Grid>
          ))}
        </Grid>
      </Container>


        
      {/* How it works section */}
      <Container maxWidth="md">
        <Box sx={{ mt: 10 }}>
          <Typography variant="h4" component="h2" sx={{ mb: 5, textAlign: 'center' }}>
            How It Works
          </Typography>
          
          <Paper elevation={1} sx={{ p: 4, borderRadius: 2 }}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    1. Create a Trip
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Set up a new adventure and invite your friends to join
                  </Typography>
                </Box>
              </Grid>
              
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ 
                  position: 'relative',
                  p: 3, 
                  textAlign: 'center',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: { xs: '50%', md: 0 },
                    top: { xs: 0, md: '50%' },
                    width: { xs: '80%', md: 1 },
                    height: { xs: 1, md: '80%' },
                    transform: { 
                      xs: 'translateX(-50%) translateY(-50%)', 
                      md: 'translateY(-50%)' 
                    },
                    borderLeft: { xs: 'none', md: '1px solid' },
                    borderTop: { xs: '1px solid', md: 'none' },
                    borderColor: 'divider',
                    display: { xs: 'none', md: 'block' }
                  }
                }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    2. Create Quests
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Design creative challenges for everyone to complete
                  </Typography>
                </Box>
              </Grid>
              
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ 
                  position: 'relative',
                  p: 3, 
                  textAlign: 'center',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: { xs: '50%', md: 0 },
                    top: { xs: 0, md: '50%' },
                    width: { xs: '80%', md: 1 },
                    height: { xs: 1, md: '80%' },
                    transform: { 
                      xs: 'translateX(-50%) translateY(-50%)', 
                      md: 'translateY(-50%)' 
                    },
                    borderLeft: { xs: 'none', md: '1px solid' },
                    borderTop: { xs: '1px solid', md: 'none' },
                    borderColor: 'divider',
                    display: { xs: 'none', md: 'block' }
                  }
                }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    3. Complete & Review
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Complete quests, review submissions, and compete for the top spot
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};
