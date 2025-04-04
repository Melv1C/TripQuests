import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Stack
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { userDataAtom } from '../../store/atoms/authAtoms';
import { submissionSchema, SubmissionFormSchema } from '../../lib/schemas/submission';
import { uploadSubmissionImage } from '../../services/storage';
import { createSubmission } from '../../services/firestore/submissions';
import { styled } from '@mui/material/styles';

// Styled components for file upload
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

interface SubmissionFormProps {
  questId: string;
  tripId: string;
  onSubmissionSuccess?: () => void;
}

const SubmissionForm: React.FC<SubmissionFormProps> = ({ 
  questId, 
  tripId, 
  onSubmissionSuccess 
}) => {
  const userData = useAtomValue(userDataAtom);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const { 
    control, 
    handleSubmit, 
    reset,
    formState: { errors } 
  } = useForm<SubmissionFormSchema>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      notes: '',
    }
  });
  
  // Combined mutation for upload and submission creation
  const mutation = useMutation({
    mutationFn: async (data: SubmissionFormSchema) => {
      if (!userData) {
        throw new Error('User data not available. Please try again.');
      }
      
      // First, upload the image
      const imageUrl = await uploadSubmissionImage(
        data.imageFile,
        tripId,
        questId,
        userData.uid
      );
      
      // Then create the submission
      return createSubmission(
        questId,
        tripId,
        { uid: userData.uid, pseudo: userData.pseudo },
        imageUrl,
        data.notes
      );
    },
    onSuccess: () => {
      reset();
      setSelectedFileName(null);
      setPreviewUrl(null);
      
      if (onSubmissionSuccess) {
        onSubmissionSuccess();
      }
    }
  });
  
  const onSubmit = (data: SubmissionFormSchema) => {
    mutation.mutate(data);
  };
  
  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <Box component={Paper} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Submit Your Quest Evidence
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Upload a photo as evidence of your quest completion. You can add optional notes to explain your submission.
      </Typography>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          {/* File upload */}
          <Box>
            <Controller
              name="imageFile"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mb: 2 }}
                  >
                    Upload Photo
                    <VisuallyHiddenInput 
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onChange(file);
                          handleFileChange(e);
                        }
                      }}
                      {...field}
                    />
                  </Button>
                  
                  {selectedFileName && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Selected: {selectedFileName}
                    </Typography>
                  )}
                  
                  {previewUrl && (
                    <Box
                      sx={{
                        width: '100%',
                        maxHeight: 200,
                        overflow: 'hidden',
                        borderRadius: 1,
                        mb: 2
                      }}
                    >
                      <img
                        src={previewUrl}
                        alt="Preview"
                        style={{
                          width: '100%',
                          maxHeight: 200,
                          objectFit: 'contain'
                        }}
                      />
                    </Box>
                  )}
                  
                  {errors.imageFile && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {errors.imageFile.message}
                    </Alert>
                  )}
                </Box>
              )}
            />
          </Box>
          
          {/* Notes textarea */}
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Notes (optional)"
                multiline
                rows={3}
                fullWidth
                placeholder="Add any additional context or notes about your submission..."
                error={!!errors.notes}
                helperText={errors.notes?.message}
              />
            )}
          />
          
          {/* Error message */}
          {mutation.isError && (
            <Alert severity="error">
              {mutation.error instanceof Error 
                ? mutation.error.message 
                : 'An error occurred. Please try again.'}
            </Alert>
          )}
          
          {/* Submit button */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={mutation.isPending}
            sx={{ mt: 2 }}
          >
            {mutation.isPending ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} /> 
                {previewUrl ? 'Saving Submission...' : 'Uploading Image...'}
              </>
            ) : (
              'Submit Evidence'
            )}
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default SubmissionForm; 