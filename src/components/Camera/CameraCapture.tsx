import { CameraAlt, Close, FlipCameraIos } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
} from '@mui/material';
import React, { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';

type CameraCaptureProps = {
    onImageCapture: (file: File) => void;
    open: boolean;
    onClose: () => void;
};

export function CameraCapture(props: CameraCaptureProps) {
    const { onImageCapture, open, onClose } = props;
    const webcamRef = useRef<Webcam>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>(
        'environment'
    );

    // Reset state when dialog opens/closes
    React.useEffect(() => {
        if (!open) {
            setCapturedImage(null);
            setError(null);
        }
    }, [open]);

    // Handle webcam errors
    const handleWebcamError = useCallback(() => {
        setError(
            "Couldn't access camera. Please check permissions or use the file upload option."
        );
    }, []);

    // Toggle between front and back cameras
    const toggleCamera = useCallback(() => {
        setFacingMode((prevMode) =>
            prevMode === 'user' ? 'environment' : 'user'
        );
    }, []);

    // Capture image from webcam
    const captureImage = useCallback(() => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            setCapturedImage(imageSrc);
        }
    }, [webcamRef]);

    // Convert data URL to File and send back
    const acceptImage = useCallback(() => {
        if (capturedImage) {
            // Convert data URL to blob
            const byteString = atob(capturedImage.split(',')[1]);
            const mimeString = capturedImage
                .split(',')[0]
                .split(':')[1]
                .split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);

            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            const blob = new Blob([ab], { type: mimeString });
            const file = new File([blob], `camera_capture_${Date.now()}.jpg`, {
                type: 'image/jpeg',
            });

            onImageCapture(file);
            onClose();
        }
    }, [capturedImage, onImageCapture, onClose]);

    // Retake photo
    const retakePhoto = useCallback(() => {
        setCapturedImage(null);
    }, []);

    // Video constraints - use selected camera mode with portrait orientation preference
    const videoConstraints = {
        facingMode: facingMode,
        width: { ideal: 720 },
        height: { ideal: 1280 },
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    overflow: 'hidden',
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                }}
            >
                Take Photo
                <IconButton onClick={onClose} size="small">
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 1, overflow: 'hidden' }}>
                {error ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                ) : (
                    <Box
                        sx={{
                            width: '100%',
                            height: 300,
                            position: 'relative',
                            aspectRatio: { xs: '3/4' },
                            backgroundColor: '#000',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        {!capturedImage ? (
                            <>
                                <Box
                                    sx={{
                                        position: 'relative',
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        overflow: 'hidden', // Keep overflow hidden on this inner container
                                    }}
                                >
                                    <Webcam
                                        ref={webcamRef}
                                        audio={false}
                                        screenshotFormat="image/jpeg"
                                        screenshotQuality={0.92}
                                        videoConstraints={videoConstraints}
                                        onUserMediaError={handleWebcamError}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'contain', // Use contain to show the entire camera view
                                        }}
                                        mirrored={facingMode === 'user'}
                                    />
                                </Box>
                                <IconButton
                                    onClick={toggleCamera}
                                    sx={{
                                        position: 'absolute',
                                        bottom: 16,
                                        right: 16,
                                        backgroundColor: 'rgba(0,0,0,0.5)',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0,0,0,0.7)',
                                        },
                                    }}
                                >
                                    <FlipCameraIos />
                                </IconButton>
                            </>
                        ) : (
                            <Box
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    overflow: 'hidden',
                                }}
                            >
                                <img
                                    src={capturedImage}
                                    alt="Captured"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain', // Show entire image without cropping
                                    }}
                                />
                            </Box>
                        )}
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'center', p: 2 }}>
                {!error &&
                    (!capturedImage ? (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={captureImage}
                            startIcon={<CameraAlt />}
                            fullWidth
                        >
                            Capture
                        </Button>
                    ) : (
                        <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                            <Button
                                variant="outlined"
                                onClick={retakePhoto}
                                fullWidth
                            >
                                Retake
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={acceptImage}
                                fullWidth
                            >
                                Use Photo
                            </Button>
                        </Box>
                    ))}
                {error && (
                    <Button variant="outlined" onClick={onClose} fullWidth>
                        Close
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
