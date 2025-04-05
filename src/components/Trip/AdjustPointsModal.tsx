import { zodResolver } from '@hookform/resolvers/zod';
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
} from '@mui/material';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

// Define the validation schema
const adjustPointsSchema = z.object({
    pointsToAdd: z
        .number()
        .int({ message: 'Points must be a whole number' })
        .refine((val) => val !== 0, { message: 'Points cannot be zero' }),
    reason: z.string().optional(),
});

type AdjustPointsFormData = z.infer<typeof adjustPointsSchema>;

interface AdjustPointsModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (points: number, reason: string | null) => void;
    isSubmitting: boolean;
    participantName: string;
    currentAdjustment?: number;
}

export const AdjustPointsModal: React.FC<AdjustPointsModalProps> = ({
    open,
    onClose,
    onSubmit,
    isSubmitting,
    participantName,
    currentAdjustment = 0,
}) => {
    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<AdjustPointsFormData>({
        resolver: zodResolver(adjustPointsSchema),
        defaultValues: {
            pointsToAdd: 0,
            reason: '',
        },
    });

    // Reset form when modal opens
    React.useEffect(() => {
        if (open) {
            reset({ pointsToAdd: 0, reason: '' });
        }
    }, [open, reset]);

    const processSubmit = (data: AdjustPointsFormData) => {
        onSubmit(data.pointsToAdd, data.reason || null);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Adjust Points for {participantName}</DialogTitle>
            <form onSubmit={handleSubmit(processSubmit)}>
                <DialogContent>
                    <Typography variant="subtitle2" gutterBottom>
                        Current manual adjustment:{' '}
                        {currentAdjustment > 0 ? '+' : ''}
                        {currentAdjustment} points
                    </Typography>

                    <Controller
                        name="pointsToAdd"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Points to adjust"
                                type="number"
                                fullWidth
                                margin="normal"
                                onChange={(e) =>
                                    field.onChange(
                                        parseInt(e.target.value) || 0
                                    )
                                }
                                helperText={
                                    errors.pointsToAdd?.message ||
                                    'Use positive values to add points, negative to subtract'
                                }
                                error={!!errors.pointsToAdd}
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    inputProps: { min: -1000, max: 1000 },
                                }}
                            />
                        )}
                    />

                    <Controller
                        name="reason"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Reason (optional)"
                                fullWidth
                                margin="normal"
                                multiline
                                rows={3}
                                helperText={errors.reason?.message}
                                error={!!errors.reason}
                            />
                        )}
                    />
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={onClose}
                        color="inherit"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <CircularProgress size={24} />
                        ) : (
                            'Confirm Adjustment'
                        )}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};
