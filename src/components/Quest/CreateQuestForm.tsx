import React from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Stack, 
  Typography, 
  Alert, 
  CircularProgress 
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { questSchema, QuestFormSchema } from '../../lib/schemas/quest';
import { userDataAtom } from '../../store/atoms/authAtoms';
import { createQuest } from '../../services/firestore/quests';

interface CreateQuestFormProps {
  tripId: string;
  onClose: () => void;
}

export const CreateQuestForm: React.FC<CreateQuestFormProps> = ({ tripId, onClose }) => {
  const userData = useAtomValue(userDataAtom);
  const queryClient = useQueryClient();
  
  const { 
    control, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<QuestFormSchema>({
    resolver: zodResolver(questSchema),
    defaultValues: {
      title: '',
      description: '',
      points: 10,
      deadline: '',
    }
  });
  
  // Create quest mutation
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: (data: QuestFormSchema) => 
      createQuest(
        data, 
        tripId, 
        userData?.uid || '', 
        userData?.pseudo || ''
      ),
    onSuccess: () => {
      // Invalidate the quests query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['collection', 'quests'] });
      onClose();
    }
  });
  
  const onSubmit = (data: QuestFormSchema) => {
    if (!userData) {
      return; // Should not happen if UI properly restricts access
    }
    
    mutate(data);
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Create New Quest
      </Typography>
      
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error creating quest: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      )}
      
      <Stack spacing={3}>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Quest Title"
              fullWidth
              required
              error={!!errors.title}
              helperText={errors.title?.message}
            />
          )}
        />
        
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Quest Description"
              fullWidth
              required
              multiline
              rows={4}
              error={!!errors.description}
              helperText={errors.description?.message}
            />
          )}
        />
        
        <Controller
          name="points"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Points"
              type="number"
              fullWidth
              required
              error={!!errors.points}
              helperText={errors.points?.message}
              inputProps={{ min: 1 }}
              onChange={e => field.onChange(Number(e.target.value))}
            />
          )}
        />
        
        <Controller
          name="deadline"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Deadline (Optional)"
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!errors.deadline}
              helperText={errors.deadline?.message}
            />
          )}
        />
        
        {/* Placeholder for future image upload feature */}
        <Typography variant="body2" color="text.secondary">
          Note: Image upload will be available in a future update.
        </Typography>
      </Stack>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          disabled={isPending}
          startIcon={isPending ? <CircularProgress size={20} /> : null}
        >
          {isPending ? 'Creating...' : 'Create Quest'}
        </Button>
      </Box>
    </Box>
  );
};