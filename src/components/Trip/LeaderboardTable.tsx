import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Typography,
  Box
} from '@mui/material';
import { LeaderboardEntry } from '../../types/Trip';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

interface LeaderboardTableProps {
  leaderboardData: LeaderboardEntry[];
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ leaderboardData }) => {
  // Function to render rank with medal for top 3
  const renderRank = (rank: number) => {
    if (rank === 1) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EmojiEventsIcon sx={{ color: '#FFD700', mr: 1 }} />
          <Typography variant="body1" fontWeight="bold">1st</Typography>
        </Box>
      );
    } else if (rank === 2) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EmojiEventsIcon sx={{ color: '#C0C0C0', mr: 1 }} />
          <Typography variant="body1" fontWeight="bold">2nd</Typography>
        </Box>
      );
    } else if (rank === 3) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EmojiEventsIcon sx={{ color: '#CD7F32', mr: 1 }} />
          <Typography variant="body1" fontWeight="bold">3rd</Typography>
        </Box>
      );
    }
    return <Typography variant="body1">{rank}th</Typography>;
  };

  return (
    <TableContainer component={Paper} elevation={0}>
      <Table aria-label="leaderboard table">
        <TableHead>
          <TableRow>
            <TableCell align="center" sx={{ width: '100px', minWidth: '100px' }}>Rank</TableCell>
            <TableCell>Player</TableCell>
            <TableCell align="right">Points</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {leaderboardData.map((entry) => (
            <TableRow
              key={entry.userId}
              sx={{
                '&:last-child td, &:last-child th': { border: 0 },
                backgroundColor: entry.rank <= 3 ? 'rgba(0, 0, 0, 0.04)' : 'inherit'
              }}
            >
              <TableCell align="center" sx={{ width: '100px', minWidth: '100px' }}>
                {renderRank(entry.rank)}
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    src={entry.avatarUrl || undefined} 
                    alt={entry.pseudo}
                    sx={{ mr: 2 }}
                  >
                    {entry.pseudo.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="body1">{entry.pseudo}</Typography>
                </Box>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body1" fontWeight="bold">
                  {entry.totalPoints} pts
                </Typography>
              </TableCell>
            </TableRow>
          ))}
          
          {leaderboardData.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No scores on the board yet!
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Complete quests and get your submissions approved to earn points.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}; 