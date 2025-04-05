import {
    Alert,
    Avatar,
    Box,
    Button,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import React from 'react';
import { ParticipantData } from '../../../types/Trip';

interface AdminTabProps {
    participants: ParticipantData[] | undefined;
    isParticipantsLoading: boolean;
    isParticipantsError: boolean;
    participantsError: unknown;
    handleOpenAdjustPointsModal: (participant: ParticipantData) => void;
}

export const AdminTab: React.FC<AdminTabProps> = ({
    participants,
    isParticipantsLoading,
    isParticipantsError,
    participantsError,
    handleOpenAdjustPointsModal,
}) => {
    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Trip Administration
            </Typography>

            <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>
                Participant Management
            </Typography>

            {isParticipantsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <CircularProgress size={24} />
                </Box>
            ) : isParticipantsError ? (
                <Alert severity="error" sx={{ my: 2 }}>
                    Error loading participants:{' '}
                    {participantsError instanceof Error
                        ? participantsError.message
                        : 'Unknown error'}
                </Alert>
            ) : participants && participants.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Participant</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell align="right">
                                    Manual Point Adjustment
                                </TableCell>
                                <TableCell>Last Adjustment Reason</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {participants.map((participant) => (
                                <TableRow key={participant.id}>
                                    <TableCell>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Avatar
                                                src={
                                                    participant.avatarUrl ||
                                                    undefined
                                                }
                                                alt={participant.pseudo}
                                                sx={{
                                                    mr: 1,
                                                    width: 30,
                                                    height: 30,
                                                }}
                                            >
                                                {participant.pseudo
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </Avatar>
                                            <Typography>
                                                {participant.pseudo}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{participant.role}</TableCell>
                                    <TableCell align="right">
                                        {(participant.manualPointsAdjustment ||
                                            0) > 0 && '+'}
                                        {participant.manualPointsAdjustment ||
                                            0}
                                    </TableCell>
                                    <TableCell>
                                        {participant.lastAdjustmentReason ||
                                            '-'}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() =>
                                                handleOpenAdjustPointsModal(
                                                    participant
                                                )
                                            }
                                        >
                                            Adjust Points
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography variant="body1">No participants found.</Typography>
            )}
        </Box>
    );
};
