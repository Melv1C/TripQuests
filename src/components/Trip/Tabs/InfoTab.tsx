import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
    Box,
    Button,
    Divider,
    Grid,
    IconButton,
    Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { TripDocument } from '../../../types/Trip';

interface InfoTabProps {
    trip: TripDocument;
    formatDate: (date: Date) => string;
    handleOpenLeaveDialog: () => void;
}

export const InfoTab: React.FC<InfoTabProps> = ({
    trip,
    formatDate,
    handleOpenLeaveDialog,
}) => {
    const [copySuccess, setCopySuccess] = useState(false);

    const copyInviteCode = () => {
        if (trip?.inviteCode) {
            navigator.clipboard.writeText(trip.inviteCode);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Trip Information
            </Typography>

            <Grid container spacing={2}>
                <Grid size={12}>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Description
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {trip.description}
                    </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Location
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {trip.location}
                    </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Dates
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {formatDate(trip.startDate || new Date())} -{' '}
                        {formatDate(trip.endDate || new Date())}
                    </Typography>
                </Grid>

                <Grid size={12}>
                    <Divider sx={{ my: 2 }} />
                </Grid>

                <Grid size={12}>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Invite Code
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography
                            variant="body1"
                            sx={{ fontFamily: 'monospace', mr: 1 }}
                        >
                            {trip.inviteCode}
                        </Typography>
                        <IconButton
                            onClick={copyInviteCode}
                            color={copySuccess ? 'success' : 'default'}
                            size="small"
                        >
                            <ContentCopyIcon />
                        </IconButton>
                        {copySuccess && (
                            <Typography
                                variant="caption"
                                color="success.main"
                                sx={{ ml: 1 }}
                            >
                                Copied!
                            </Typography>
                        )}
                    </Box>
                </Grid>

                <Grid size={12}>
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Trip Membership
                        </Typography>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleOpenLeaveDialog}
                        >
                            Leave Trip
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};
