import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import PredictionPage from './pages/PredictionPage';
import DiseaseUpdatesPage from './pages/DiseaseUpdatesPage';
import CommunityPage from './pages/CommunityPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout';
import ChatbotWidget from './components/ChatbotWidget';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'var(--bg-base)'
    }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function ToastConfig() {
  const { isDark } = useTheme();
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: isDark ? '#111e35' : '#ffffff',
          color: isDark ? '#e8f4fc' : '#0f172a',
          border: `1px solid ${isDark ? 'rgba(46,232,200,0.2)' : 'rgba(8,145,178,0.2)'}`,
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 14,
          borderRadius: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        },
        success: { iconTheme: { primary: '#34d399', secondary: isDark ? '#111e35' : '#fff' } },
        error:   { iconTheme: { primary: '#f87171', secondary: isDark ? '#111e35' : '#fff' } },
      }}
    />
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      <div className="mesh-bg" />
      <Routes>
        <Route path="/login"  element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <SignupPage />} />
        <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/predict"   element={<PredictionPage />} />
          <Route path="/updates"   element={<DiseaseUpdatesPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/settings"  element={<SettingsPage />} />
        </Route>
      </Routes>
      {user && <ChatbotWidget />}
      <ToastConfig />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}