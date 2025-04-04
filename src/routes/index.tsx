import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import page components
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import TripPage from '../pages/TripPage';
import CreateTripPage from '../pages/CreateTripPage';
import ProfilePage from '../pages/ProfilePage';
import NotFoundPage from '../pages/NotFoundPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/trip/:tripId" element={<TripPage />} />
      <Route path="/create-trip" element={<CreateTripPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes; 