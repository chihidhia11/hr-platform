import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useToast } from '../context/ToastContext';
import { timeAgo } from '../utils/dateUtils';

const FILTER_CHIPS = [
  { label: '🌍 All', value: '' },
  { label: '⚛️ Frontend', value: 'React' },
  { label: '⚙️ Backend', value: 'Node.js' },
  { label: '🤖 AI / ML', value: 'Python' },
  { label: '🗄️ Database', value: 'MongoDB' },
  { label: '☁️ DevOps', value: 'Docker' },
];

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 14, width: '40%' }} />
        </div>
      </div>
      <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 14, width: '70%', marginBottom: 16 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 26, width: 72, borderRadius: 100 }} />)}
      </div>
    </div>
  );
}

function MatchCircle({ percentage }) {
  const color = percentage >= 75 ? '#10B981' : percentage >= 50 ? '#2563EB' : '#F59E0B';
  return (
    <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
      <svg width="52" height="52" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="26" cy="26" r="22" fill="none" stroke="#E2E8F0" strokeWidth="3" />
        <circle
          cx="26" cy="26" r="22" fill="none"
          stroke={color} strokeWidth="3"
          strokeDasharray={`${2 * Math.PI * 22}`}
          strokeDashoffset={`${2 * Math.PI * 22 * (1 - percentage / 100)}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '11px', fontWeight: 700, color
      }}>
        {percentage}%
      </div>
    </div>
  );
}

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resumeTextByJob, setResumeTextByJob] = useState({});
  const [cvFileByJob, setCvFileByJob] = useState({});
  const [search, setSearch] = useState('');
  const [activeChip, setActiveChip] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [recommendedJobs, setRecommendedJobs] = useState({});
  const [expandedJobs, setExpandedJobs] = useState({});
  const [appliedJobs, setAppliedJobs] = useState({});
  const [expandedApply, setExpandedApply] = useState({});

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
            const appRes = await API.get('/applications/my-applications', {
              headers: { Authorization: `Bearer ${token}` }
            });
            const applied = {};
            appRes.data.forEach((app) => { applied[app.job?._id] = true; });
            setAppliedJobs(applied);
          } catch (e) {}

          try {
            const profileRes = await API.get('/auth/profile', {
              headers: { Authorization: `Bearer ${token}` }
            });
            const skills = profileRes.data.skills;
            if (skills?.length > 0) {
              const recs = {};
              for (const job of res.data) {
                if (job.status === 'open' && job.skillsRequired?.length > 0) {
                  try {
                    const matchRes = await API.post('http://127.0.0.1:5001/match', {
                      cvText: skills.join(' '),
                      requiredSkills: job.skillsRequired
                    });
                    if (matchRes.data.matchPercentage >= 50) {
                      recs[job._id] = matchRes.data.matchPercentage;
                    }
                  } catch (e) {}
                }
              }
              setRecommendedJobs(recs);
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
      await API.post(`/applications/jobs/${jobId}/apply`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setAppliedJobs((prev) => ({ ...prev, [jobId]: true }));
      setExpandedApply((prev) => ({ ...prev, [jobId]: false }));
      showToast('✅ Application submitted successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not apply', 'error');
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.location.toLowerCase().includes(search.toLowerCase()) ||
      job.skillsRequired.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchesChip = !activeChip || job.skillsRequired.some((s) =>
      s.toLowerCase().includes(activeChip.toLowerCase())
    );
    return matchesSearch && matchesChip;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'salary-high') return (b.salary || 0) - (a.salary || 0);
    if (sortBy === 'salary-low') return (a.salary || 0) - (b.salary || 0);
    if (sortBy === 'applicants') return (b.applicantCount || 0) - (a.applicantCount || 0);
    if (sortBy === 'recommended') return (recommendedJobs[b._id] || 0) - (recommendedJobs[a._id] || 0);
    return 0;
  });

  const openJobs = jobs.filter(j => j.status === 'open').length;
  const recCount = Object.keys(recommendedJobs).length;

  return (
    <div>
      {/* ===== HERO ===== */}
      <div className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            ✨ AI-Powered Recruitment Platform
          </div>
          <h1>
            Find Your Next<br />
            <span className="gradient-text">Dream Opportunity</span>
          </h1>
          <p className="hero-subtitle">
            Discover jobs perfectly matched to your skills with our AI engine
          </p>

          <div className="hero-search-container">
            <span className="hero-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search jobs, companies, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <strong>{openJobs}</strong>
              Open Jobs
            </div>
            <div className="hero-stat">
              <strong>{recCount > 0 ? recCount : '—'}</strong>
              AI Matches
            </div>
            <div className="hero-stat">
              <strong>{jobs.reduce((sum, j) => sum + (j.applicantCount || 0), 0)}</strong>
              Applications
            </div>
          </div>

          {user && (
            <p style={{ marginTop: '24px', fontSize: '14px', color: 'rgba(255,255,255,0.55)' }}>
              Welcome back, <strong style={{ color: 'rgba(255,255,255,0.9)' }}>{user.name}</strong> 👋
            </p>
          )}
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '36px 24px 80px' }}>

        {/* Filter chips */}
        <div className="filter-chips">
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip.value}
              className={`chip ${activeChip === chip.value ? 'active' : ''}`}
              onClick={() => setActiveChip(chip.value)}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text)' }}>{sortedJobs.length}</strong> jobs found
          </p>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: '180px' }}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="salary-high">Salary: High to Low</option>
            <option value="salary-low">Salary: Low to High</option>
            <option value="applicants">Most Applicants</option>
            {user?.role === 'candidate' && <option value="recommended">Best Match</option>}
          </select>
        </div>

        {/* Loading skeletons */}
        {loading && [1,2,3].map(i => <SkeletonCard key={i} />)}

        {!loading && error && (
          <div className="empty-state">
            <h3>Something went wrong</h3>
            <p>{error}</p>
          </div>
        )}

        {!loading && sortedJobs.length === 0 && (
          <div className="empty-state">
            <h3>{search || activeChip ? '🔍 No jobs match your filters' : '📭 No jobs available yet'}</h3>
            <p>{search || activeChip ? 'Try different keywords or clear your filters.' : 'Check back later for new opportunities.'}</p>
          </div>
        )}

        {!loading && sortedJobs.map((job) => (
          <div key={job._id} className="job-card">

            {/* Card header */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div className="company-avatar">
                {job.company?.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div>
                    <h3 style={{ marginBottom: '2px' }}>{job.title}</h3>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>
                      {job.company} · {job.location}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                    {recommendedJobs[job._id] && <MatchCircle percentage={recommendedJobs[job._id]} />}
                    {job.salary && (
                      <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                        {job.salary.toLocaleString()} TND
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="skills-tags">
              {job.skillsRequired.map((skill) => (
                <span key={skill} className="skill-tag">{skill}</span>
              ))}
              {job.status === 'closed' && (
                <span className="status-pill status-rejected">🔒 Closed</span>
              )}
            </div>

            {/* Description */}
            {job.description && (
              <div style={{ marginBottom: '16px' }}>
                <p className="description-text">
                  {expandedJobs[job._id]
                    ? job.description
                    : job.description.length > 120
                      ? job.description.slice(0, 120) + '...'
                      : job.description}
                </p>
                {job.description.length > 120 && (
                  <button className="toggle-link" onClick={() => setExpandedJobs(p => ({ ...p, [job._id]: !p[job._id] }))}>
                    {expandedJobs[job._id] ? 'Show less ↑' : 'Read more ↓'}
                  </button>
                )}
              </div>
            )}

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: 'var(--primary-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700, color: 'var(--primary)'
                }}>
                  {job.postedBy?.name?.charAt(0)}
                </div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', margin: 0 }}>{job.postedBy?.name}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{timeAgo(job.createdAt)}</p>
                </div>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                👥 {job.applicantCount || 0} applicants
              </span>
            </div>

            {/* Apply section */}
            {user && user.role === 'candidate' && job.status === 'open' && (
              <div style={{ marginTop: '16px' }}>
                {appliedJobs[job._id] ? (
                  <button disabled style={{
                    background: 'var(--surface-2)',
                    color: 'var(--text-muted)',
                    border: '1.5px solid var(--border)',
                    cursor: 'not-allowed',
                    transform: 'none',
                    boxShadow: 'none',
                    width: '100%',
                    justifyContent: 'center'
                  }}>
                    ✅ Already Applied
                  </button>
                ) : expandedApply[job._id] ? (
                  <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--r-md)', padding: '20px' }}>
                    <div className="form-field">
                      <label>Upload CV (PDF) — recommended for AI matching</label>
                      <input
                        type="file" accept=".pdf"
                        onChange={(e) => setCvFileByJob(p => ({ ...p, [job._id]: e.target.files[0] }))}
                      />
                      {cvFileByJob[job._id] && (
                        <p style={{ fontSize: '12px', color: 'var(--primary)', marginTop: '6px', fontWeight: 500 }}>
                          ✅ {cvFileByJob[job._id].name}
                        </p>
                      )}
                    </div>
                    {!cvFileByJob[job._id] && (
                      <div className="form-field">
                        <label>Or paste your CV text</label>
                        <textarea
                          rows={3}
                          placeholder="e.g. Experienced developer skilled in React, Node.js..."
                          value={resumeTextByJob[job._id] || ''}
                          onChange={(e) => setResumeTextByJob(p => ({ ...p, [job._id]: e.target.value }))}
                        />
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                      <button onClick={() => handleApply(job._id)} style={{ flex: 1, justifyContent: 'center' }}>
                        Submit Application →
                      </button>
                      <button
                        onClick={() => setExpandedApply(p => ({ ...p, [job._id]: false }))}
                        style={{ background: 'transparent', color: 'var(--text-muted)', border: '1.5px solid var(--border)', boxShadow: 'none' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setExpandedApply(p => ({ ...p, [job._id]: true }))}
                    style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, var(--primary), #1D4ED8)' }}
                  >
                    Apply Now →
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}