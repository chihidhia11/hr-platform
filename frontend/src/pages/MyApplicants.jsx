import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useToast } from '../context/ToastContext';

export default function MyApplicants() {
  const [jobs, setJobs] = useState([]);
  const [applicantsByJob, setApplicantsByJob] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingJobId, setEditingJobId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [schedulingAppId, setSchedulingAppId] = useState(null);
  const [interviewForm, setInterviewForm] = useState({ scheduledAt: '', location: '', notes: '' });
  const [expandedJob, setExpandedJob] = useState(null);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const { showToast } = useToast();

  useEffect(() => {
    const fetchMyJobsAndApplicants = async () => {
      try {
        const jobsRes = await API.get('/jobs');
        const myJobs = jobsRes.data.filter((job) => job.postedBy?._id === user.id);
        setJobs(myJobs);
        if (myJobs.length > 0) setExpandedJob(myJobs[0]._id);

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
      showToast(newStatus === 'accepted' ? '✅ Candidate accepted!' : '❌ Candidate rejected', newStatus === 'accepted' ? 'success' : 'error');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update', 'error');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await API.delete(`/jobs/${jobId}`, { headers: { Authorization: `Bearer ${token}` } });
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
      showToast('🗑️ Job deleted successfully', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not delete job', 'error');
    }
  };

  const handleToggleStatus = async (jobId, currentStatus) => {
    const newStatus = currentStatus === 'open' ? 'closed' : 'open';
    try {
      await API.put(`/jobs/${jobId}`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      setJobs((prev) => prev.map((job) => job._id === jobId ? { ...job, status: newStatus } : job));
      showToast(newStatus === 'closed' ? '🔒 Job closed' : '🔓 Job reopened', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update', 'error');
    }
  };

  const handleEditClick = (job) => {
    setEditingJobId(job._id);
    setEditForm({
      title: job.title, description: job.description,
      company: job.company, location: job.location,
      skillsRequired: job.skillsRequired.join(', '), salary: job.salary || ''
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
      showToast('✅ Job updated successfully', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update job', 'error');
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
      showToast('📅 Interview scheduled! Email sent.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not schedule interview', 'error');
    }
  };

  const totalApplicants = Object.values(applicantsByJob).reduce((sum, apps) => sum + apps.length, 0);
  const totalAccepted = Object.values(applicantsByJob).reduce((sum, apps) => sum + apps.filter(a => a.status === 'accepted').length, 0);
  const totalInterviews = Object.values(applicantsByJob).reduce((sum, apps) => sum + apps.filter(a => a.interview?.scheduledAt).length, 0);
  const openJobs = jobs.filter(j => j.status === 'open').length;

  if (loading) return <div className="spinner"></div>;
  if (error) return <div className="empty-state"><h3>Something went wrong</h3><p>{error}</p></div>;

  return (
    <div>
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
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '36px',
            fontWeight: 900, color: 'white', marginBottom: '8px'
          }}>
            Recruiter Dashboard
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px' }}>
            Manage your job postings and review candidates
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '-40px auto 0', padding: '0 24px 80px', position: 'relative', zIndex: 1 }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }}>
          {[
            { icon: '💼', value: jobs.length, label: 'Total Jobs', color: 'linear-gradient(90deg, var(--primary), var(--accent))' },
            { icon: '✅', value: openJobs, label: 'Open Jobs', color: 'linear-gradient(90deg, #10B981, #34D399)' },
            { icon: '👥', value: totalApplicants, label: 'Total Applicants', color: 'linear-gradient(90deg, #7C3AED, #A855F7)' },
            { icon: '📅', value: totalInterviews, label: 'Interviews', color: 'linear-gradient(90deg, #F59E0B, #FCD34D)' },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: 'white', border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)', padding: '20px 24px',
              boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden',
              transition: 'all 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: stat.color }} />
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
              <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text)', lineHeight: 1, marginBottom: '4px' }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {jobs.length === 0 && (
          <div className="empty-state">
            <h3>📭 No jobs posted yet</h3>
            <p>Post your first job to start receiving applications.</p>
          </div>
        )}

        {/* Job list */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px', alignItems: 'start' }}>

          {/* Left sidebar — job list */}
          <div style={{ position: 'sticky', top: '88px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Your Jobs ({jobs.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {jobs.map((job) => (
                <div key={job._id}
                  onClick={() => setExpandedJob(job._id)}
                  style={{
                    background: expandedJob === job._id ? 'white' : 'rgba(255,255,255,0.6)',
                    border: `1.5px solid ${expandedJob === job._id ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 'var(--r-md)',
                    padding: '14px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    boxShadow: expandedJob === job._id ? 'var(--shadow-md)' : 'var(--shadow-xs)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: expandedJob === job._id ? 'var(--primary)' : 'var(--text)', margin: 0, lineHeight: 1.3 }}>
                      {job.title}
                    </p>
                    <span style={{
                      fontSize: '10px', fontWeight: 700, padding: '2px 8px',
                      borderRadius: 'var(--r-full)', flexShrink: 0, marginLeft: '6px',
                      background: job.status === 'open' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      color: job.status === 'open' ? '#065F46' : '#B91C1C'
                    }}>
                      {job.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                    👥 {applicantsByJob[job._id]?.length || 0} applicants
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel — job detail */}
          <div>
            {jobs.filter(j => j._id === expandedJob).map((job) => (
              <div key={job._id}>
                {editingJobId === job._id ? (
                  // Edit mode
                  <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>
                    <h3 style={{ marginBottom: '20px' }}>✏️ Editing: {job.title}</h3>
                    {[
                      { label: 'Title', key: 'title', type: 'input' },
                      { label: 'Description', key: 'description', type: 'textarea' },
                      { label: 'Company', key: 'company', type: 'input' },
                      { label: 'Location', key: 'location', type: 'input' },
                      { label: 'Skills (comma separated)', key: 'skillsRequired', type: 'input' },
                      { label: 'Salary', key: 'salary', type: 'number' },
                    ].map(({ label, key, type }) => (
                      <div key={key} className="form-field">
                        <label>{label}</label>
                        {type === 'textarea' ? (
                          <textarea rows={3} value={editForm[key]} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })} />
                        ) : (
                          <input type={type === 'number' ? 'number' : 'text'} value={editForm[key]} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })} />
                        )}
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleEditSave(job._id)}>Save Changes</button>
                      <button onClick={() => setEditingJobId(null)} style={{ background: 'transparent', color: 'var(--text-muted)', border: '1.5px solid var(--border)', boxShadow: 'none' }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Job header */}
                    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '24px 28px', boxShadow: 'var(--shadow-sm)', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                          <div style={{
                            width: '48px', height: '48px', borderRadius: 'var(--r-sm)',
                            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: '18px', fontWeight: 800,
                            fontFamily: 'var(--font-display)', flexShrink: 0
                          }}>
                            {job.company?.charAt(0)}
                          </div>
                          <div>
                            <h2 style={{ fontSize: '20px', margin: 0, marginBottom: '4px' }}>{job.title}</h2>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>{job.company} · {job.location}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          <button onClick={() => handleEditClick(job)} style={{ fontSize: '12px', padding: '7px 14px', background: 'transparent', color: 'var(--text-muted)', border: '1.5px solid var(--border)', boxShadow: 'none' }}>
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleToggleStatus(job._id, job.status)}
                            style={{ fontSize: '12px', padding: '7px 14px', background: job.status === 'open' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', color: job.status === 'open' ? '#B45309' : '#065F46', border: 'none', boxShadow: 'none' }}
                          >
                            {job.status === 'open' ? '🔒 Close' : '🔓 Reopen'}
                          </button>
                          <button onClick={() => handleDeleteJob(job._id)} style={{ fontSize: '12px', padding: '7px 14px', background: 'rgba(239,68,68,0.08)', color: '#B91C1C', border: 'none', boxShadow: 'none' }}>
                            🗑️ Delete
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {job.skillsRequired?.map(skill => (
                          <span key={skill} className="skill-tag">{skill}</span>
                        ))}
                        {job.salary && (
                          <span style={{ background: 'rgba(37,99,235,0.08)', color: 'var(--primary)', padding: '4px 12px', borderRadius: 'var(--r-full)', fontSize: '12px', fontWeight: 700 }}>
                            💰 {job.salary.toLocaleString()} TND
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Applicants */}
                    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '24px 28px', boxShadow: 'var(--shadow-sm)' }}>
                      <h3 style={{ fontSize: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        👥 Applicants
                        <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 10px', borderRadius: 'var(--r-full)', fontSize: '12px', fontWeight: 700 }}>
                          {applicantsByJob[job._id]?.length || 0}
                        </span>
                      </h3>

                      {!applicantsByJob[job._id]?.length ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                          <p style={{ fontSize: '32px', marginBottom: '8px' }}>👥</p>
                          <p style={{ fontWeight: 600 }}>No applicants yet</p>
                          <p style={{ fontSize: '13px' }}>Applications will appear here</p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {applicantsByJob[job._id].map((app) => (
                            <div key={app._id} style={{
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--r-md)',
                              padding: '16px 20px',
                              transition: 'all 0.15s',
                              position: 'relative', overflow: 'hidden'
                            }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.3)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                              {/* Status accent */}
                              <div style={{
                                position: 'absolute', top: 0, left: 0, bottom: 0, width: '3px',
                                background: app.status === 'accepted' ? 'linear-gradient(180deg, #10B981, #34D399)' : app.status === 'rejected' ? 'linear-gradient(180deg, #EF4444, #F87171)' : 'linear-gradient(180deg, var(--primary), var(--accent))'
                              }} />

                              <div style={{ paddingLeft: '10px' }}>
                                {/* Candidate info */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                      width: '36px', height: '36px', borderRadius: '50%',
                                      background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      color: 'white', fontSize: '13px', fontWeight: 700, flexShrink: 0
                                    }}>
                                      {app.candidate?.name?.charAt(0)}
                                    </div>
                                    <div>
                                      <p style={{ fontWeight: 700, fontSize: '14px', margin: 0 }}>{app.candidate?.name}</p>
                                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{app.candidate?.email}</p>
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {app.matchPercentage !== null && app.matchPercentage !== undefined && (
                                      <span style={{
                                        background: 'var(--primary-light)', color: 'var(--primary)',
                                        padding: '4px 10px', borderRadius: 'var(--r-full)',
                                        fontSize: '12px', fontWeight: 700
                                      }}>
                                        🤖 {app.matchPercentage}%
                                      </span>
                                    )}
                                    <span className={`status-pill status-${app.status}`}>{app.status}</span>
                                  </div>
                                </div>

                                {/* CV link */}
                                {app.cvUrl && !app.cvUrl.startsWith('http') && (
                                  <a href={`http://localhost:3000/uploads/${app.cvUrl}`} target="_blank" rel="noopener noreferrer"
                                    style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
                                    📄 View CV →
                                  </a>
                                )}

                                {/* Interview info */}
                                {app.interview?.scheduledAt && (
                                  <div style={{ background: 'rgba(37,99,235,0.04)', border: '1px solid rgba(37,99,235,0.1)', borderRadius: 'var(--r-sm)', padding: '8px 12px', marginBottom: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                    📅 {new Date(app.interview.scheduledAt).toLocaleString()} · {app.interview.location}
                                    <span className={`status-pill status-${app.interview.status === 'confirmed' ? 'accepted' : app.interview.status === 'cancelled' ? 'rejected' : 'pending'}`} style={{ marginLeft: '8px' }}>
                                      {app.interview.status}
                                    </span>
                                  </div>
                                )}

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                  <button onClick={() => handleStatusUpdate(app._id, job._id, 'accepted')} style={{ fontSize: '12px', padding: '6px 14px', background: 'rgba(16,185,129,0.1)', color: '#065F46', border: '1px solid rgba(16,185,129,0.2)', boxShadow: 'none' }}>
                                    ✅ Accept
                                  </button>
                                  <button onClick={() => handleStatusUpdate(app._id, job._id, 'rejected')} style={{ fontSize: '12px', padding: '6px 14px', background: 'rgba(239,68,68,0.08)', color: '#B91C1C', border: '1px solid rgba(239,68,68,0.15)', boxShadow: 'none' }}>
                                    ❌ Reject
                                  </button>
                                  <button
                                    onClick={() => setSchedulingAppId(schedulingAppId === app._id ? null : app._id)}
                                    style={{ fontSize: '12px', padding: '6px 14px', background: 'rgba(37,99,235,0.08)', color: 'var(--primary)', border: '1px solid rgba(37,99,235,0.15)', boxShadow: 'none' }}
                                  >
                                    📅 Schedule Interview
                                  </button>
                                </div>

                                {/* Interview form */}
                                {schedulingAppId === app._id && (
                                  <div style={{ marginTop: '14px', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', padding: '16px' }}>
                                    <div className="form-field">
                                      <label>Date & Time</label>
                                      <input type="datetime-local" value={interviewForm.scheduledAt} onChange={(e) => setInterviewForm({ ...interviewForm, scheduledAt: e.target.value })} />
                                    </div>
                                    <div className="form-field">
                                      <label>Location or Meeting Link</label>
                                      <input type="text" placeholder="https://meet.google.com/..." value={interviewForm.location} onChange={(e) => setInterviewForm({ ...interviewForm, location: e.target.value })} />
                                    </div>
                                    <div className="form-field">
                                      <label>Notes (optional)</label>
                                      <textarea rows={2} value={interviewForm.notes} onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                      <button onClick={() => handleScheduleInterview(app._id, job._id)} style={{ fontSize: '13px', padding: '8px 16px' }}>Send Invitation</button>
                                      <button onClick={() => setSchedulingAppId(null)} style={{ fontSize: '13px', padding: '8px 16px', background: 'transparent', color: 'var(--text-muted)', border: '1.5px solid var(--border)', boxShadow: 'none' }}>Cancel</button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}