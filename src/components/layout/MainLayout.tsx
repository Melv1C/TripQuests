import { ReactNode } from 'react';
import { Box, Container } from '@mui/material';
import Navbar from './Navbar';

interface MainLayoutProps {
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  withContainer?: boolean;
}

/**
 * Main layout component that includes the Navbar and page content
 * @param children Page content to render
 * @param maxWidth Optional MUI Container maxWidth prop (default: 'lg')
 * @param withContainer Whether to wrap content in a Container (default: true)
 */
const MainLayout = ({ 
  children, 
  maxWidth = 'lg',
  withContainer = true 
}: MainLayoutProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navigation bar */}
      <Navbar />
      
      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        {withContainer ? (
          <Container maxWidth={maxWidth}>
            {children}
          </Container>
        ) : (
          children
        )}
      </Box>
    </Box>
  );
};

export default MainLayout; 