import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';

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

const LoginPage = () => {
  const navigate = useNavigate();
  const [generalError, setGeneralError] = useState<string | null>(null);
  
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
      // Redirect to dashboard on successful login
      navigate('/dashboard');
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
              <Grid item xs>
                <Link href="#" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
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

export default LoginPage; 