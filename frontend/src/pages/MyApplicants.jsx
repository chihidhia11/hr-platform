import { useState, useEffect } from 'react';
import API from '../api/axios';

function MyApplicants() {
  const [jobs, setJobs] = useState([]);
  const [applicantsByJob, setApplicantsByJob] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState({});

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchMyJobsAndApplicants = async () => {
      try {
        // Get all jobs, then filter to only this recruiter's jobs
        const jobsRes = await API.get('/jobs');
        const myJobs = jobsRes.data.filter((job) => job.postedBy?._id === user.id);
        setJobs(myJobs);

        // For each job, fetch its applicants
        const applicantsData = {};
        for (const job of myJobs) {
          const res = await API.get(`/applications/jobs/${job._id}/applications`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          applicantsData[job._id] = res.data;
        }
        setApplicantsByJob(applicantsData);

      } catch (err) {
        setError('Could not load applicants');
      } finally {
        setLoading(false);
      }
    };

    fetchMyJobsAndApplicants();
  }, []);

  const handleStatusUpdate = async (applicationId, jobId, newStatus) => {
    try {
      const res = await API.put(
        `/applications/${applicationId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the applicant's status in the UI without re-fetching everything
      setApplicantsByJob((prev) => ({
        ...prev,
        [jobId]: prev[jobId].map((app) =>
          app._id === applicationId ? { ...app, status: res.data.application.status } : app
        )
      }));

      setStatusMessage((prev) => ({ ...prev, [applicationId]: 'Updated!' }));

    } catch (err) {
      setStatusMessage((prev) => ({
        ...prev,
        [applicationId]: err.response?.data?.message || 'Failed to update'
      }));
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2 className="page-title">My Job Applicants</h2>
      <div className="page-container">

      {jobs.length === 0 && <p>You haven't posted any jobs yet.</p>}

      {jobs.map((job) => (
        <div key={job._id} className="job-card">
          <h3>{job.title}</h3>
          <p><strong>Company:</strong> {job.company}</p>

          <h4>Applicants</h4>
          {applicantsByJob[job._id]?.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {applicantsByJob[job._id].map((app) => (
                <li key={app._id} style={{ marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ marginBottom: '8px' }}>
                    {app.candidate?.name} ({app.candidate?.email}) —{' '}
                    <span className={`status-pill status-${app.status}`}>{app.status}</span>
                    {app.matchPercentage !== null && app.matchPercentage !== undefined && (
                      <span style={{ marginLeft: '10px', fontWeight: 700, color: 'var(--color-accent)' }}>
                        {app.matchPercentage}% skill match
                      </span>
                    )}
                  </div>
                  <div>
                    <button onClick={() => handleStatusUpdate(app._id, job._id, 'accepted')}>
                      Accept
                    </button>
                    <button onClick={() => handleStatusUpdate(app._id, job._id, 'rejected')} style={{ marginLeft: '8px', background: 'var(--color-rejected)' }}>
                      Reject
                    </button>
                    {statusMessage[app._id] && <span style={{ marginLeft: '8px', fontSize: '13px', color: 'var(--color-text-muted)' }}>{statusMessage[app._id]}</span>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No applicants yet.</p>
          )}
        </div>
      ))}
      </div>
    </div>
  );
}

export default MyApplicants;