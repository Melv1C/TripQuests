import {
    Alert,
    Box,
    Chip,
    CircularProgress,
    List,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { Timestamp } from 'firebase/firestore';
import React from 'react';
import { QuestDocument } from '../../../types/Quest';
import { SubmissionDocument } from '../../../types/Submission';
import { ReviewModal } from '../../Submission/ReviewModal';
import { TripSubmissionListItem } from '../../Submission/TripSubmissionListItem';

interface SubmissionsTabProps {
    allSubmissions: SubmissionDocument[] | undefined;
    isSubmissionsLoading: boolean;
    isSubmissionsError: boolean;
    submissionsError: unknown;
    questsById: Record<string, QuestDocument>;
}

export const SubmissionsTab: React.FC<SubmissionsTabProps> = ({
    allSubmissions,
    isSubmissionsLoading,
    isSubmissionsError,
    submissionsError,
    questsById,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [submissionFilter, setSubmissionFilter] = React.useState<
        'all' | 'pending' | 'approved' | 'rejected'
    >('all');

    // Add state for review modal
    const [isReviewModalOpen, setIsReviewModalOpen] = React.useState(false);
    const [selectedSubmissionForReview, setSelectedSubmissionForReview] =
        React.useState<SubmissionDocument | null>(null);

    // Filter submissions based on selected filter
    const filteredSubmissions = React.useMemo(() => {
        if (!allSubmissions) return [];

        switch (submissionFilter) {
            case 'pending':
                return allSubmissions.filter((sub) => sub.status === 'pending');
            case 'approved':
                return allSubmissions.filter(
                    (sub) => sub.status === 'approved'
                );
            case 'rejected':
                return allSubmissions.filter(
                    (sub) => sub.status === 'rejected'
                );
            case 'all':
            default:
                return allSubmissions;
        }
    }, [allSubmissions, submissionFilter]);

    // Get counts for each submission status
    const approvedCount = React.useMemo(() => {
        return (
            allSubmissions?.filter((sub) => sub.status === 'approved').length ||
            0
        );
    }, [allSubmissions]);

    const pendingCount = React.useMemo(() => {
        return (
            allSubmissions?.filter((sub) => sub.status === 'pending').length ||
            0
        );
    }, [allSubmissions]);

    const rejectedCount = React.useMemo(() => {
        return (
            allSubmissions?.filter((sub) => sub.status === 'rejected').length ||
            0
        );
    }, [allSubmissions]);

    // Add handler functions for the review modal
    const handleOpenReviewModal = (submission: SubmissionDocument) => {
        setSelectedSubmissionForReview(submission);
        setIsReviewModalOpen(true);
    };

    const handleCloseReviewModal = () => {
        setIsReviewModalOpen(false);
        setSelectedSubmissionForReview(null);
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Submissions
            </Typography>

            {isSubmissionsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : isSubmissionsError ? (
                <Alert severity="error" sx={{ my: 2 }}>
                    Error loading submissions:{' '}
                    {submissionsError instanceof Error
                        ? submissionsError.message
                        : 'Unknown error'}
                </Alert>
            ) : allSubmissions && allSubmissions.length > 0 ? (
                <>
                    {/* Submission status filter chips */}
                    <Box
                        sx={{
                            mb: 2,
                            display: 'flex',
                            gap: 0.5,
                            flexWrap: 'wrap',
                            justifyContent: isMobile ? 'center' : 'flex-start',
                        }}
                    >
                        <Chip
                            label={`All (${allSubmissions.length})`}
                            color="primary"
                            variant={
                                submissionFilter === 'all'
                                    ? 'filled'
                                    : 'outlined'
                            }
                            onClick={() => setSubmissionFilter('all')}
                            sx={{
                                fontSize: isMobile ? '0.7rem' : '0.8rem',
                                height: isMobile ? '28px' : '32px',
                                mb: 0.5,
                                '& .MuiChip-label': {
                                    px: isMobile ? 1 : 1.5,
                                },
                            }}
                        />
                        <Chip
                            label={`Pending (${pendingCount})`}
                            color="default"
                            variant={
                                submissionFilter === 'pending'
                                    ? 'filled'
                                    : 'outlined'
                            }
                            onClick={() => setSubmissionFilter('pending')}
                            sx={{
                                fontSize: isMobile ? '0.7rem' : '0.8rem',
                                height: isMobile ? '28px' : '32px',
                                mb: 0.5,
                                '& .MuiChip-label': {
                                    px: isMobile ? 1 : 1.5,
                                },
                            }}
                        />
                        <Chip
                            label={`Approved (${approvedCount})`}
                            color="success"
                            variant={
                                submissionFilter === 'approved'
                                    ? 'filled'
                                    : 'outlined'
                            }
                            onClick={() => setSubmissionFilter('approved')}
                            sx={{
                                fontSize: isMobile ? '0.7rem' : '0.8rem',
                                height: isMobile ? '28px' : '32px',
                                mb: 0.5,
                                '& .MuiChip-label': {
                                    px: isMobile ? 1 : 1.5,
                                },
                            }}
                        />
                        <Chip
                            label={`Rejected (${rejectedCount})`}
                            color="error"
                            variant={
                                submissionFilter === 'rejected'
                                    ? 'filled'
                                    : 'outlined'
                            }
                            onClick={() => setSubmissionFilter('rejected')}
                            sx={{
                                fontSize: isMobile ? '0.7rem' : '0.8rem',
                                height: isMobile ? '28px' : '32px',
                                mb: 0.5,
                                '& .MuiChip-label': {
                                    px: isMobile ? 1 : 1.5,
                                },
                            }}
                        />
                    </Box>

                    <List>
                        {filteredSubmissions
                            .sort((a, b) => {
                                // Sort by submission date (newest first)
                                const dateA =
                                    a.submittedAt instanceof Timestamp
                                        ? a.submittedAt.toDate().getTime()
                                        : a.submittedAt?.getTime() || 0;
                                const dateB =
                                    b.submittedAt instanceof Timestamp
                                        ? b.submittedAt.toDate().getTime()
                                        : b.submittedAt?.getTime() || 0;
                                return dateB - dateA;
                            })
                            .map((submission) => {
                                const quest =
                                    submission.questId &&
                                    questsById[submission.questId];

                                if (!quest) {
                                    return null; // Skip if quest not found
                                }

                                return (
                                    <TripSubmissionListItem
                                        key={submission.id}
                                        submission={submission}
                                        questTitle={quest.title}
                                        questPoints={quest.points}
                                        onClick={
                                            submission.status === 'pending'
                                                ? () =>
                                                      handleOpenReviewModal(
                                                          submission
                                                      )
                                                : undefined
                                        }
                                    />
                                );
                            })}
                    </List>
                </>
            ) : (
                <Typography variant="body1">No submissions found.</Typography>
            )}

            {/* Review Modal */}
            <ReviewModal
                open={isReviewModalOpen}
                onClose={handleCloseReviewModal}
                submission={selectedSubmissionForReview}
                quest={
                    selectedSubmissionForReview?.questId
                        ? questsById[selectedSubmissionForReview.questId]
                        : null
                }
            />
        </Box>
    );
};
