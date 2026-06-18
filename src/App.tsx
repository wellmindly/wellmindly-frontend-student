import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/Login';
import { LandingPage } from './pages/LandingPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { DiscoverPage } from './pages/DiscoverPage';
import { CrisisPage } from './pages/CrisisPage';

function DiscoverRoute() {
  const { user } = useAuth();
  if (user) {
    const params = new URLSearchParams(window.location.search);
    const showResult = params.get('showResult') || params.get('testId');
    const redirectUrl = showResult 
      ? `/dashboard?tab=discover&showResult=${showResult}` 
      : `/dashboard?tab=discover`;
    return <Navigate to={redirectUrl} replace />;
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
    const params = new URLSearchParams(window.location.search);
    const redirectParam = params.get('redirect');
    const testIdParam = params.get('testId');
    if (redirectParam) {
      const target = testIdParam ? `${redirectParam}?showResult=${testIdParam}` : redirectParam;
      return <Navigate to={target} replace />;
    }
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
          <Route path="/crisis" element={<CrisisPage />} />
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
