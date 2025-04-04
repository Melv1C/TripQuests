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
import { LockOutlined, PersonAdd } from '@mui/icons-material';

// Custom Components
import PasswordField from '../components/form/PasswordField';

// Schemas and Services
import { registerSchema, RegisterFormValues } from '../lib/schemas/auth';
import { registerUser } from '../services/auth';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [generalError, setGeneralError] = useState<string | null>(null);
  
  // Form setup with React Hook Form and Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      pseudo: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // User registration mutation with TanStack Query
  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      // Redirect to login page after successful registration
      navigate('/login', { 
        state: { 
          notification: {
            type: 'success',
            message: 'Registration successful! Please log in with your new account.'
          }
        }
      });
    },
    onError: (error: Error) => {
      // Handle specific errors
      setGeneralError(error.message);
    },
  });

  // Form submission handler
  const onSubmit = (data: RegisterFormValues) => {
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
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <PersonAdd />
          </Avatar>
          
          <Typography component="h1" variant="h5" gutterBottom>
            Create an Account
          </Typography>
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Join TripQuest to start creating and sharing adventures with friends!
          </Typography>

          {/* Error message display */}
          {generalError && (
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
              {generalError}
            </Alert>
          )}
          
          {/* Registration form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
            <Stack spacing={2.5}>
              <TextField
                label="Username"
                placeholder="Choose a unique username"
                fullWidth
                {...register('pseudo')}
                error={!!errors.pseudo}
                helperText={errors.pseudo?.message}
                InputProps={{
                  startAdornment: (
                    <Avatar 
                      sx={{ 
                        width: 24, 
                        height: 24, 
                        mr: 1, 
                        bgcolor: errors.pseudo ? 'error.light' : 'primary.light' 
                      }}
                    >
                      <LockOutlined sx={{ fontSize: 16 }} />
                    </Avatar>
                  ),
                }}
              />
              
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
              
              <PasswordField
                label="Confirm Password"
                fullWidth
                {...register('confirmPassword')}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
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
                  'Sign Up'
                )}
              </Button>
            </Stack>
            
            <Grid container justifyContent="center" sx={{ mt: 3 }}>
              <Grid size="grow">
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link component={RouterLink} to="/login" variant="body2">
                    Sign in
                  </Link>
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage; 