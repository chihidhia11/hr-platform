import { useState, useEffect } from 'react';
import API from '../api/axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          API.get('/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
          API.get('/admin/users', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        setError('Could not load admin data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await API.delete(`/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete user');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const usersChartData = {
    labels: ['Candidates', 'Recruiters'],
    datasets: [{
      data: [stats?.totalCandidates || 0, stats?.totalRecruiters || 0],
      backgroundColor: ['#0F766E', '#D97706'],
      borderWidth: 0
    }]
  };

  const jobsChartData = {
    labels: ['Open Jobs', 'Closed Jobs'],
    datasets: [{
      data: [stats?.openJobs || 0, stats?.closedJobs || 0],
      backgroundColor: ['#0F766E', '#B91C1C'],
      borderWidth: 0
    }]
  };

  const overviewChartData = {
    labels: ['Users', 'Jobs', 'Applications'],
    datasets: [{
      label: 'Total Count',
      data: [stats?.totalUsers || 0, stats?.totalJobs || 0, stats?.totalApplications || 0],
      backgroundColor: ['#0F766E', '#D97706', '#1A2332'],
      borderRadius: 6
    }]
  };

  const chartOptions = {
    plugins: { legend: { position: 'bottom' } }
  };

  const barOptions = {
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
  };

  return (
    <div>
      <h2 className="page-title">Admin Dashboard</h2>
      <div className="page-container">

        {/* Stats Cards */}
        {stats && (
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
            <div className="job-card" style={{ textAlign: 'center' }}>
              <h1 style={{ margin: 0, color: 'var(--color-accent)' }}>{stats.totalUsers}</h1>
              <p style={{ margin: 0 }}>Total Users</p>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                {stats.totalCandidates} candidates · {stats.totalRecruiters} recruiters
              </p>
            </div>
            <div className="job-card" style={{ textAlign: 'center' }}>
              <h1 style={{ margin: 0, color: 'var(--color-accent)' }}>{stats.totalJobs}</h1>
              <p style={{ margin: 0 }}>Total Jobs</p>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                {stats.openJobs} open · {stats.closedJobs} closed
              </p>
            </div>
            <div className="job-card" style={{ textAlign: 'center' }}>
              <h1 style={{ margin: 0, color: 'var(--color-accent)' }}>{stats.totalApplications}</h1>
              <p style={{ margin: 0 }}>Total Applications</p>
            </div>
          </div>
        )}

        {/* Charts */}
        {stats && (
          <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '32px' }}>
            <div className="job-card">
              <h4 style={{ marginTop: 0, textAlign: 'center' }}>Users by Role</h4>
              <Pie data={usersChartData} options={chartOptions} />
            </div>
            <div className="job-card">
              <h4 style={{ marginTop: 0, textAlign: 'center' }}>Jobs by Status</h4>
              <Pie data={jobsChartData} options={chartOptions} />
            </div>
            <div className="job-card">
              <h4 style={{ marginTop: 0, textAlign: 'center' }}>Platform Overview</h4>
              <Bar data={overviewChartData} options={barOptions} />
            </div>
          </div>
        )}

        {/* Users Table */}
        <h3>All Users</h3>
        <div className="table-wrapper">
          <div className="job-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-sage)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px' }}>Name</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px' }}>Email</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px' }}>Role</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px' }}>Joined</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user._id} style={{ borderTop: '1px solid var(--color-border)', background: index % 2 === 0 ? 'white' : 'var(--color-bg)' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px' }}>{user.name}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--color-text-muted)' }}>{user.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`status-pill ${user.role === 'admin' ? 'status-accepted' : user.role === 'recruiter' ? 'status-pending' : 'status-pill'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        style={{ background: 'var(--color-rejected)', fontSize: '12px', padding: '4px 10px' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;