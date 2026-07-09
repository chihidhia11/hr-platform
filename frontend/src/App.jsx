import { Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import PostJob from './pages/PostJob';
import MyApplicants from './pages/MyApplicants';
import MyApplications from './pages/MyApplications';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';

function GuestRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user'));
  return user ? <Navigate to="/" replace /> : children;
}

function ProtectedRoute({ children, roles }) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function NotFound() {
  return (
    <div className="empty-state" style={{ marginTop: '80px' }}>
      <h3>404 — Page Not Found</h3>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/" style={{ marginTop: '16px', display: 'inline-block' }}>← Back to Jobs</Link>
    </div>
  );
}

function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} style={{
      color: isActive ? 'var(--primary)' : 'var(--text-muted)',
      fontSize: '14px',
      fontWeight: isActive ? 600 : 500,
      padding: '7px 14px',
      borderRadius: 'var(--r-sm)',
      background: isActive ? 'var(--primary-light)' : 'transparent',
      transition: 'all 0.15s',
      textDecoration: 'none',
      whiteSpace: 'nowrap',
      position: 'relative'
    }}>
      {children}
      {isActive && (
        <span style={{
          position: 'absolute',
          bottom: '-22px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '20px',
          height: '2px',
          background: 'var(--primary)',
          borderRadius: '2px'
        }} />
      )}
    </Link>
  );
}

function App() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const roleConfig = {
    candidate: { bg: 'rgba(16,185,129,0.1)', color: '#065F46', label: 'Candidate' },
    recruiter: { bg: 'rgba(37,99,235,0.1)', color: '#1D4ED8', label: 'Recruiter' },
    admin: { bg: 'rgba(124,58,237,0.1)', color: '#6D28D9', label: 'Admin' }
  };

  const role = user ? roleConfig[user.role] : null;

  return (
    <div>
      <nav className="navbar">

        {/* Brand */}
        <Link to="/" style={{
          fontFamily: 'var(--font-display)',
          fontSize: '20px',
          fontWeight: 800,
          color: 'var(--navy)',
          letterSpacing: '-0.03em',
          textDecoration: 'none',
          marginRight: '8px',
          flexShrink: 0
        }}>
          HR<span style={{ color: 'var(--primary)' }}>Platform</span>
        </Link>

        {/* Divider */}
        <div style={{
          width: '1px', height: '20px',
          background: 'var(--border)',
          marginRight: '8px', flexShrink: 0
        }} />

        {/* Nav links */}
        <NavLink to="/">Jobs</NavLink>

        {user && (user.role === 'recruiter' || user.role === 'admin') && (
          <>
            <NavLink to="/post-job">Post a Job</NavLink>
            <NavLink to="/my-applicants">My Applicants</NavLink>
          </>
        )}
        {user && user.role === 'candidate' && (
          <NavLink to="/my-applications">My Applications</NavLink>
        )}
        {user && user.role === 'admin' && (
          <NavLink to="/admin">Admin</NavLink>
        )}

        {/* Right side */}
        <div className="navbar-user">
          {user ? (
            <>
              {/* Role badge */}
              <span style={{
                padding: '4px 10px',
                borderRadius: 'var(--r-full)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                background: role?.bg,
                color: role?.color,
                flexShrink: 0,
                textTransform: 'uppercase'
              }}>
                {role?.label}
              </span>

              {/* Avatar + name */}
              <Link to="/profile" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                padding: '5px 10px 5px 5px',
                borderRadius: 'var(--r-full)',
                border: '1.5px solid var(--border)',
                background: 'var(--surface)',
                transition: 'all 0.15s',
                boxShadow: 'var(--shadow-xs)'
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
                }}
              >
                <div style={{
                  width: '28px', height: '28px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '12px', fontWeight: 700, flexShrink: 0
                }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span style={{
                  fontSize: '13px', fontWeight: 600,
                  color: 'var(--text)', whiteSpace: 'nowrap'
                }}>
                  {user.name?.split(' ')[0]}
                </span>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  border: '1.5px solid var(--border)',
                  padding: '7px 14px',
                  fontSize: '13px',
                  fontWeight: 600,
                  boxShadow: 'none',
                  borderRadius: 'var(--r-sm)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--navy)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.borderColor = 'var(--navy)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{
                fontSize: '14px', fontWeight: 500,
                color: 'var(--text-muted)', padding: '7px 14px',
                borderRadius: 'var(--r-sm)', transition: 'all 0.15s'
              }}>
                Sign In
              </Link>
              <Link to="/register" style={{
                background: 'linear-gradient(135deg, var(--primary), #1D4ED8)',
                color: 'white',
                padding: '8px 18px',
                borderRadius: 'var(--r-sm)',
                fontWeight: 600,
                fontSize: '14px',
                boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
                transition: 'all 0.2s'
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,0.4)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(37,99,235,0.3)';
                }}
              >
                Get Started →
              </Link>
            </>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Jobs />} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/post-job" element={<ProtectedRoute roles={['recruiter', 'admin']}><PostJob /></ProtectedRoute>} />
        <Route path="/my-applicants" element={<ProtectedRoute roles={['recruiter', 'admin']}><MyApplicants /></ProtectedRoute>} />
        <Route path="/my-applications" element={<ProtectedRoute roles={['candidate']}><MyApplications /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;