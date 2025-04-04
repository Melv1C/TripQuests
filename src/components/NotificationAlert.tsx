import { useState, useEffect } from 'react';
import { Alert, AlertProps, Snackbar } from '@mui/material';
import { useLocation } from 'react-router-dom';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationData {
  type: NotificationType;
  message: string;
  autoHideDuration?: number;
}

interface NotificationAlertProps {
  notification?: NotificationData | null;
  onClose?: () => void;
}

/**
 * A reusable notification component that displays alerts based on route state or props
 */
const NotificationAlert = ({ notification: propNotification, onClose: propOnClose }: NotificationAlertProps) => {
  const location = useLocation();
  const [notification, setNotification] = useState<NotificationData | null>(propNotification || null);
  
  // Extract notification from location state if available
  useEffect(() => {
    const locationNotification = location.state?.notification as NotificationData | undefined;
    
    if (locationNotification) {
      setNotification(locationNotification);
      // Clear the notification from location state to prevent showing it again
      history.replaceState(
        { ...history.state, state: { ...location.state, notification: undefined } },
        '',
        location.pathname
      );
    } else if (propNotification) {
      setNotification(propNotification);
    }
  }, [location, propNotification]);
  
  // Handle notification close
  const handleClose = () => {
    setNotification(null);
    if (propOnClose) {
      propOnClose();
    }
  };
  
  if (!notification) {
    return null;
  }
  
  // Map notification type to AlertProps severity
  const severity: AlertProps['severity'] = notification.type;
  
  return (
    <Snackbar
      open={!!notification}
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