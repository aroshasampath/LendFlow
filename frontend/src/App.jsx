import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { PageLoader } from './components/PageLoader';

// Lazy-loaded application views for performance optimization & route-based code splitting
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));
const ResponsiveDesignShowcase = lazy(() => import('./pages/ResponsiveDesignShowcase').then((m) => ({ default: m.ResponsiveDesignShowcase })));
const ArchitecturePage = lazy(() => import('./pages/ArchitecturePage').then((m) => ({ default: m.ArchitecturePage })));
const StatusPage = lazy(() => import('./pages/StatusPage').then((m) => ({ default: m.StatusPage })));
const SecuritySettingsPage = lazy(() => import('./pages/SecuritySettingsPage').then((m) => ({ default: m.SecuritySettingsPage })));
const MyProfilePage = lazy(() => import('./pages/MyProfilePage').then((m) => ({ default: m.MyProfilePage })));
const EditProfilePage = lazy(() => import('./pages/EditProfilePage').then((m) => ({ default: m.EditProfilePage })));
const UserSearchPage = lazy(() => import('./pages/UserSearchPage').then((m) => ({ default: m.UserSearchPage })));
const PublicProfilePage = lazy(() => import('./pages/PublicProfilePage').then((m) => ({ default: m.PublicProfilePage })));
const MyLoansPage = lazy(() => import('./pages/MyLoansPage').then((m) => ({ default: m.MyLoansPage })));
const CreateLoanPage = lazy(() => import('./pages/CreateLoanPage').then((m) => ({ default: m.CreateLoanPage })));
const LoanDetailsPage = lazy(() => import('./pages/LoanDetailsPage').then((m) => ({ default: m.LoanDetailsPage })));
const RepaymentsPage = lazy(() => import('./pages/RepaymentsPage').then((m) => ({ default: m.RepaymentsPage })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <MainLayout>
              <Suspense fallback={<PageLoader />}>
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
              </Suspense>
            </MainLayout>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
