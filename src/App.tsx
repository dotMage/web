import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Apps from './pages/Apps';
import AppDetail from './pages/AppDetail';
import Devices from './pages/Devices';
import Audit from './pages/Audit';
import './App.css';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

function NavBar() {
  const { token, logout } = useAuth();
  if (!token) return null;

  const linkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
    color: isActive ? 'var(--accent)' : 'var(--text-h)',
    textDecoration: 'none',
    fontWeight: isActive ? 600 : 400,
  });

  return (
    <nav className="dm-nav">
      <span className="dm-nav-brand">dotMage</span>
      <div className="dm-nav-links">
        <NavLink to="/" end style={linkStyle}>Apps</NavLink>
        <NavLink to="/devices" style={linkStyle}>Devices</NavLink>
        <NavLink to="/audit" style={linkStyle}>Audit</NavLink>
      </div>
      <button onClick={logout} className="dm-nav-logout">Logout</button>
    </nav>
  );
}

function AppRoutes() {
  return (
    <>
      <NavBar />
      <main className="dm-main">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RequireAuth><Apps /></RequireAuth>} />
          <Route path="/apps/:name" element={<RequireAuth><AppDetail /></RequireAuth>} />
          <Route path="/devices" element={<RequireAuth><Devices /></RequireAuth>} />
          <Route path="/audit" element={<RequireAuth><Audit /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
