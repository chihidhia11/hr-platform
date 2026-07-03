import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import PostJob from './pages/PostJob';
import MyApplicants from './pages/MyApplicants';
import MyApplications from './pages/MyApplications';
import AdminDashboard from './pages/AdminDashboard';

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
            <span className="navbar-user">Hello, {user.name} ({user.role})</span>
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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/post-job" element={<PostJob />} />
        <Route path="/my-applicants" element={<MyApplicants />} />
        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}

export default App;