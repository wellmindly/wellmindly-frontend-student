import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/Login';
import { LandingPage } from './pages/LandingPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { DiscoverPage } from './pages/DiscoverPage';

function DiscoverRoute() {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/dashboard?tab=discover" replace />;
  }
  return <DiscoverPage />;
}

function LoginRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9F7]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-plum"></div>
      </div>
    );
  }
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <LoginPage />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/discover" element={<DiscoverRoute />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
