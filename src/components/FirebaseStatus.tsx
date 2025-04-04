import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { ref, listAll } from 'firebase/storage';
import { auth, db, storage } from '../config/firebase';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';

type ServiceStatus = 'checking' | 'connected' | 'error';

/**
 * Component to verify Firebase services are configured correctly
 * This is a development/debugging component and should not be used in production
 */
export default function FirebaseStatus() {
  const theme = useTheme();
  const [status, setStatus] = useState<{
    auth: ServiceStatus;
    firestore: ServiceStatus;
    storage: ServiceStatus;
  }>({
    auth: 'checking',
    firestore: 'checking',
    storage: 'checking',
  });

  useEffect(() => {
    // Check Auth connection
    const unsubscribe = onAuthStateChanged(
      auth,
      () => setStatus(s => ({ ...s, auth: 'connected' })),
      () => setStatus(s => ({ ...s, auth: 'error' }))
    );

    // Check Firestore connection
    const checkFirestore = async () => {
      try {
        // Just try to connect by listing any collection
        const q = query(collection(db, 'system'), limit(1));
        await getDocs(q);
        setStatus(s => ({ ...s, firestore: 'connected' }));
      } catch (error) {
        console.error('Firestore connection error:', error);
        setStatus(s => ({ ...s, firestore: 'error' }));
      }
    };

    // Check Storage connection
    const checkStorage = async () => {
      try {
        // Try to list items in the root, even if empty
        const rootRef = ref(storage);
        await listAll(rootRef);
        setStatus(s => ({ ...s, storage: 'connected' }));
      } catch (error) {
        console.error('Storage connection error:', error);
        setStatus(s => ({ ...s, storage: 'error' }));
      }
    };

    checkFirestore();
    checkStorage();

    return () => unsubscribe();
  }, []);

  // Helper function to render status with appropriate styling
  const renderStatus = (service: 'auth' | 'firestore' | 'storage') => {
    const currentStatus = status[service];
    
    let color;
    let showProgress = false;
    
    switch (currentStatus) {
      case 'checking':
        color = theme.palette.warning.main;
        showProgress = true;
        break;
      case 'connected':
        color = theme.palette.success.main;
        break;
      case 'error':
        color = theme.palette.error.main;
        break;
    }
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
        {showProgress && <CircularProgress size={14} color="warning" sx={{ mr: 1 }} />}
        <Chip 
          label={currentStatus}
          size="small"
          sx={{ 
            backgroundColor: `${color}20`, // 20% opacity
            color: color,
            fontWeight: 'medium',
          }}
        />
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 3, backgroundColor: theme.palette.grey[50] }}>
      <Typography variant="h6" component="h3" gutterBottom fontWeight="medium">
        Firebase Connection Status
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body1" fontWeight="medium" sx={{ minWidth: 120 }}>
            Authentication:
          </Typography>
          {renderStatus('auth')}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body1" fontWeight="medium" sx={{ minWidth: 120 }}>
            Firestore:
          </Typography>
          {renderStatus('firestore')}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body1" fontWeight="medium" sx={{ minWidth: 120 }}>
            Storage:
          </Typography>
          {renderStatus('storage')}
        </Box>
      </Box>
      {import.meta.env.DEV && (
        <Box sx={{ mt: 2, typography: 'caption', color: 'text.secondary' }}>
          <Typography variant="caption">
            ProjectID: {import.meta.env.VITE_FIREBASE_PROJECT_ID || 'Not configured'}
          </Typography>
        </Box>
      )}
    </Paper>
  );
} 