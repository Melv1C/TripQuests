import { zodResolver } from '@hookform/resolvers/zod';
import { AddAPhoto, Cancel, Edit, FileUpload, Save } from '@mui/icons-material';
import {
    Alert,
    Avatar,
    Box,
    Button,
    CircularProgress,
    Container,
    IconButton,
    Paper,
    Snackbar,
    TextField,
    Typography,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useAtomValue, useSetAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { CameraCapture } from '../components/Camera/CameraCapture';
import {
    UpdateProfileFormValues,
    updateProfileSchema,
} from '../lib/schemas/auth';
import { signOut } from '../services/auth';
import { updateUserProfile } from '../services/firestore/users';
import { uploadAvatarImage } from '../services/storage';
import {
    currentUserAtom,
    isAuthLoadingAtom,
    userDataAtom,
} from '../store/atoms/authAtoms';

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
        severity: 'success' as 'success' | 'error',
    });
    // State for camera dialog
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    // Form handling with react-hook-form and zod
    const {
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<UpdateProfileFormValues>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            pseudo: userData?.pseudo || '',
            avatarFile: undefined,
        },
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
                const newAvatarUrl = await uploadAvatarImage(
                    data.avatarFile,
                    currentUser.uid
                );
                updates.avatarUrl = newAvatarUrl;
            }

            // Only proceed with update if there are changes
            if (Object.keys(updates).length > 0) {
                await updateUserProfile(currentUser.uid, updates);

                // Update local user data atom with new values
                setUserData((prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        ...(updates.pseudo ? { pseudo: updates.pseudo } : {}),
                        ...(updates.avatarUrl
                            ? { avatarUrl: updates.avatarUrl }
                            : {}),
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
                severity: 'success',
            });
            reset();
        },
        onError: (error: Error) => {
            setSnackbar({
                open: true,
                message: error.message || 'Failed to update profile',
                severity: 'error',
            });
        },
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

    // Handle captured image from camera
    const handleCapturedImage = (file: File) => {
        setValue('avatarFile', file);
    };

    // Handle snackbar close
    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    // Show loading state while auth state is being determined
    if (isAuthLoading || !userData) {
        return (
            <Container
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}
            >
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
            <Box sx={{ my: { xs: 3, sm: 4 } }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Your Profile
                </Typography>

                <Paper elevation={2} sx={{ p: { xs: 2, sm: 3, md: 4 }, mt: 2 }}>
                    {isEditMode ? (
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    alignItems: {
                                        xs: 'flex-start',
                                        sm: 'center',
                                    },
                                    mb: 3,
                                }}
                            >
                                <Box
                                    sx={{
                                        position: 'relative',
                                        mb: { xs: 2, sm: 0 },
                                        alignSelf: {
                                            xs: 'center',
                                            sm: 'flex-start',
                                        },
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            width: { xs: 80, sm: 100 },
                                            height: { xs: 80, sm: 100 },
                                            mb: 1,
                                        }}
                                        alt={userData.pseudo}
                                        src={
                                            avatarPreview ||
                                            userData.avatarUrl ||
                                            undefined
                                        }
                                    />
                                    <input
                                        accept="image/*"
                                        type="file"
                                        id="avatar-upload"
                                        style={{ display: 'none' }}
                                        onChange={handleFileInputChange}
                                    />

                                    {/* Use completely different icons for the two actions */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            bottom: -8,
                                            right: -8,
                                            display: 'flex',
                                            gap: 0.5,
                                        }}
                                    >
                                        {/* Camera button with AddAPhoto icon */}
                                        <IconButton
                                            color="secondary"
                                            aria-label="take photo with camera"
                                            onClick={() =>
                                                setIsCameraOpen(true)
                                            }
                                            title="Take a photo with camera"
                                            sx={{
                                                backgroundColor:
                                                    'background.paper',
                                                width: { xs: 32, sm: 40 },
                                                height: { xs: 32, sm: 40 },
                                                border: '2px solid',
                                                borderColor: 'secondary.main',
                                                '&:hover': {
                                                    backgroundColor:
                                                        'secondary.light',
                                                    color: 'secondary.contrastText',
                                                },
                                            }}
                                        >
                                            <AddAPhoto
                                                sx={{
                                                    fontSize: {
                                                        xs: 16,
                                                        sm: 20,
                                                    },
                                                }}
                                            />
                                        </IconButton>

                                        {/* File upload button with FileUpload icon */}
                                        <label htmlFor="avatar-upload">
                                            <IconButton
                                                color="primary"
                                                aria-label="upload existing photo"
                                                component="span"
                                                title="Upload from device"
                                                sx={{
                                                    backgroundColor:
                                                        'background.paper',
                                                    width: { xs: 32, sm: 40 },
                                                    height: { xs: 32, sm: 40 },
                                                    border: '2px solid',
                                                    borderColor: 'primary.main',
                                                    '&:hover': {
                                                        backgroundColor:
                                                            'primary.light',
                                                        color: 'primary.contrastText',
                                                    },
                                                }}
                                            >
                                                <FileUpload
                                                    sx={{
                                                        fontSize: {
                                                            xs: 16,
                                                            sm: 20,
                                                        },
                                                    }}
                                                />
                                            </IconButton>
                                        </label>
                                    </Box>
                                </Box>

                                <Box
                                    sx={{
                                        ml: { sm: 3 },
                                        flexGrow: 1,
                                        width: { xs: '100%', sm: 'auto' },
                                    }}
                                >
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
                                                helperText={
                                                    errors.pseudo?.message
                                                }
                                                margin="normal"
                                            />
                                        )}
                                    />
                                    <Typography
                                        variant="body1"
                                        color="text.secondary"
                                    >
                                        {userData.email}
                                    </Typography>
                                    {errors.avatarFile && (
                                        <Alert severity="error" sx={{ mt: 1 }}>
                                            {errors.avatarFile.message}
                                        </Alert>
                                    )}
                                </Box>
                            </Box>

                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: {
                                        xs: 'center',
                                        sm: 'flex-end',
                                    },
                                    mt: 2,
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    gap: { xs: 1, sm: 0 },
                                }}
                            >
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={handleCancelClick}
                                    sx={{
                                        mr: { sm: 1 },
                                        width: { xs: '100%', sm: 'auto' },
                                    }}
                                    startIcon={<Cancel />}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={
                                        isSubmitting ||
                                        updateProfileMutation.isPending
                                    }
                                    startIcon={<Save />}
                                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                                >
                                    Save Changes
                                    {(isSubmitting ||
                                        updateProfileMutation.isPending) && (
                                        <CircularProgress
                                            size={24}
                                            sx={{ ml: 1 }}
                                        />
                                    )}
                                </Button>
                            </Box>
                            {updateProfileMutation.isError && (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    {updateProfileMutation.error instanceof
                                    Error
                                        ? updateProfileMutation.error.message
                                        : 'An error occurred while updating your profile'}
                                </Alert>
                            )}
                        </form>
                    ) : (
                        <>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    alignItems: {
                                        xs: 'center',
                                        sm: 'flex-start',
                                    },
                                    mb: 3,
                                    position: 'relative',
                                }}
                            >
                                <Avatar
                                    sx={{
                                        width: { xs: 70, sm: 80 },
                                        height: { xs: 70, sm: 80 },
                                        mr: { xs: 0, sm: 3 },
                                        mb: { xs: 2, sm: 0 },
                                    }}
                                    alt={userData.pseudo}
                                    src={userData.avatarUrl || undefined}
                                />
                                <Box
                                    sx={{
                                        textAlign: { xs: 'center', sm: 'left' },
                                        width: '100%',
                                    }}
                                >
                                    <Typography variant="h5" gutterBottom>
                                        {userData.pseudo}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        color="text.secondary"
                                    >
                                        {userData.email}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Member since:{' '}
                                        {userData.createdAt
                                            ? userData.createdAt.toLocaleDateString()
                                            : 'N/A'}
                                    </Typography>
                                </Box>
                                <IconButton
                                    color="primary"
                                    sx={{
                                        position: {
                                            xs: 'absolute',
                                            sm: 'static',
                                        },
                                        top: { xs: 0 },
                                        right: { xs: 0 },
                                        ml: { sm: 'auto' },
                                    }}
                                    onClick={handleEditClick}
                                    aria-label="edit profile"
                                >
                                    <Edit />
                                </IconButton>
                            </Box>

                            <Typography
                                variant="body1"
                                paragraph
                                sx={{ textAlign: { xs: 'center', sm: 'left' } }}
                            >
                                Participating in{' '}
                                {userData.participatingTripIds.length}{' '}
                                {userData.participatingTripIds.length === 1
                                    ? 'trip'
                                    : 'trips'}
                            </Typography>

                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: {
                                        xs: 'center',
                                        sm: 'flex-start',
                                    },
                                }}
                            >
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={handleLogout}
                                    sx={{ mt: 2 }}
                                >
                                    Sign Out
                                </Button>
                            </Box>
                        </>
                    )}
                </Paper>
            </Box>

            <CameraCapture
                open={isCameraOpen}
                onClose={() => setIsCameraOpen(false)}
                onImageCapture={handleCapturedImage}
            />

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
