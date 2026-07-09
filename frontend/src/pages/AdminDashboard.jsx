import { useState, useEffect } from 'react';
import API from '../api/axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { useToast } from '../context/ToastContext';
import { timeAgo } from '../utils/dateUtils';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const token = localStorage.getItem('token');
  const { showToast } = useToast();

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
      await API.delete(`/admin/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      showToast('🗑️ User deleted successfully', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not delete user', 'error');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) return <div className="spinner"></div>;
  if (error) return <div className="empty-state"><h3>Something went wrong</h3><p>{error}</p></div>;

  const usersChartData = {
    labels: ['Candidates', 'Recruiters', 'Admins'],
    datasets: [{
      data: [stats?.totalCandidates || 0, stats?.totalRecruiters || 0, 1],
      backgroundColor: ['#2563EB', '#06B6D4', '#7C3AED'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  const jobsChartData = {
    labels: ['Open Jobs', 'Closed Jobs'],
    datasets: [{
      data: [stats?.openJobs || 0, stats?.closedJobs || 0],
      backgroundColor: ['#10B981', '#EF4444'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  const overviewChartData = {
    labels: ['Users', 'Jobs', 'Applications'],
    datasets: [{
      label: 'Total',
      data: [stats?.totalUsers || 0, stats?.totalJobs || 0, stats?.totalApplications || 0],
      backgroundColor: [
        'rgba(37,99,235,0.8)',
        'rgba(6,182,212,0.8)',
        'rgba(124,58,237,0.8)'
      ],
      borderRadius: 8,
      borderSkipped: false
    }]
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 16, font: { family: 'Inter', size: 12 } }
      }
    },
    maintainAspectRatio: true
  };

  const barOptions = {
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1, font: { family: 'Inter' } }, grid: { color: 'rgba(0,0,0,0.04)' } },
      x: { ticks: { font: { family: 'Inter' } }, grid: { display: false } }
    },
    maintainAspectRatio: true
  };

  const roleConfig = {
    candidate: { bg: 'rgba(37,99,235,0.1)', color: '#1D4ED8', icon: '👤' },
    recruiter: { bg: 'rgba(6,182,212,0.1)', color: '#0E7490', icon: '🏢' },
    admin: { bg: 'rgba(124,58,237,0.1)', color: '#6D28D9', icon: '⚡' }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Hero header */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)',
        padding: '48px 40px 80px',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.9)', padding: '5px 14px',
            borderRadius: 'var(--r-full)', fontSize: '12px', fontWeight: 600,
            letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px'
          }}>
            ⚡ Admin Panel
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '36px',
            fontWeight: 900, color: 'white', marginBottom: '8px'
          }}>
            Admin Dashboard
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px' }}>
            Full platform overview — users, jobs, and applications
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '-40px auto 0', padding: '0 24px 80px', position: 'relative', zIndex: 1 }}>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { icon: '👥', value: stats?.totalUsers, label: 'Total Users', sub: `${stats?.totalCandidates} candidates · ${stats?.totalRecruiters} recruiters`, color: 'linear-gradient(90deg, #2563EB, #06B6D4)' },
            { icon: '💼', value: stats?.totalJobs, label: 'Total Jobs', sub: `${stats?.openJobs} open · ${stats?.closedJobs} closed`, color: 'linear-gradient(90deg, #10B981, #34D399)' },
            { icon: '📋', value: stats?.totalApplications, label: 'Applications', sub: 'All time', color: 'linear-gradient(90deg, #7C3AED, #A855F7)' },
            { icon: '📊', value: `${stats?.openJobs > 0 ? Math.round((stats?.totalApplications / stats?.totalJobs) * 10) / 10 : 0}`, label: 'Avg per Job', sub: 'Applications per listing', color: 'linear-gradient(90deg, #F59E0B, #FCD34D)' },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: 'white', border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)', padding: '20px 24px',
              boxShadow: 'var(--shadow-sm)', position: 'relative',
              overflow: 'hidden', transition: 'all 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: stat.color }} />
              <div style={{ fontSize: '22px', marginBottom: '8px' }}>{stat.icon}</div>
              <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text)', lineHeight: 1, marginBottom: '4px' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{stat.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          {[
            { title: '👥 Users by Role', chart: <Pie data={usersChartData} options={chartOptions} /> },
            { title: '💼 Jobs by Status', chart: <Pie data={jobsChartData} options={chartOptions} /> },
            { title: '📊 Platform Overview', chart: <Bar data={overviewChartData} options={barOptions} /> },
          ].map(({ title, chart }) => (
            <div key={title} style={{
              background: 'white', border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)', padding: '24px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {title}
              </h4>
              {chart}
            </div>
          ))}
        </div>

        {/* Users table */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>

          {/* Table header */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
              👥 All Users
              <span style={{ marginLeft: '8px', background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 10px', borderRadius: 'var(--r-full)', fontSize: '12px', fontWeight: 700 }}>
                {filteredUsers.length}
              </span>
            </h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', pointerEvents: 'none' }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: '36px', width: '200px', padding: '8px 12px 8px 34px', fontSize: '13px' }}
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{ width: '130px', fontSize: '13px', padding: '8px 12px' }}
              >
                <option value="all">All Roles</option>
                <option value="candidate">Candidates</option>
                <option value="recruiter">Recruiters</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  {['User', 'Email', 'Role', 'Joined', 'Action'].map(h => (
                    <th key={h} style={{
                      padding: '12px 20px', textAlign: 'left',
                      fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.08em', color: 'var(--text-muted)',
                      borderBottom: '1px solid var(--border)'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, index) => {
                  const rc = roleConfig[u.role] || roleConfig.candidate;
                  return (
                    <tr key={u._id} style={{
                      borderBottom: index < filteredUsers.length - 1 ? '1px solid var(--border)' : 'none',
                      transition: 'background 0.15s'
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '34px', height: '34px', borderRadius: '50%',
                            background: `linear-gradient(135deg, ${rc.color}, ${rc.color}88)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: '13px', fontWeight: 700, flexShrink: 0
                          }}>
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>{u.email}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 'var(--r-full)',
                          fontSize: '11px', fontWeight: 700,
                          background: rc.bg, color: rc.color
                        }}>
                          {rc.icon} {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                        {timeAgo(u.createdAt)}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          style={{
                            fontSize: '12px', padding: '6px 12px',
                            background: 'rgba(239,68,68,0.08)',
                            color: '#B91C1C', border: '1px solid rgba(239,68,68,0.15)',
                            boxShadow: 'none'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#EF4444'; e.currentTarget.style.color = 'white'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#B91C1C'; }}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '24px', marginBottom: '8px' }}>👥</p>
                <p style={{ fontWeight: 600 }}>No users found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}