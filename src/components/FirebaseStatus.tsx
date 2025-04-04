import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { auth, db, storage } from '../config/firebase';
import { ref, listAll, getDownloadURL } from 'firebase/storage';

/**
 * Component to verify Firebase services are configured correctly
 * This is a development/debugging component and should not be used in production
 */
export default function FirebaseStatus() {
  const [status, setStatus] = useState<{
    auth: 'checking' | 'connected' | 'error';
    firestore: 'checking' | 'connected' | 'error';
    storage: 'checking' | 'connected' | 'error';
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
    switch (currentStatus) {
      case 'checking':
        color = 'text-yellow-500';
        break;
      case 'connected':
        color = 'text-green-500';
        break;
      case 'error':
        color = 'text-red-500';
        break;
    }
    
    return <span className={color}>{currentStatus}</span>;
  };

  return (
    <div className="p-4 bg-gray-100 rounded-md my-2">
      <h3 className="text-lg font-medium mb-2">Firebase Connection Status</h3>
      <div className="space-y-1">
        <p><strong>Authentication:</strong> {renderStatus('auth')}</p>
        <p><strong>Firestore:</strong> {renderStatus('firestore')}</p>
        <p><strong>Storage:</strong> {renderStatus('storage')}</p>
      </div>
      {import.meta.env.DEV && (
        <div className="mt-4 text-xs text-gray-500">
          <p>ProjectID: {import.meta.env.VITE_FIREBASE_PROJECT_ID || 'Not configured'}</p>
        </div>
      )}
    </div>
  );
} 