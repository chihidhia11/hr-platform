import { useState, useEffect } from 'react';
import API from '../api/axios';

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyMessage, setApplyMessage] = useState({});
  const [resumeTextByJob, setResumeTextByJob] = useState({});
  const [cvFileByJob, setCvFileByJob] = useState({});
  const [search, setSearch] = useState('');
  const [recommendedJobs, setRecommendedJobs] = useState({});
  const [expandedJobs, setExpandedJobs] = useState({});

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await API.get('/jobs');
        setJobs(res.data);

        if (user && user.role === 'candidate' && token) {
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
                  } catch (e) {
                    // AI service down, skip recommendations silently
                  }
                }
              }

              setRecommendedJobs(recommendations);
            }
          } catch (e) {
            // Profile fetch failed, skip recommendations
          }
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

      setApplyMessage((prev) => ({ ...prev, [jobId]: '✅ Applied successfully!' }));

    } catch (err) {
      setApplyMessage((prev) => ({
        ...prev,
        [jobId]: err.response?.data?.message || 'Could not apply'
      }));
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

      <input
        type="text"
        placeholder="Search by title, company, location or skill..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: '100%', marginBottom: '20px' }}
      />

      {filteredJobs.length === 0 && (
        <div className="empty-state">
          <h3>{search ? '🔍 No jobs match your search' : '📭 No jobs available yet'}</h3>
          <p>{search ? 'Try different keywords or clear your search.' : 'Check back later for new opportunities.'}</p>
        </div>
      )}

      {filteredJobs.map((job) => (
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

          {/* Skills as tags */}
          <div className="skills-tags">
            {job.skillsRequired.map((skill) => (
              <span key={skill} className="skill-tag">{skill}</span>
            ))}
          </div>

          {/* Description with toggle */}
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
          <p><strong>Posted by:</strong> {job.postedBy?.name}</p>

          {job.status === 'closed' && (
            <span className="status-pill status-rejected" style={{ marginBottom: '10px', display: 'inline-block' }}>
              Closed — no longer accepting applications
            </span>
          )}

          {user && user.role === 'candidate' && job.status === 'open' && (
            <div style={{ marginTop: '12px' }}>
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

              <button onClick={() => handleApply(job._id)}>
                Apply
              </button>
            </div>
          )}

          {applyMessage[job._id] && (
            <p style={{ marginTop: '8px', color: applyMessage[job._id].startsWith('✅') ? 'var(--color-accepted)' : 'var(--color-rejected)' }}>
              {applyMessage[job._id]}
            </p>
          )}
        </div>
      ))}
      </div>
    </div>
  );
}

export default Jobs;