import { useState, useEffect } from 'react';
import API from '../api/axios';

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        </div>
      ))}
      </div>
    </div>
  );
}

export default MyApplications;