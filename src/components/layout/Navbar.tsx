import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { useMutation } from '@tanstack/react-query';

// MUI Components
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  Avatar,
  CircularProgress,
} from '@mui/material';

// MUI Icons
import MenuIcon from '@mui/icons-material/Menu';
import ExploreIcon from '@mui/icons-material/Explore';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

// App imports
import { currentUserAtom, userDataAtom, isAuthLoadingAtom } from '../../store/atoms/authAtoms';
import { signOut } from '../../services/auth';

/**
 * Main navigation bar component
 * Shows different options based on authentication state
 */
export const Navbar = () => {
  const navigate = useNavigate();
  
  // Get authentication state
  const currentUser = useAtomValue(currentUserAtom);
  const userData = useAtomValue(userDataAtom);
  const isAuthLoading = useAtomValue(isAuthLoadingAtom);
  
  // Mobile menu state
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  
  // Handle mobile menu open/close
  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };
  
  // Handle user menu open/close
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  // Handle logout with TanStack Query
  const logoutMutation = useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      // Redirect to home page after logout
      navigate('/');
      handleCloseUserMenu();
    },
  });
  
  // Navigation links for authenticated users
  const authLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <ExploreIcon sx={{ mr: 1 }} /> },
    { name: 'Create Trip', path: '/create-trip', icon: <AddIcon sx={{ mr: 1 }} /> },
  ];
  
  // User menu options for authenticated users
  const userMenuOptions = [
    { name: 'Profile', path: '/profile', icon: <AccountCircleIcon fontSize="small" sx={{ mr: 1 }} /> },
    { name: 'Logout', action: () => logoutMutation.mutate(), icon: <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> },
  ];

  return (
    <AppBar position="static" elevation={1} color="default">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo - Desktop */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <Box
              component="img"
              src="/icon.png"
              alt="TripQuest Logo"
              sx={{
                height: 32,
                width: 32,
                mr: 1,
                borderRadius: 1,
              }}
            />
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 700,
              }}
            >
              TripQuest
            </Typography>
          </Box>

          {/* Mobile Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="navigation menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {/* Mobile Navigation Options */}
              {!isAuthLoading && currentUser
                ? // Authenticated Mobile Links
                  authLinks.map((link) => (
                    <MenuItem 
                      key={link.name} 
                      component={RouterLink}
                      to={link.path}
                      onClick={handleCloseNavMenu}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {link.icon}
                        <Typography textAlign="center">{link.name}</Typography>
                      </Box>
                    </MenuItem>
                  ))
                : // Unauthenticated Mobile Links
                  [
                    <MenuItem
                      key="login"
                      component={RouterLink}
                      to="/login"
                      onClick={handleCloseNavMenu}
                    >
                      <Typography textAlign="center">Login</Typography>
                    </MenuItem>,
                    <MenuItem
                      key="register"
                      component={RouterLink}
                      to="/register"
                      onClick={handleCloseNavMenu}
                    >
                      <Typography textAlign="center">Register</Typography>
                    </MenuItem>,
                  ]}
            </Menu>
          </Box>

          {/* Logo - Mobile */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <Box
              component="img"
              src="/icon.png"
              alt="TripQuest Logo"
              sx={{
                height: 28,
                width: 28,
                mr: 1,
                borderRadius: 1,
              }}
            />
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 700,
              }}
            >
              TripQuest
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {!isAuthLoading && currentUser
              ? // Authenticated Desktop Links
                authLinks.map((link) => (
                  <Button
                    key={link.name}
                    component={RouterLink}
                    to={link.path}
                    onClick={handleCloseNavMenu}
                    sx={{ 
                      my: 2, 
                      display: 'flex', 
                      alignItems: 'center',
                      color: 'inherit', 
                      mx: 1 
                    }}
                  >
                    {link.icon}
                    {link.name}
                  </Button>
                ))
              : // Unauthenticated Desktop Links
                !isAuthLoading && (
                  <>
                    <Button
                      component={RouterLink}
                      to="/login"
                      onClick={handleCloseNavMenu}
                      sx={{ my: 2, color: 'inherit', mx: 1 }}
                    >
                      Login
                    </Button>
                    <Button
                      component={RouterLink}
                      to="/register"
                      variant="outlined"
                      onClick={handleCloseNavMenu}
                      sx={{ my: 2, mx: 1 }}
                    >
                      Register
                    </Button>
                  </>
                )}
          </Box>

          {/* User Menu - Authenticated */}
          {!isAuthLoading && currentUser && (
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar
                    alt={userData?.pseudo || currentUser.email?.split('@')[0] || 'User'}
                    src={userData?.avatarUrl || undefined}
                    sx={{ bgcolor: 'primary.main' }}
                  >
                    {(userData?.pseudo || currentUser.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {/* User info display */}
                <Box sx={{ px: 4, py: 1, minWidth: 200 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {userData?.pseudo || 'User'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {currentUser.email}
                  </Typography>
                </Box>
                <Divider />

                {/* Menu items */}
                {userMenuOptions.map((option) => (
                  <MenuItem
                    key={option.name}
                    onClick={() => {
                      if (option.action) {
                        option.action();
                      } else if (option.path) {
                        navigate(option.path);
                        handleCloseUserMenu();
                      }
                    }}
                    disabled={option.name === 'Logout' && logoutMutation.isPending}
                  >
                    {option.name === 'Logout' && logoutMutation.isPending ? (
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                    ) : (
                      option.icon
                    )}
                    <Typography textAlign="center">{option.name}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          )}

          {/* Auth Loading Indicator */}
          {isAuthLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};
