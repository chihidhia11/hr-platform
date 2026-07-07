import { useState, useEffect } from 'react';
import API from '../api/axios';

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [interviewMessage, setInterviewMessage] = useState({});

  const token = localStorage.getItem('token');

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

      setInterviewMessage((prev) => ({
        ...prev,
        [applicationId]: status === 'confirmed' ? '✅ Interview confirmed!' : '❌ Interview cancelled'
      }));

    } catch (err) {
      setInterviewMessage((prev) => ({
        ...prev,
        [applicationId]: err.response?.data?.message || 'Could not respond to interview'
      }));
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2 className="page-title">My Applications</h2>
      <div className="page-container">

      {applications.length === 0 && <p>You haven't applied to any jobs yet.</p>}

      {applications.map((app) => (
        <div key={app._id} className="job-card">
          <h3>{app.job?.title}</h3>
          <p><strong>Company:</strong> {app.job?.company}</p>
          <p><strong>Location:</strong> {app.job?.location}</p>
          <p>
            <strong>Status:</strong>{' '}
            <span className={`status-pill status-${app.status}`}>{app.status}</span>
            {app.matchPercentage !== null && app.matchPercentage !== undefined && (
              <span style={{ marginLeft: '10px', fontWeight: 700, color: 'var(--color-accent)' }}>
                {app.matchPercentage}% skill match
              </span>
            )}
          </p>

          {/* Interview section */}
          {app.interview?.scheduledAt && (
            <div style={{ marginTop: '12px', padding: '12px', background: 'var(--color-bg)', borderRadius: '8px', borderLeft: '4px solid var(--color-accent)' }}>
              <p style={{ margin: '0 0 8px', fontWeight: 600 }}>📅 Interview Scheduled</p>
              <p style={{ margin: '4px 0', fontSize: '14px' }}>
                <strong>Date & Time:</strong> {new Date(app.interview.scheduledAt).toLocaleString()}
              </p>
              <p style={{ margin: '4px 0', fontSize: '14px' }}>
                <strong>Location:</strong>{' '}
                {app.interview.location?.startsWith('http') ? (
                  <a href={app.interview.location} target="_blank" rel="noreferrer">{app.interview.location}</a>
                ) : (
                  app.interview.location
                )}
              </p>
              {app.interview.notes && (
                <p style={{ margin: '4px 0', fontSize: '14px' }}>
                  <strong>Notes:</strong> {app.interview.notes}
                </p>
              )}
              <p style={{ margin: '8px 0 0', fontSize: '14px' }}>
                <strong>Status:</strong>{' '}
                <span className={`status-pill status-${app.interview.status === 'confirmed' ? 'accepted' : app.interview.status === 'cancelled' ? 'rejected' : 'pending'}`}>
                  {app.interview.status}
                </span>
              </p>

              {/* Only show buttons if interview is still proposed */}
              {app.interview.status === 'proposed' && (
                <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleInterviewResponse(app._id, 'confirmed')}>
                    ✅ Confirm Interview
                  </button>
                  <button
                    onClick={() => handleInterviewResponse(app._id, 'cancelled')}
                    style={{ background: 'var(--color-rejected)' }}
                  >
                    ❌ Cancel Interview
                  </button>
                </div>
              )}

              {interviewMessage[app._id] && (
                <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  {interviewMessage[app._id]}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
      </div>
    </div>
  );
}

export default MyApplications;