import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useToast } from '../context/ToastContext';
import { timeAgo } from '../utils/dateUtils';

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resumeTextByJob, setResumeTextByJob] = useState({});
  const [cvFileByJob, setCvFileByJob] = useState({});
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [recommendedJobs, setRecommendedJobs] = useState({});
  const [expandedJobs, setExpandedJobs] = useState({});
  const [appliedJobs, setAppliedJobs] = useState({});

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const { showToast } = useToast();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await API.get('/jobs');
        setJobs(res.data);

        if (user && user.role === 'candidate' && token) {
          try {
            const applicationsRes = await API.get('/applications/my-applications', {
              headers: { Authorization: `Bearer ${token}` }
            });
            const applied = {};
            applicationsRes.data.forEach((app) => {
              applied[app.job?._id] = true;
            });
            setAppliedJobs(applied);
          } catch (e) {}

          try {
            const profileRes = await API.get('/auth/profile', {
              headers: { Authorization: `Bearer ${token}` }
            });

            const candidateSkills = profileRes.data.skills;

            if (candidateSkills && candidateSkills.length > 0) {
              const recommendations = {};

              for (const job of res.data) {
                if (job.status === 'open' && job.skillsRequired?.length > 0) {
                  try {
                    const matchRes = await API.post(
                      'http://127.0.0.1:5001/match',
                      {
                        cvText: candidateSkills.join(' '),
                        requiredSkills: job.skillsRequired
                      }
                    );
                    if (matchRes.data.matchPercentage >= 50) {
                      recommendations[job._id] = matchRes.data.matchPercentage;
                    }
                  } catch (e) {}
                }
              }

              setRecommendedJobs(recommendations);
            }
          } catch (e) {}
        }

      } catch (err) {
        setError('Could not load jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleApply = async (jobId) => {
    try {
      const formData = new FormData();

      if (cvFileByJob[jobId]) {
        formData.append('cv', cvFileByJob[jobId]);
      } else {
        formData.append('resumeText', resumeTextByJob[jobId] || '');
      }

      await API.post(
        `/applications/jobs/${jobId}/apply`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setAppliedJobs((prev) => ({ ...prev, [jobId]: true }));
      showToast('✅ Application submitted successfully!', 'success');

    } catch (err) {
      showToast(err.response?.data?.message || 'Could not apply', 'error');
    }
  };

  const toggleDescription = (jobId) => {
    setExpandedJobs((prev) => ({ ...prev, [jobId]: !prev[jobId] }));
  };

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    job.company.toLowerCase().includes(search.toLowerCase()) ||
    job.location.toLowerCase().includes(search.toLowerCase()) ||
    job.skillsRequired.some((skill) => skill.toLowerCase().includes(search.toLowerCase()))
  );

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'salary-high') return (b.salary || 0) - (a.salary || 0);
    if (sortBy === 'salary-low') return (a.salary || 0) - (b.salary || 0);
    if (sortBy === 'applicants') return (b.applicantCount || 0) - (a.applicantCount || 0);
    if (sortBy === 'recommended') {
      const aMatch = recommendedJobs[a._id] || 0;
      const bMatch = recommendedJobs[b._id] || 0;
      return bMatch - aMatch;
    }
    return 0;
  });

  if (loading) return <div className="spinner"></div>;
  if (error) return (
    <div className="empty-state">
      <h3>Something went wrong</h3>
      <p>{error}</p>
    </div>
  );

  return (
    <div>
      <h2 className="page-title">Available Jobs</h2>
      <div className="page-container">

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by title, company, location or skill..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ width: '160px' }}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="salary-high">Salary: High to Low</option>
          <option value="salary-low">Salary: Low to High</option>
          <option value="applicants">Most Applicants</option>
          {user?.role === 'candidate' && <option value="recommended">Best Match</option>}
        </select>
      </div>

      {sortedJobs.length === 0 && (
        <div className="empty-state">
          <h3>{search ? '🔍 No jobs match your search' : '📭 No jobs available yet'}</h3>
          <p>{search ? 'Try different keywords or clear your search.' : 'Check back later for new opportunities.'}</p>
        </div>
      )}

      {sortedJobs.map((job) => (
        <div key={job._id} className="job-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ margin: 0 }}>{job.title}</h3>
            {recommendedJobs[job._id] && (
              <span style={{
                background: 'rgba(15, 118, 110, 0.12)',
                color: 'var(--color-accent)',
                padding: '4px 10px',
                borderRadius: '100px',
                fontSize: '12px',
                fontWeight: 700
              }}>
                ⭐ Recommended — {recommendedJobs[job._id]}% match
              </span>
            )}
          </div>

          <p><strong>Company:</strong> {job.company} &nbsp;·&nbsp; <strong>Location:</strong> {job.location}</p>

          <div className="skills-tags">
            {job.skillsRequired.map((skill) => (
              <span key={skill} className="skill-tag">{skill}</span>
            ))}
          </div>

          {job.description && (
            <div>
              <p className="description-text">
                {expandedJobs[job._id]
                  ? job.description
                  : job.description.length > 100
                    ? job.description.slice(0, 100) + '...'
                    : job.description
                }
              </p>
              {job.description.length > 100 && (
                <button className="toggle-link" onClick={() => toggleDescription(job._id)}>
                  {expandedJobs[job._id] ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          )}

          {job.salary && <p style={{ marginTop: '8px' }}><strong>Salary:</strong> {job.salary} TND</p>}

          <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><strong>Posted by:</strong> {job.postedBy?.name} · <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>{timeAgo(job.createdAt)}</span></span>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              👥 {job.applicantCount || 0} {job.applicantCount === 1 ? 'applicant' : 'applicants'}
            </span>
          </p>

          {job.status === 'closed' && (
            <span className="status-pill status-rejected" style={{ marginBottom: '10px', display: 'inline-block' }}>
              Closed — no longer accepting applications
            </span>
          )}

          {user && user.role === 'candidate' && job.status === 'open' && (
            <div style={{ marginTop: '12px' }}>
              {appliedJobs[job._id] ? (
                <button disabled style={{ background: 'var(--color-text-muted)', cursor: 'not-allowed', opacity: 0.7 }}>
                  ✅ Already Applied
                </button>
              ) : (
                <>
                  <div className="form-field">
                    <label>Upload CV (PDF) — recommended for AI matching</label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setCvFileByJob((prev) => ({ ...prev, [job._id]: e.target.files[0] }))}
                    />
                    {cvFileByJob[job._id] && (
                      <p style={{ fontSize: '13px', color: 'var(--color-accent)', marginTop: '4px' }}>
                        ✅ {cvFileByJob[job._id].name} selected
                      </p>
                    )}
                  </div>

                  {!cvFileByJob[job._id] && (
                    <div className="form-field">
                      <label>Or paste your CV text (optional)</label>
                      <textarea
                        id={`resume-${job._id}`}
                        rows={3}
                        style={{ width: '100%' }}
                        placeholder="e.g. Experienced developer skilled in React, Node.js..."
                        value={resumeTextByJob[job._id] || ''}
                        onChange={(e) =>
                          setResumeTextByJob((prev) => ({ ...prev, [job._id]: e.target.value }))
                        }
                      />
                    </div>
                  )}

                  <button onClick={() => handleApply(job._id)}>Apply</button>
                </>
              )}
            </div>
          )}
        </div>
      ))}
      </div>
    </div>
  );
}

export default Jobs;