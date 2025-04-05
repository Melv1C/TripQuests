import AddIcon from '@mui/icons-material/Add';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    Divider,
    Fab,
    Grid,
    List,
    Typography,
} from '@mui/material';
import React from 'react';
import { QuestDocument } from '../../../types/Quest';
import { SubmissionDocument } from '../../../types/Submission';
import { CreateQuestForm } from '../../Quest/CreateQuestForm';
import { QuestCard } from '../../Quest/QuestCard';
import { QuestDetailsModal } from '../../Quest/QuestDetailsModal';
import { PendingSubmissionListItem } from '../../Submission/PendingSubmissionListItem';
import { ReviewModal } from '../../Submission/ReviewModal';

interface QuestsTabProps {
    tripId: string;
    quests: QuestDocument[] | undefined;
    isQuestsLoading: boolean;
    isQuestsError: boolean;
    questsError: unknown;
    submissionsToReview: SubmissionDocument[];
    questsById: Record<string, QuestDocument>;
    isSubmissionsLoading: boolean;
    isSubmissionsError: boolean;
    submissionsError: unknown;
}

export const QuestsTab: React.FC<QuestsTabProps> = ({
    tripId,
    quests,
    isQuestsLoading,
    isQuestsError,
    questsError,
    submissionsToReview,
    questsById,
    isSubmissionsLoading,
    isSubmissionsError,
    submissionsError,
}) => {
    const [createQuestDialogOpen, setCreateQuestDialogOpen] =
        React.useState(false);
    const [selectedQuest, setSelectedQuest] =
        React.useState<QuestDocument | null>(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = React.useState(false);
    const [selectedSubmissionForReview, setSelectedSubmissionForReview] =
        React.useState<SubmissionDocument | null>(null);

    const handleOpenCreateQuestDialog = () => {
        setCreateQuestDialogOpen(true);
    };

    const handleCloseCreateQuestDialog = () => {
        setCreateQuestDialogOpen(false);
    };

    const handleQuestClick = (quest: QuestDocument) => {
        setSelectedQuest(quest);
    };

    const handleCloseQuestDetails = () => {
        setSelectedQuest(null);
    };

    const handleOpenReviewModal = (submission: SubmissionDocument) => {
        setSelectedSubmissionForReview(submission);
        setIsReviewModalOpen(true);
    };

    const handleCloseReviewModal = () => {
        setIsReviewModalOpen(false);
        setSelectedSubmissionForReview(null);
    };

    return (
        <Box sx={{ position: 'relative' }}>
            <Typography variant="h6" gutterBottom>
                Quests
            </Typography>

            {isQuestsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : isQuestsError ? (
                <Alert severity="error" sx={{ my: 2 }}>
                    Error loading quests:{' '}
                    {questsError instanceof Error
                        ? questsError.message
                        : 'Unknown error'}
                </Alert>
            ) : quests && quests.length > 0 ? (
                <Grid container spacing={2}>
                    {quests.map((quest) => (
                        <Grid key={quest.id} size={{ xs: 12, sm: 6, md: 4 }}>
                            <QuestCard
                                quest={quest}
                                onClick={() =>
                                    quest.id && handleQuestClick(quest)
                                }
                            />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Box sx={{ my: 4, textAlign: 'center' }}>
                    <Typography variant="body1" gutterBottom>
                        No quests created yet. Be the first!
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenCreateQuestDialog}
                        sx={{ mt: 2 }}
                    >
                        Create Your First Quest
                    </Button>
                </Box>
            )}

            {/* Pending Submissions for Review Section */}
            {submissionsToReview && submissionsToReview.length > 0 && (
                <Box sx={{ mt: 4 }}>
                    <Divider sx={{ mb: 3 }} />
                    <Typography variant="h6" gutterBottom>
                        Pending Submissions for Review
                    </Typography>

                    <List disablePadding>
                        {submissionsToReview.map((submission) => {
                            const quest =
                                submission.questId &&
                                questsById[submission.questId];

                            if (!quest) {
                                return null; // Skip if quest not found
                            }

                            return (
                                <PendingSubmissionListItem
                                    key={submission.id}
                                    submission={submission}
                                    questTitle={quest.title}
                                    questPoints={quest.points}
                                    onClick={() =>
                                        handleOpenReviewModal(submission)
                                    }
                                />
                            );
                        })}
                    </List>
                </Box>
            )}

            {isSubmissionsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <CircularProgress size={24} />
                </Box>
            ) : (
                !isSubmissionsError &&
                submissionsToReview &&
                submissionsToReview.length === 0 && (
                    <Box sx={{ mt: 4 }}>
                        <Divider sx={{ mb: 3 }} />
                        <Typography variant="h6" gutterBottom>
                            Pending Submissions for Review
                        </Typography>
                        <Box sx={{ textAlign: 'center', py: 3 }}>
                            <Typography variant="body1" color="text.secondary">
                                No pending submissions to review at this time.
                            </Typography>
                        </Box>
                    </Box>
                )
            )}

            {isSubmissionsError && (
                <Box sx={{ mt: 4 }}>
                    <Alert severity="error" sx={{ my: 2 }}>
                        Error loading submissions:{' '}
                        {submissionsError instanceof Error
                            ? submissionsError.message
                            : 'Unknown error'}
                    </Alert>
                </Box>
            )}

            {/* Floating action button to create a new quest */}
            {quests && quests.length > 0 && (
                <Fab
                    color="primary"
                    aria-label="add quest"
                    onClick={handleOpenCreateQuestDialog}
                    sx={{ position: 'fixed', bottom: 24, right: 24 }}
                >
                    <AddIcon />
                </Fab>
            )}

            {/* Create Quest Dialog */}
            <Dialog
                open={createQuestDialogOpen}
                onClose={handleCloseCreateQuestDialog}
                maxWidth="sm"
                fullWidth
            >
                <Box sx={{ p: 3 }}>
                    <CreateQuestForm
                        tripId={tripId || ''}
                        onClose={handleCloseCreateQuestDialog}
                    />
                </Box>
            </Dialog>

            {/* Quest Details Modal */}
            {selectedQuest && (
                <QuestDetailsModal
                    quest={selectedQuest}
                    open={!!selectedQuest}
                    onClose={handleCloseQuestDetails}
                />
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
