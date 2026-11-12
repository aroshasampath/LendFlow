import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { StatusPage } from './pages/StatusPage';
import { ResponsiveDesignShowcase } from './pages/ResponsiveDesignShowcase';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { SecuritySettingsPage } from './pages/SecuritySettingsPage';
import { MyProfilePage } from './pages/MyProfilePage';
import { EditProfilePage } from './pages/EditProfilePage';
import { UserSearchPage } from './pages/UserSearchPage';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { MyLoansPage } from './pages/MyLoansPage';
import { CreateLoanPage } from './pages/CreateLoanPage';
import { LoanDetailsPage } from './pages/LoanDetailsPage';
import { RepaymentsPage } from './pages/RepaymentsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { NotificationProvider } from './context/NotificationContext';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <MainLayout>
            <Routes>
            {/* Public Pages */}
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/responsive-qa" element={<ResponsiveDesignShowcase />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="/status" element={<StatusPage />} />

            {/* Protected Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <MyProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <ProtectedRoute>
                  <EditProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/search"
              element={
                <ProtectedRoute>
                  <UserSearchPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/:identifier"
              element={
                <ProtectedRoute>
                  <PublicProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/loans"
              element={
                <ProtectedRoute>
                  <MyLoansPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/loans/create"
              element={
                <ProtectedRoute>
                  <CreateLoanPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/loans/:id"
              element={
                <ProtectedRoute>
                  <LoanDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/repayments"
              element={
                <ProtectedRoute>
                  <RepaymentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/security-settings"
              element={
                <ProtectedRoute>
                  <SecuritySettingsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MainLayout>
      </NotificationProvider>
    </AuthProvider>
  </BrowserRouter>
  );
}
