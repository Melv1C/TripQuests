import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';

// MUI Components
import {
  Avatar,
  Box,
  Button,
  Container,
  Grid,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';

// Custom Components
import PasswordField from '../components/form/PasswordField';

// Schemas and Services
import { loginSchema, LoginFormValues } from '../lib/schemas/auth';
import { signIn } from '../services/auth';
import { currentUserAtom, isAuthLoadingAtom } from '../store/atoms/authAtoms';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [generalError, setGeneralError] = useState<string | null>(null);
  
  // Get authentication state from Jotai
  const currentUser = useAtomValue(currentUserAtom);
  const isAuthLoading = useAtomValue(isAuthLoadingAtom);
  
  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (!isAuthLoading && currentUser) {
      navigate('/dashboard');
    }
  }, [isAuthLoading, currentUser, navigate]);
  
  // Form setup with React Hook Form and Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // User login mutation
  const mutation = useMutation({
    mutationFn: (data: LoginFormValues) => signIn(data.email, data.password),
    onSuccess: () => {
      // Redirect happens automatically via the useEffect hook when currentUser is updated
    },
    onError: (error: Error) => {
      // Handle login errors
      setGeneralError(error.message);
    },
  });

  // Form submission handler
  const onSubmit = (data: LoginFormValues) => {
    setGeneralError(null);
    mutation.mutate(data);
  };

  // Show loading indicator while checking auth state
  if (isAuthLoading) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            mt: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Checking authentication status...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          mb: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <LockOutlined />
          </Avatar>
          
          <Typography component="h1" variant="h5" gutterBottom>
            Sign In
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Welcome back to TripQuest!
          </Typography>

          {/* Error message display */}
          {generalError && (
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
              {generalError}
            </Alert>
          )}
          
          {/* Login form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
            <Stack spacing={2.5}>
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                autoComplete="email"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
              
              <PasswordField
                fullWidth
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={mutation.isPending}
                sx={{ mt: 2, py: 1.5 }}
              >
                {mutation.isPending ? (
                  <CircularProgress color="inherit" size={24} />
                ) : (
                  'Sign In'
                )}
              </Button>
            </Stack>
            
            <Grid container sx={{ mt: 3 }}>
              <Grid size={{ xs: 6 }}>
                <Link href="#" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Link component={RouterLink} to="/register" variant="body2">
                  Don't have an account? Sign Up
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
