import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout.jsx';
import AdminLayout from '../components/layout/AdminLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import AdminRoute from './AdminRoute.jsx';

import HomePage from '../pages/HomePage.jsx';
import CentreDetailsPage from '../pages/CentreDetailsPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import SignupPage from '../pages/SignupPage.jsx';
import VerifyEmailPage from '../pages/VerifyEmailPage.jsx';
import BookingPage from '../pages/BookingPage.jsx';
import PaymentPage from '../pages/PaymentPage.jsx';
import BookingSuccessPage from '../pages/BookingSuccessPage.jsx';
import BookingFailedPage from '../pages/BookingFailedPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import BookingDetailsPage from '../pages/BookingDetailsPage.jsx';
import AdminDashboardPage from '../pages/AdminDashboardPage.jsx';
import AdminCentresPage from '../pages/AdminCentresPage.jsx';
import AdminTestsPage from '../pages/AdminTestsPage.jsx';
import AdminLogsPage from '../pages/AdminLogsPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/centres/:centreId" element={<CentreDetailsPage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/payment/:bookingId" element={<PaymentPage />} />
          <Route path="/booking/success/:bookingId" element={<BookingSuccessPage />} />
          <Route path="/booking/failed/:bookingId" element={<BookingFailedPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/bookings/:bookingId" element={<BookingDetailsPage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/centres" element={<AdminCentresPage />} />
            <Route path="/admin/tests" element={<AdminTestsPage />} />
            <Route path="/admin/logs" element={<AdminLogsPage />} />
          </Route>
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
