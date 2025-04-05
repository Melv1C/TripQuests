import {
    Alert,
    Avatar,
    Box,
    Chip,
    CircularProgress,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography,
} from '@mui/material';
import React from 'react';
import { ParticipantData } from '../../../types/Trip';

interface MembersTabProps {
    participants: ParticipantData[] | undefined;
    isParticipantsLoading: boolean;
    isParticipantsError: boolean;
    participantsError: unknown;
    formatDate: (date: Date) => string;
}

export const MembersTab: React.FC<MembersTabProps> = ({
    participants,
    isParticipantsLoading,
    isParticipantsError,
    participantsError,
    formatDate,
}) => {
    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Trip Members
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
                <List>
                    {participants.map((participant) => (
                        <ListItem key={participant.id}>
                            <ListItemAvatar>
                                <Avatar
                                    src={participant.avatarUrl || undefined}
                                    alt={participant.pseudo}
                                >
                                    {participant.pseudo.charAt(0).toUpperCase()}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={participant.pseudo}
                                secondary={formatDate(
                                    participant.joinedAt || new Date()
                                )}
                            />
                            <Chip
                                label={participant.role}
                                color={
                                    participant.role === 'organizer'
                                        ? 'primary'
                                        : 'default'
                                }
                                size="small"
                            />
                        </ListItem>
                    ))}
                </List>
            ) : (
                <Typography variant="body1">No participants found.</Typography>
            )}
        </Box>
    );
};
