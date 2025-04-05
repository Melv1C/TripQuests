import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import React from 'react';
import { LeaderboardEntry } from '../../../types/Trip';
import { LeaderboardTable } from '../../Trip/LeaderboardTable';

interface LeaderboardTabProps {
    leaderboardData: LeaderboardEntry[];
    isParticipantsLoading: boolean;
    isSubmissionsLoading: boolean;
    isParticipantsError: boolean;
    isSubmissionsError: boolean;
    participantsError: unknown;
    submissionsError: unknown;
}

export const LeaderboardTab: React.FC<LeaderboardTabProps> = ({
    leaderboardData,
    isParticipantsLoading,
    isSubmissionsLoading,
    isParticipantsError,
    isSubmissionsError,
    participantsError,
    submissionsError,
}) => {
    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Leaderboard
            </Typography>

            {isParticipantsLoading || isSubmissionsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : isParticipantsError || isSubmissionsError ? (
                <Alert severity="error" sx={{ my: 2 }}>
                    Error loading leaderboard data:{' '}
                    {isParticipantsError && participantsError instanceof Error
                        ? participantsError.message
                        : isSubmissionsError &&
                          submissionsError instanceof Error
                        ? submissionsError.message
                        : 'Unknown error'}
                </Alert>
            ) : (
                <LeaderboardTable leaderboardData={leaderboardData} />
            )}
        </Box>
    );
};
