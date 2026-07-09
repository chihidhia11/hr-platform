import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import PostJob from './pages/PostJob';
import MyApplicants from './pages/MyApplicants';
import MyApplications from './pages/MyApplications';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';

// Redirect to home if already logged in
function GuestRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user'));
  return user ? <Navigate to="/" replace /> : children;
}

// Redirect to login if not logged in
function ProtectedRoute({ children, roles }) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

// 404 page
function NotFound() {
  return (
    <div className="empty-state" style={{ marginTop: '80px' }}>
      <h3>404 — Page Not Found</h3>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/" style={{ marginTop: '16px', display: 'inline-block' }}>← Back to Jobs</Link>
    </div>
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

  return (
    <div>
      <nav className="navbar">
        <Link to="/" style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
          HR<span style={{ color: 'var(--color-accent)' }}>Platform</span>
        </Link>
        <Link to="/">Jobs</Link>

        {user ? (
          <>
            {(user.role === 'recruiter' || user.role === 'admin') && (
              <>
                <Link to="/post-job">Post a Job</Link>
                <Link to="/my-applicants">My Applicants</Link>
              </>
            )}
            {user.role === 'candidate' && (
              <Link to="/my-applications">My Applications</Link>
            )}
            {user.role === 'admin' && (
              <Link to="/admin">Admin Dashboard</Link>
            )}
            <Link to="/profile" style={{ marginLeft: 'auto' }}>
              {user.name} ({user.role})
            </Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<Jobs />} />

        {/* Guest only routes — redirect to home if logged in */}
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

        {/* Protected routes */}
        <Route path="/post-job" element={<ProtectedRoute roles={['recruiter', 'admin']}><PostJob /></ProtectedRoute>} />
        <Route path="/my-applicants" element={<ProtectedRoute roles={['recruiter', 'admin']}><MyApplicants /></ProtectedRoute>} />
        <Route path="/my-applications" element={<ProtectedRoute roles={['candidate']}><MyApplications /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;