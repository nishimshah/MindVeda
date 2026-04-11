import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import BrainTraining from './pages/BrainTraining';
import SupportChat from './pages/SupportChat';
import AiChat from './pages/AiChat';
import Progress from './pages/Progress';
import CalmZone from './pages/CalmZone';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import MoodPage from './pages/MoodPage';
import GoalsPage from './pages/GoalsPage';
import AssessmentsPage from './pages/AssessmentsPage';
import QuestionnaireFlow from './pages/QuestionnaireFlow';

import { useLocation } from 'react-router-dom';

function AppRoutes() {
  const location = useLocation();
  const hideNavbarOn = ['/', '/login', '/signup'];
  const shouldShowNavbar = !hideNavbarOn.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/train" element={<ProtectedRoute><BrainTraining /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><SupportChat /></ProtectedRoute>} />
        <Route path="/ai-chat" element={<ProtectedRoute><AiChat /></ProtectedRoute>} />
        <Route path="/chat/therapist/:patientId" element={<ProtectedRoute><SupportChat /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
        <Route path="/calm" element={<ProtectedRoute><CalmZone /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="/mood" element={<ProtectedRoute><MoodPage /></ProtectedRoute>} />
        <Route path="/goals" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
        <Route path="/assessments" element={<ProtectedRoute><AssessmentsPage /></ProtectedRoute>} />
        <Route path="/questionnaire" element={<ProtectedRoute><QuestionnaireFlow /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

import { ThemeProvider } from './contexts/ThemeContext';
import FloatingAiChat from './components/FloatingAiChat';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AccessibilityProvider>
          <ThemeProvider>
            <AppRoutes />
            <FloatingAiChat />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: 'var(--bg-surface-2)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-base)',
                  borderRadius: '12px',
                },
              }}
            />
          </ThemeProvider>
        </AccessibilityProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
