import { atom } from 'jotai';

export type NotificationSeverity = 'success' | 'info' | 'warning' | 'error';

export interface NotificationState {
  open: boolean;
  message: string;
  severity: NotificationSeverity;
  autoHideDuration?: number;
}

// Default state - notification is closed by default
const initialState: NotificationState = {
  open: false,
  message: '',
  severity: 'info',
  autoHideDuration: 6000, // 6 seconds by default
};

// Notification atom
export const notificationAtom = atom<NotificationState>(initialState);

// Action to show a notification
export const showNotification = atom(
  null, // read value - not needed for this action
  (_get, set, update: Omit<NotificationState, 'open'>) => {
    set(notificationAtom, {
      ...update,
      open: true,
    });
  }
);

// Action to hide the notification
export const hideNotification = atom(
  null, // read value - not needed for this action
  (get, set) => {
    set(notificationAtom, {
      ...get(notificationAtom),
      open: false,
    });
  }
); 