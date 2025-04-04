import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Avatar, 
  CircularProgress, 
  Button, 
  TextField,
  IconButton,
  Alert,
  Snackbar 
} from '@mui/material';
import { useAtomValue, useSetAtom } from 'jotai';
import { currentUserAtom, userDataAtom, isAuthLoadingAtom } from '../store/atoms/authAtoms';
import { signOut } from '../services/auth';
import { PhotoCamera, Edit, Save, Cancel } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema, UpdateProfileFormValues } from '../lib/schemas/auth';
import { uploadAvatarImage } from '../services/storage';
import { updateUserProfile } from '../services/firestore/users';
import { useMutation } from '@tanstack/react-query';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAtomValue(currentUserAtom);
  const userData = useAtomValue(userDataAtom);
  const setUserData = useSetAtom(userDataAtom);
  const isAuthLoading = useAtomValue(isAuthLoadingAtom);
  
  // State for edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  // State for avatar preview
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  // State for snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Form handling with react-hook-form and zod
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      pseudo: userData?.pseudo || '',
      avatarFile: undefined
    }
  });

  // Update form defaults when userData changes
  useEffect(() => {
    if (userData) {
      setValue('pseudo', userData.pseudo);
    }
  }, [userData, setValue]);

  // Watch for avatar file changes to create preview
  const avatarFile = watch('avatarFile');
  
  // Update avatar preview when file changes
  useEffect(() => {
    if (avatarFile) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        if (e.target?.result) {
          setAvatarPreview(e.target.result as string);
        }
      };
      fileReader.readAsDataURL(avatarFile);
    } else {
      setAvatarPreview(null);
    }
  }, [avatarFile]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !currentUser) {
      navigate('/login');
    }
  }, [isAuthLoading, currentUser, navigate]);

  // Define mutation for profile update
  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfileFormValues) => {
      if (!currentUser?.uid) throw new Error('User not authenticated');
      
      const updates: { pseudo?: string; avatarUrl?: string } = {};
      
      // Only include pseudo if it has changed
      if (data.pseudo !== userData?.pseudo) {
        updates.pseudo = data.pseudo;
      }
      
      // Upload avatar if a new one was selected
      if (data.avatarFile) {
        const newAvatarUrl = await uploadAvatarImage(data.avatarFile, currentUser.uid);
        updates.avatarUrl = newAvatarUrl;
      }
      
      // Only proceed with update if there are changes
      if (Object.keys(updates).length > 0) {
        await updateUserProfile(currentUser.uid, updates);
        
        // Update local user data atom with new values
        setUserData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            ...(updates.pseudo ? { pseudo: updates.pseudo } : {}),
            ...(updates.avatarUrl ? { avatarUrl: updates.avatarUrl } : {})
          };
        });
      }
      
      return { success: true };
    },
    onSuccess: () => {
      setIsEditMode(false);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success'
      });
      reset();
    },
    onError: (error: Error) => {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to update profile',
        severity: 'error'
      });
    }
  });

  // Handle form submission
  const onSubmit = (data: UpdateProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  // Handle entering edit mode
  const handleEditClick = () => {
    setIsEditMode(true);
    setAvatarPreview(null);
  };

  // Handle canceling edits
  const handleCancelClick = () => {
    setIsEditMode(false);
    setAvatarPreview(null);
    reset();
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setValue('avatarFile', e.target.files[0]);
    }
  };

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Show loading state while auth state is being determined
  if (isAuthLoading || !userData) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Your Profile
        </Typography>
        
        <Paper elevation={2} sx={{ p: 4, mt: 2 }}>
          {isEditMode ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, mb: 3 }}>
                <Box sx={{ position: 'relative', mb: { xs: 2, sm: 0 } }}>
                  <Avatar 
                    sx={{ width: 100, height: 100, mb: 1 }} 
                    alt={userData.pseudo}
                    src={avatarPreview || userData.avatarUrl || undefined}
                  />
                  <input
                    accept="image/*"
                    type="file"
                    id="avatar-upload"
                    style={{ display: 'none' }}
                    onChange={handleFileInputChange}
                  />
                  <label htmlFor="avatar-upload">
                    <IconButton 
                      color="primary" 
                      aria-label="upload picture" 
                      component="span"
                      sx={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: 'background.paper' }}
                    >
                      <PhotoCamera />
                    </IconButton>
                  </label>
                </Box>
                
                <Box sx={{ ml: { sm: 3 }, flexGrow: 1 }}>
                  <Controller
                    name="pseudo"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Pseudo"
                        variant="outlined"
                        fullWidth
                        error={!!errors.pseudo}
                        helperText={errors.pseudo?.message}
                        margin="normal"
                      />
                    )}
                  />
                  <Typography variant="body1" color="text.secondary">
                    {userData.email}
                  </Typography>
                  {errors.avatarFile && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {errors.avatarFile.message}
                    </Alert>
                  )}
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={handleCancelClick}
                  sx={{ mr: 1 }}
                  startIcon={<Cancel />}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  variant="contained" 
                  color="primary"
                  disabled={isSubmitting || updateProfileMutation.isPending}
                  startIcon={<Save />}
                >
                  Save Changes
                  {(isSubmitting || updateProfileMutation.isPending) && (
                    <CircularProgress size={24} sx={{ ml: 1 }} />
                  )}
                </Button>
              </Box>
              {updateProfileMutation.isError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {updateProfileMutation.error instanceof Error 
                    ? updateProfileMutation.error.message 
                    : 'An error occurred while updating your profile'}
                </Alert>
              )}
            </form>
          ) : (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar 
                  sx={{ width: 80, height: 80, mr: 3 }} 
                  alt={userData.pseudo}
                  src={userData.avatarUrl || undefined}
                />
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {userData.pseudo}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {userData.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Member since: {userData.createdAt ? userData.createdAt.toLocaleDateString() : 'N/A'}
                  </Typography>
                </Box>
                <IconButton 
                  color="primary" 
                  sx={{ ml: 'auto' }}
                  onClick={handleEditClick}
                  aria-label="edit profile"
                >
                  <Edit />
                </IconButton>
              </Box>
              
              <Typography variant="body1" paragraph>
                Participating in {userData.participatingTripIds.length} {userData.participatingTripIds.length === 1 ? 'trip' : 'trips'}
              </Typography>
              
              <Button 
                variant="outlined" 
                color="error" 
                onClick={handleLogout}
                sx={{ mt: 2 }}
              >
                Sign Out
              </Button>
            </>
          )}
        </Paper>
      </Box>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};
