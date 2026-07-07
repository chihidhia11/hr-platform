import { useState, useEffect } from 'react';
import API from '../api/axios';

function MyApplicants() {
  const [jobs, setJobs] = useState([]);
  const [applicantsByJob, setApplicantsByJob] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState({});
  const [editingJobId, setEditingJobId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [schedulingAppId, setSchedulingAppId] = useState(null);
  const [interviewForm, setInterviewForm] = useState({ scheduledAt: '', location: '', notes: '' });

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchMyJobsAndApplicants = async () => {
      try {
        const jobsRes = await API.get('/jobs');
        const myJobs = jobsRes.data.filter((job) => job.postedBy?._id === user.id);
        setJobs(myJobs);

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

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await API.delete(`/jobs/${jobId}`, { headers: { Authorization: `Bearer ${token}` } });
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete job');
    }
  };

  const handleToggleStatus = async (jobId, currentStatus) => {
    const newStatus = currentStatus === 'open' ? 'closed' : 'open';
    try {
      await API.put(`/jobs/${jobId}`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      setJobs((prev) => prev.map((job) => job._id === jobId ? { ...job, status: newStatus } : job));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update job status');
    }
  };

  const handleEditClick = (job) => {
    setEditingJobId(job._id);
    setEditForm({
      title: job.title,
      description: job.description,
      company: job.company,
      location: job.location,
      skillsRequired: job.skillsRequired.join(', '),
      salary: job.salary || ''
    });
  };

  const handleEditSave = async (jobId) => {
    try {
      const res = await API.put(
        `/jobs/${jobId}`,
        { ...editForm, skillsRequired: editForm.skillsRequired.split(',').map((s) => s.trim()) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJobs((prev) => prev.map((job) => job._id === jobId ? { ...job, ...res.data.job } : job));
      setEditingJobId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update job');
    }
  };

  const handleScheduleInterview = async (applicationId, jobId) => {
    try {
      const res = await API.post(
        `/applications/${applicationId}/interview`,
        interviewForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setApplicantsByJob((prev) => ({
        ...prev,
        [jobId]: prev[jobId].map((app) =>
          app._id === applicationId ? { ...app, interview: res.data.application.interview } : app
        )
      }));

      setSchedulingAppId(null);
      setInterviewForm({ scheduledAt: '', location: '', notes: '' });
      setStatusMessage((prev) => ({ ...prev, [applicationId]: '✅ Interview scheduled!' }));

    } catch (err) {
      alert(err.response?.data?.message || 'Could not schedule interview');
    }
  };

  if (loading) return <div className="spinner"></div>;
  if (error) return (
    <div className="empty-state">
      <h3>Something went wrong</h3>
      <p>{error}</p>
    </div>
  );

  return (
    <div>
      <h2 className="page-title">My Job Applicants</h2>
      <div className="page-container">

      {jobs.length === 0 && (
        <div className="empty-state">
          <h3>📭 No jobs posted yet</h3>
          <p>Post your first job to start receiving applications.</p>
        </div>
      )}

      {jobs.map((job) => (
        <div key={job._id} className="job-card">

          {editingJobId === job._id ? (
            <div>
              <h3 style={{ marginTop: 0 }}>Editing: {job.title}</h3>
              <div className="form-field">
                <label>Title</label>
                <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Description</label>
                <textarea rows={3} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Company</label>
                <input value={editForm.company} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Location</label>
                <input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Skills (comma separated)</label>
                <input value={editForm.skillsRequired} onChange={(e) => setEditForm({ ...editForm, skillsRequired: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Salary</label>
                <input type="number" value={editForm.salary} onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button onClick={() => handleEditSave(job._id)}>Save Changes</button>
                <button onClick={() => setEditingJobId(null)} style={{ background: 'var(--color-text-muted)' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>
                  {job.title}{' '}
                  {job.status === 'closed' && (
                    <span className="status-pill status-rejected" style={{ fontSize: '11px', marginLeft: '8px' }}>Closed</span>
                  )}
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEditClick(job)} style={{ fontSize: '13px', padding: '6px 12px' }}>
                    Edit Job
                  </button>
                  <button
                    onClick={() => handleToggleStatus(job._id, job.status)}
                    style={{ background: job.status === 'open' ? 'var(--color-pending)' : 'var(--color-accepted)', fontSize: '13px', padding: '6px 12px' }}
                  >
                    {job.status === 'open' ? 'Close Job' : 'Reopen Job'}
                  </button>
                  <button onClick={() => handleDeleteJob(job._id)} style={{ background: 'var(--color-rejected)', fontSize: '13px', padding: '6px 12px' }}>
                    Delete Job
                  </button>
                </div>
              </div>
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

                      {app.interview?.scheduledAt && (
                        <div style={{ marginBottom: '8px', padding: '8px', background: 'var(--color-bg)', borderRadius: '6px', fontSize: '13px' }}>
                          <strong>📅 Interview:</strong> {new Date(app.interview.scheduledAt).toLocaleString()} —{' '}
                          <strong>📍</strong> {app.interview.location}{' '}
                          <span className={`status-pill status-${app.interview.status === 'confirmed' ? 'accepted' : app.interview.status === 'cancelled' ? 'rejected' : 'pending'}`}>
                            {app.interview.status}
                          </span>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button onClick={() => handleStatusUpdate(app._id, job._id, 'accepted')}>Accept</button>
                        <button onClick={() => handleStatusUpdate(app._id, job._id, 'rejected')} style={{ background: 'var(--color-rejected)' }}>Reject</button>
                        <button
                          onClick={() => setSchedulingAppId(schedulingAppId === app._id ? null : app._id)}
                          style={{ background: 'var(--color-pending)' }}
                        >
                          📅 Schedule Interview
                        </button>
                        {statusMessage[app._id] && <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', alignSelf: 'center' }}>{statusMessage[app._id]}</span>}
                      </div>

                      {schedulingAppId === app._id && (
                        <div style={{ marginTop: '12px', padding: '12px', background: 'var(--color-bg)', borderRadius: '8px' }}>
                          <div className="form-field">
                            <label>Date & Time</label>
                            <input type="datetime-local" value={interviewForm.scheduledAt} onChange={(e) => setInterviewForm({ ...interviewForm, scheduledAt: e.target.value })} />
                          </div>
                          <div className="form-field">
                            <label>Location (address or meeting link)</label>
                            <input type="text" placeholder="e.g. https://meet.google.com/abc" value={interviewForm.location} onChange={(e) => setInterviewForm({ ...interviewForm, location: e.target.value })} />
                          </div>
                          <div className="form-field">
                            <label>Notes (optional)</label>
                            <textarea rows={2} placeholder="e.g. Please bring your portfolio" value={interviewForm.notes} onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })} />
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleScheduleInterview(app._id, job._id)}>Send Interview Invitation</button>
                            <button onClick={() => setSchedulingAppId(null)} style={{ background: 'var(--color-text-muted)' }}>Cancel</button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '16px' }}>👥 No applicants yet</h3>
                  <p>Applications will appear here when candidates apply.</p>
                </div>
              )}
            </>
          )}
        </div>
      ))}
      </div>
    </div>
  );
}

export default MyApplicants;