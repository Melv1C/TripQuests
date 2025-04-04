import { useLocation } from 'react-router-dom';
import NotificationAlert from './components/NotificationAlert';
import AuthListener from './components/AuthListener';
import MainLayout from './components/layout/MainLayout';
import AppRoutes from './routes';

function App() {
  // Get the current route to potentially customize layout
  const location = useLocation();
  const path = location.pathname;
  
  // Determine if we should use the layout based on the route
  // Currently including layout on all routes, but this can be customized
  const useMainLayout = true;

  return (
    <>
      {/* Auth state listener component */}
      <AuthListener />
      
      {/* Global notification component */}
      <NotificationAlert />
      
      {/* Main content with layout */}
      {useMainLayout ? (
        <MainLayout>
          <AppRoutes />
        </MainLayout>
      ) : (
        <AppRoutes />
      )}
      
    </>
  );
}

export default App;
