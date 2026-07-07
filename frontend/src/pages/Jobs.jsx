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

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await API.get('/jobs');
        setJobs(res.data);
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

      // If a PDF was selected, use it
      if (cvFileByJob[jobId]) {
        formData.append('cv', cvFileByJob[jobId]);
      } else {
        // Otherwise use text input
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

      setApplyMessage((prev) => ({ ...prev, [jobId]: 'Applied successfully!' }));

    } catch (err) {
      setApplyMessage((prev) => ({
        ...prev,
        [jobId]: err.response?.data?.message || 'Could not apply'
      }));
    }
  };

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    job.company.toLowerCase().includes(search.toLowerCase()) ||
    job.location.toLowerCase().includes(search.toLowerCase()) ||
    job.skillsRequired.some((skill) => skill.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <p>Loading jobs...</p>;
  if (error) return <p>{error}</p>;

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

      {filteredJobs.length === 0 && <p>No jobs found.</p>}

      {filteredJobs.map((job) => (
        <div key={job._id} className="job-card">
          <h3>{job.title}</h3>
          <p><strong>Company:</strong> {job.company}</p>
          <p><strong>Location:</strong> {job.location}</p>
          <p><strong>Skills:</strong> {job.skillsRequired.join(', ')}</p>
          {job.salary && <p><strong>Salary:</strong> {job.salary} TND</p>}
          <p><strong>Posted by:</strong> {job.postedBy?.name}</p>

          {job.status === 'closed' && (
            <span className="status-pill status-rejected" style={{ marginBottom: '10px', display: 'inline-block' }}>
              Closed — no longer accepting applications
            </span>
          )}

          {user && user.role === 'candidate' && job.status === 'open' && (
            <div style={{ marginTop: '12px' }}>

              {/* PDF Upload Option */}
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

              {/* Text fallback — only show if no PDF selected */}
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

          {applyMessage[job._id] && <p>{applyMessage[job._id]}</p>}
        </div>
      ))}
      </div>
    </div>
  );
}

export default Jobs;