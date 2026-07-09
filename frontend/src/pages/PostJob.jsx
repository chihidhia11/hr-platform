import { useState } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function PostJob() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [skillsRequired, setSkillsRequired] = useState('');
  const [salary, setSalary] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post(
        '/jobs',
        {
          title, description, company, location,
          skillsRequired: skillsRequired.split(',').map((s) => s.trim()),
          salary: salary ? Number(salary) : undefined
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('✅ Job posted successfully!', 'success');
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      showToast(error.response?.data?.message || 'Something went wrong', 'error');
      setLoading(false);
    }
  };

  // Live preview skills
  const previewSkills = skillsRequired
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)',
        padding: '48px 40px',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.9)', padding: '5px 14px',
            borderRadius: 'var(--r-full)', fontSize: '12px', fontWeight: 600,
            letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px'
          }}>
            💼 New Job Posting
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '36px',
            fontWeight: 900, color: 'white', marginBottom: '8px'
          }}>
            Post a Job Opening
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px' }}>
            Reach thousands of qualified candidates with AI-powered matching
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>

          {/* Form */}
          <div style={{
            background: 'white', border: '1px solid var(--border)',
            borderRadius: 'var(--r-xl)', padding: '36px',
            boxShadow: 'var(--shadow-md)'
          }}>
            <h2 style={{ fontSize: '20px', marginBottom: '24px', color: 'var(--text)' }}>
              Job Details
            </h2>

            <form onSubmit={handleSubmit}>

              {/* Title */}
              <div className="form-field">
                <label>Job Title *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', pointerEvents: 'none' }}>💼</span>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Developer"
                    required
                    style={{ paddingLeft: '42px' }}
                  />
                </div>
              </div>

              {/* Company + Location */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-field">
                  <label>Company *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', pointerEvents: 'none' }}>🏢</span>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Company name"
                      required
                      style={{ paddingLeft: '42px' }}
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label>Location *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', pointerEvents: 'none' }}>📍</span>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Tunis, Tunisia"
                      required
                      style={{ paddingLeft: '42px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="form-field">
                <label>Job Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
                  required
                />
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {description.length} characters
                </p>
              </div>

              {/* Skills */}
              <div className="form-field">
                <label>Required Skills *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', pointerEvents: 'none' }}>🎯</span>
                  <input
                    type="text"
                    value={skillsRequired}
                    onChange={(e) => setSkillsRequired(e.target.value)}
                    placeholder="React, Node.js, MongoDB, Python..."
                    required
                    style={{ paddingLeft: '42px' }}
                  />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Separate skills with commas — used for AI matching
                </p>
                {previewSkills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                    {previewSkills.map((skill, i) => (
                      <span key={i} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Salary */}
              <div className="form-field">
                <label>Salary (TND/month) — Optional</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', pointerEvents: 'none' }}>💰</span>
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="e.g. 2500"
                    style={{ paddingLeft: '42px' }}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '14px', fontSize: '15px',
                  fontWeight: 700, borderRadius: 'var(--r-md)',
                  background: loading ? '#94A3B8' : 'linear-gradient(135deg, var(--primary), #1D4ED8)',
                  justifyContent: 'center',
                  boxShadow: loading ? 'none' : 'var(--shadow-primary)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transform: 'none'
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(37,99,235,0.45)'; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-primary)'; }}
              >
                {loading ? (
                  <>
                    <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Publishing...
                  </>
                ) : '🚀 Publish Job →'}
              </button>
            </form>
          </div>

          {/* Right sidebar — tips + preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Live preview */}
            <div style={{
              background: 'white', border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)', padding: '24px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                👁️ Live Preview
              </h3>
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '16px', background: 'var(--bg)' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: 'var(--r-sm)',
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 800, fontSize: '16px', flexShrink: 0
                  }}>
                    {company?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '15px', margin: 0, color: 'var(--text)' }}>
                      {title || 'Job Title'}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                      {company || 'Company'} · {location || 'Location'}
                    </p>
                  </div>
                </div>
                {previewSkills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                    {previewSkills.map((skill, i) => (
                      <span key={i} style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 'var(--r-full)', fontSize: '11px', fontWeight: 600 }}>{skill}</span>
                    ))}
                  </div>
                )}
                {salary && (
                  <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>
                    💰 {Number(salary).toLocaleString()} TND
                  </p>
                )}
              </div>
            </div>

            {/* Tips */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(37,99,235,0.05), rgba(6,182,212,0.05))',
              border: '1px solid rgba(37,99,235,0.15)',
              borderRadius: 'var(--r-lg)', padding: '24px'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: 'var(--primary)' }}>
                💡 Tips for Better Results
              </h3>
              {[
                { icon: '🎯', tip: 'List specific skills — our AI uses them to match candidates automatically' },
                { icon: '📝', tip: 'Write a clear description — it increases application quality by 3x' },
                { icon: '💰', tip: 'Adding salary attracts 40% more qualified applicants' },
                { icon: '📍', tip: 'Include city and country for better candidate targeting' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: i < 3 ? '12px' : 0 }}>
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>{item.icon}</span>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{item.tip}</p>
                </div>
              ))}
            </div>

            {/* AI badge */}
            <div style={{
              background: 'linear-gradient(135deg, #0F172A, #1E3A5F)',
              borderRadius: 'var(--r-lg)', padding: '20px 24px',
              color: 'white', textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🤖</div>
              <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>AI-Powered Matching</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                Your job skills will be automatically matched against candidate CVs using our AI engine
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}