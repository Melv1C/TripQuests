import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Stack,
  Alert,
  LinearProgress,
  Snackbar
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTripSchema } from '../lib/schemas/trip';
import { useAtomValue } from 'jotai';
import { userDataAtom } from '../store/atoms/authAtoms';
import { useMutation } from '@tanstack/react-query';
import { createTrip } from '../services/firestore/trips';
import { CreateTripFormData } from '../types/Trip';

export const CreateTripPage: React.FC = () => {
  const navigate = useNavigate();
  const userData = useAtomValue(userDataAtom);
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<CreateTripFormData>({
    resolver: zodResolver(createTripSchema),
    defaultValues: {
      name: '',
      description: '',
      location: '',
      startDate: '',
      endDate: ''
    }
  });

  const tripMutation = useMutation({
    mutationFn: (formData: CreateTripFormData) => {
      if (!userData) {
        throw new Error('You must be logged in to create a trip');
      }
      return createTrip(formData, userData);
    },
    onSuccess: (data) => {
      reset();
      setSuccessMessage(`Trip "${data.name}" created successfully!`);
      setOpenSnackbar(true);
      // Navigate to the trip page after a short delay to show the success message
      setTimeout(() => {
        navigate(`/trip/${data.id}`);
      }, 1500);
    }
  });

  const onSubmit = (data: CreateTripFormData) => {
    tripMutation.mutate(data);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (!userData) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Alert severity="error">
            You must be logged in to create a trip.
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Trip
        </Typography>
        <Typography variant="body1" paragraph>
          Use this form to create a new trip adventure for you and your friends.
        </Typography>
        
        {tripMutation.isPending && <LinearProgress sx={{ mb: 2 }} />}
        
        {tripMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {tripMutation.error instanceof Error 
              ? tripMutation.error.message 
              : 'An error occurred while creating the trip.'}
          </Alert>
        )}
        
        <Paper elevation={3} sx={{ p: 4, mt: 2 }}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={3}>
              <TextField
                label="Trip Name"
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
                fullWidth
                required
              />
              
              <TextField
                label="Description"
                {...register('description')}
                error={!!errors.description}
                helperText={errors.description?.message}
                fullWidth
                multiline
                rows={3}
              />
              
              <TextField
                label="Location"
                {...register('location')}
                error={!!errors.location}
                helperText={errors.location?.message}
                fullWidth
                placeholder="e.g., Paris, France"
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Start Date"
                  type="date"
                  {...register('startDate')}
                  error={!!errors.startDate}
                  helperText={errors.startDate?.message}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
                
                <TextField
                  label="End Date"
                  type="date"
                  {...register('endDate')}
                  error={!!errors.endDate}
                  helperText={errors.endDate?.message}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                size="large"
                disabled={isSubmitting || tripMutation.isPending}
                sx={{ mt: 2 }}
              >
                {tripMutation.isPending ? 'Creating Trip...' : 'Create Trip'}
              </Button>
            </Stack>
          </form>
        </Paper>
      </Box>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        message={successMessage}
      />
    </Container>
  );
};
