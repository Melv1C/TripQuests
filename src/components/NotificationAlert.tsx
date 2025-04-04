import { Alert, AlertProps, Snackbar } from '@mui/material';
import { useAtom } from 'jotai';
import { notificationAtom, hideNotification } from '../store/atoms/notificationAtom';

/**
 * A reusable notification component that displays alerts based on the global notification atom
 */
const NotificationAlert = () => {
  const [notification, setNotification] = useAtom(notificationAtom);
  
  // Handle notification close
  const handleClose = () => {
    setNotification({ ...notification, open: false });
  };
  
  // Map notification severity to AlertProps severity
  const severity: AlertProps['severity'] = notification.severity;
  
  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={notification.autoHideDuration || 6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert 
        onClose={handleClose} 
        severity={severity} 
        variant="filled"
        sx={{ width: '100%' }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationAlert; 