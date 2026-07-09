import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useToast } from '../context/ToastContext';
import { timeAgo } from '../utils/dateUtils';

const TIMELINE_STEPS = ['Applied', 'Reviewed', 'Interview', 'Offer', 'Accepted'];

function getTimelineIndex(app) {
  if (app.status === 'rejected') return -1;
  if (app.status === 'accepted') return 4;
  if (app.interview?.scheduledAt) return 2;
  return 1;
}

function StatCard({ icon, value, label, color }) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      padding: '20px 24px',
      boxShadow: 'var(--shadow-sm)',
      transition: 'all 0.2s',
      position: 'relative',
      overflow: 'hidden'
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: color
      }} />
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
      <div style={{
        fontSize: '28px', fontWeight: 800,
        fontFamily: 'var(--font-display)',
        color: 'var(--text)', lineHeight: 1, marginBottom: '4px'
      }}>{value}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function Timeline({ app }) {
  const currentIndex = getTimelineIndex(app);
  const isRejected = app.status === 'rejected';

  if (isRejected) {
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        background: 'rgba(239,68,68,0.08)', color: '#B91C1C',
        padding: '6px 14px', borderRadius: 'var(--r-full)',
        fontSize: '12px', fontWeight: 700, marginTop: '12px'
      }}>
        ❌ Application not selected
      </div>
    );
  }

  return (
    <div style={{ marginTop: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', minWidth: '360px' }}>
        {TIMELINE_STEPS.map((step, i) => (
          <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {/* Connector line */}
            {i < TIMELINE_STEPS.length - 1 && (
              <div style={{
                position: 'absolute',
                top: '14px',
                left: '50%',
                width: '100%',
                height: '2px',
                background: i < currentIndex
                  ? 'linear-gradient(90deg, var(--primary), var(--accent))'
                  : 'var(--border)',
                zIndex: 0,
                transition: 'background 0.3s'
              }} />
            )}
            {/* Dot */}
            <div style={{
              width: '28px', height: '28px',
              borderRadius: '50%',
              background: i < currentIndex
                ? 'linear-gradient(135deg, var(--primary), var(--accent))'
                : i === currentIndex
                  ? 'white'
                  : 'var(--border)',
              border: i === currentIndex
                ? '2.5px solid var(--primary)'
                : i < currentIndex
                  ? 'none'
                  : '2px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', color: 'white',
              position: 'relative', zIndex: 1,
              boxShadow: i === currentIndex ? '0 0 0 4px rgba(37,99,235,0.15)' : 'none',
              transition: 'all 0.3s',
              flexShrink: 0
            }}>
              {i < currentIndex ? '✓' : i === currentIndex ? (
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: 'var(--primary)'
                }} />
              ) : null}
            </div>
            {/* Label */}
            <span style={{
              fontSize: '10px',
              fontWeight: i <= currentIndex ? 700 : 500,
              color: i <= currentIndex ? 'var(--primary)' : 'var(--text-muted)',
              marginTop: '6px',
              textAlign: 'center',
              whiteSpace: 'nowrap'
            }}>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const token = localStorage.getItem('token');
  const { showToast } = useToast();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await API.get('/applications/my-applications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplications(res.data);
      } catch (err) {
        setError('Could not load your applications');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const handleInterviewResponse = async (applicationId, status) => {
    try {
      const res = await API.put(
        `/applications/${applicationId}/interview/respond`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplications((prev) => prev.map((app) =>
        app._id === applicationId ? { ...app, interview: res.data.application.interview } : app
      ));
      showToast(
        status === 'confirmed' ? '✅ Interview confirmed!' : '❌ Interview cancelled',
        status === 'confirmed' ? 'success' : 'error'
      );
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not respond', 'error');
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.job?.title?.toLowerCase().includes(search.toLowerCase()) ||
      app.job?.company?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const total = applications.length;
  const interviews = applications.filter(a => a.interview?.scheduledAt).length;
  const accepted = applications.filter(a => a.status === 'accepted').length;
  const avgMatch = applications.filter(a => a.matchPercentage != null).length > 0
    ? Math.round(applications.filter(a => a.matchPercentage != null).reduce((sum, a) => sum + a.matchPercentage, 0) / applications.filter(a => a.matchPercentage != null).length)
    : 0;

  if (loading) return <div className="spinner"></div>;
  if (error) return <div className="empty-state"><h3>Something went wrong</h3><p>{error}</p></div>;

  return (
    <div>
      {/* Page header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--navy) 0%, #1E3A5F 100%)',
        padding: '48px 40px 80px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '860px', margin: '0 auto' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '36px', fontWeight: 900,
            color: 'white', marginBottom: '8px'
          }}>
            My Applications
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px' }}>
            Track your job applications and interview progress
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '860px', margin: '-40px auto 0', padding: '0 24px 80px', position: 'relative', zIndex: 1 }}>

        {/* Stats cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '28px'
        }}>
          <StatCard icon="📋" value={total} label="Total Applications" color="linear-gradient(90deg, var(--primary), var(--accent))" />
          <StatCard icon="📅" value={interviews} label="Interviews" color="linear-gradient(90deg, #7C3AED, #A855F7)" />
          <StatCard icon="🎉" value={accepted} label="Accepted" color="linear-gradient(90deg, #10B981, #34D399)" />
          <StatCard icon="🤖" value={avgMatch ? `${avgMatch}%` : '—'} label="Avg AI Match" color="linear-gradient(90deg, #F59E0B, #FCD34D)" />
        </div>

        {/* Search + filter */}
        {applications.length > 0 && (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <span style={{
                position: 'absolute', left: '14px', top: '50%',
                transform: 'translateY(-50%)', fontSize: '16px', pointerEvents: 'none'
              }}>🔍</span>
              <input
                type="text"
                placeholder="Search applications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '42px' }}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '150px' }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        )}

        {applications.length === 0 && (
          <div className="empty-state">
            <h3>📭 No applications yet</h3>
            <p>Browse available jobs and apply to get started!</p>
          </div>
        )}

        {applications.length > 0 && filteredApplications.length === 0 && (
          <div className="empty-state">
            <h3>🔍 No applications match</h3>
            <p>Try different keywords or clear your filters.</p>
          </div>
        )}

        {filteredApplications.map((app) => (
          <div key={app._id} style={{
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)',
            padding: '24px 28px',
            marginBottom: '16px',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s',
            position: 'relative',
            overflow: 'hidden'
          }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Status accent line */}
            <div style={{
              position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px',
              background: app.status === 'accepted'
                ? 'linear-gradient(180deg, #10B981, #34D399)'
                : app.status === 'rejected'
                  ? 'linear-gradient(180deg, #EF4444, #F87171)'
                  : 'linear-gradient(180deg, var(--primary), var(--accent))'
            }} />

            <div style={{ paddingLeft: '12px' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  {/* Company avatar */}
                  <div style={{
                    width: '44px', height: '44px',
                    borderRadius: 'var(--r-sm)',
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '16px', fontWeight: 800,
                    fontFamily: 'var(--font-display)', flexShrink: 0,
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    {app.job?.company?.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '17px', margin: 0, marginBottom: '2px' }}>{app.job?.title}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                      {app.job?.company} · {app.job?.location}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <span className={`status-pill status-${app.status}`}>{app.status}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {timeAgo(app.createdAt)}
                  </span>
                </div>
              </div>

              {/* AI Match */}
              {app.matchPercentage !== null && app.matchPercentage !== undefined && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  marginBottom: '12px', flexWrap: 'wrap'
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'var(--primary-light)',
                    padding: '5px 12px', borderRadius: 'var(--r-full)',
                    border: '1px solid rgba(37,99,235,0.15)'
                  }}>
                    <span style={{ fontSize: '12px' }}>🤖</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>
                      {app.matchPercentage}% AI Match
                    </span>
                  </div>

                  {app.matchedSkills?.length > 0 && app.matchedSkills.map(skill => (
                    <span key={skill} style={{
                      background: 'rgba(16,185,129,0.1)', color: '#065F46',
                      padding: '3px 10px', borderRadius: 'var(--r-full)',
                      fontSize: '11px', fontWeight: 600
                    }}>✅ {skill}</span>
                  ))}
                  {app.missingSkills?.length > 0 && app.missingSkills.map(skill => (
                    <span key={skill} style={{
                      background: 'rgba(239,68,68,0.08)', color: '#B91C1C',
                      padding: '3px 10px', borderRadius: 'var(--r-full)',
                      fontSize: '11px', fontWeight: 600
                    }}>❌ {skill}</span>
                  ))}
                </div>
              )}

              {/* Timeline */}
              <Timeline app={app} />

              {/* Interview card */}
              {app.interview?.scheduledAt && (
                <div style={{
                  marginTop: '16px',
                  background: 'linear-gradient(135deg, rgba(37,99,235,0.04), rgba(6,182,212,0.04))',
                  border: '1px solid rgba(37,99,235,0.15)',
                  borderRadius: 'var(--r-md)',
                  padding: '16px 20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text)', marginBottom: '8px' }}>
                        📅 Interview Scheduled
                      </p>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '3px 0' }}>
                        🕐 {new Date(app.interview.scheduledAt).toLocaleString()}
                      </p>
                      {app.interview.location && (
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '3px 0' }}>
                          📍{' '}
                          {app.interview.location.startsWith('http') ? (
                            <a href={app.interview.location} target="_blank" rel="noopener noreferrer"
                              style={{ color: 'var(--primary)', fontWeight: 600 }}>
                              Join Meeting →
                            </a>
                          ) : app.interview.location}
                        </p>
                      )}
                      {app.interview.notes && (
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '3px 0' }}>
                          📝 {app.interview.notes}
                        </p>
                      )}
                    </div>
                    <span className={`status-pill status-${app.interview.status === 'confirmed' ? 'accepted' : app.interview.status === 'cancelled' ? 'rejected' : 'pending'}`}>
                      {app.interview.status}
                    </span>
                  </div>

                  {app.interview.status === 'proposed' && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                      <button
                        onClick={() => handleInterviewResponse(app._id, 'confirmed')}
                        style={{ fontSize: '13px', padding: '8px 16px' }}
                      >
                        ✅ Confirm Interview
                      </button>
                      <button
                        onClick={() => handleInterviewResponse(app._id, 'cancelled')}
                        style={{
                          fontSize: '13px', padding: '8px 16px',
                          background: 'transparent', color: 'var(--danger)',
                          border: '1.5px solid var(--danger)', boxShadow: 'none'
                        }}
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}