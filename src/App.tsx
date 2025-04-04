import NotificationAlert from './components/NotificationAlert';
import AuthListener from './components/AuthListener';
import MainLayout from './components/layout/MainLayout';
import AppRoutes from './routes';

function App() {
  // Currently including layout on all routes
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
