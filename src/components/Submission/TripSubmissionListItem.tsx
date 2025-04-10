import {
    Avatar,
    Box,
    Chip,
    Grid,
    Paper,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import React from 'react';
import { SubmissionDocument } from '../../types/Submission';

type TripSubmissionListItemProps = {
    submission: SubmissionDocument;
    questTitle: string;
    questPoints: number;
    onClick?: () => void; // Add onClick prop
};

/**
 * A list item component that displays a summary of a submission (pending, approved, or rejected)
 */
export function TripSubmissionListItem(props: TripSubmissionListItemProps) {
    const { submission, questTitle, questPoints, onClick } = props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Format the submitted time in a relative format (e.g., "2 hours ago")
    const formattedTime = React.useMemo(() => {
        if (!submission.submittedAt) return 'recently';

        try {
            // Check if it's a Firestore Timestamp and convert accordingly
            if (submission.submittedAt instanceof Timestamp) {
                return formatDistanceToNow(submission.submittedAt.toDate(), {
                    addSuffix: true,
                });
            }
            // Handle regular Date objects
            else if (submission.submittedAt instanceof Date) {
                return formatDistanceToNow(submission.submittedAt, {
                    addSuffix: true,
                });
            }
            // Handle string or number timestamps by converting to Date
            return formatDistanceToNow(new Date(submission.submittedAt), {
                addSuffix: true,
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'recently';
        }
    }, [submission.submittedAt]);

    // Format review time if it exists
    const formattedReviewTime = React.useMemo(() => {
        if (!submission.reviewedAt) return null;

        try {
            // Check if it's a Firestore Timestamp and convert accordingly
            if (submission.reviewedAt instanceof Timestamp) {
                return formatDistanceToNow(submission.reviewedAt.toDate(), {
                    addSuffix: true,
                });
            }
            // Handle regular Date objects
            else if (submission.reviewedAt instanceof Date) {
                return formatDistanceToNow(submission.reviewedAt, {
                    addSuffix: true,
                });
            }
            // Handle string or number timestamps by converting to Date
            return formatDistanceToNow(new Date(submission.reviewedAt), {
                addSuffix: true,
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return null;
        }
    }, [submission.reviewedAt]);

    // Determine chip color and label based on status
    const getStatusChip = () => {
        switch (submission.status) {
            case 'approved':
                return (
                    <Chip
                        label="Approved"
                        color="success"
                        size="small"
                        sx={{ minWidth: 80, fontSize: '0.75rem' }}
                    />
                );
            case 'rejected':
                return (
                    <Chip
                        label="Rejected"
                        color="error"
                        size="small"
                        sx={{ minWidth: 80, fontSize: '0.75rem' }}
                    />
                );
            case 'pending':
            default:
                return (
                    <Chip
                        label="Pending"
                        color="default"
                        size="small"
                        sx={{ minWidth: 80, fontSize: '0.75rem' }}
                    />
                );
        }
    };

    return (
        <Paper
            variant="outlined"
            sx={{
                mb: 1,
                overflow: 'hidden',
                cursor: onClick ? 'pointer' : 'default', // Change cursor when clickable
                '&:hover': onClick
                    ? {
                          backgroundColor: 'action.hover',
                          boxShadow: 1,
                      }
                    : {},
            }}
            onClick={onClick} // Add the onClick handler
        >
            <Box sx={{ p: 2 }}>
                <Grid container spacing={2} alignItems="flex-start">
                    {/* Left section with quest info */}
                    <Grid
                        size={{
                            xs: 12,
                            sm: submission.evidence.imageUrl ? 8 : 12,
                        }}
                    >
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            {/* Top row with quest title and status */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: isMobile ? 'column' : 'row',
                                    justifyContent: 'space-between',
                                    alignItems: isMobile
                                        ? 'flex-start'
                                        : 'center',
                                    mb: 1,
                                }}
                            >
                                <Typography
                                    variant="subtitle1"
                                    component="div"
                                    sx={{
                                        fontWeight: 'medium',
                                        mr: 1,
                                        mb: isMobile ? 1 : 0,
                                    }}
                                >
                                    {questTitle}
                                </Typography>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 1,
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    {getStatusChip()}
                                    {submission.status === 'approved' && (
                                        <Chip
                                            label={`${submission.pointsAwarded} pts`}
                                            color="primary"
                                            size="small"
                                            sx={{ fontSize: '0.75rem' }}
                                        />
                                    )}
                                    {submission.status !== 'approved' && (
                                        <Chip
                                            label={`${questPoints} pts`}
                                            variant="outlined"
                                            size="small"
                                            sx={{ fontSize: '0.75rem' }}
                                        />
                                    )}
                                </Box>
                            </Box>

                            {/* Bottom row with submission info */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mt: 1,
                                }}
                            >
                                <Avatar sx={{ width: 28, height: 28, mr: 1 }}>
                                    {submission.submitterPseudo
                                        .charAt(0)
                                        .toUpperCase()}
                                </Avatar>
                                <Box>
                                    <Typography
                                        variant="body2"
                                        sx={{ fontWeight: 'medium' }}
                                    >
                                        By: {submission.submitterPseudo}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        display="block"
                                    >
                                        Submitted {formattedTime}
                                    </Typography>
                                    {submission.status !== 'pending' &&
                                        formattedReviewTime && (
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                display="block"
                                            >
                                                Reviewed {formattedReviewTime}
                                            </Typography>
                                        )}
                                </Box>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Right section with evidence image */}
                    {submission.evidence.imageUrl && (
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Box
                                component="img"
                                src={submission.evidence.imageUrl}
                                alt="Submission evidence"
                                sx={{
                                    width: '100%',
                                    height: isMobile ? '120px' : '100px',
                                    objectFit: 'cover',
                                    borderRadius: 1,
                                    mt: isMobile ? 1 : 0,
                                }}
                            />
                        </Grid>
                    )}
                </Grid>
            </Box>
        </Paper>
    );
}
