import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useToast } from '../context/ToastContext';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [skills, setSkills] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
        setName(res.data.name);
        setEmail(res.data.email);
        setSkills(res.data.skills?.join(', ') || '');
      } catch (err) {
        setError('Could not load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await API.put(
        '/auth/profile',
        {
          name, email, currentPassword, newPassword,
          skills: skills.split(',').map((s) => s.trim()).filter((s) => s)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem('user', JSON.stringify({ ...user, name: res.data.user.name, email: res.data.user.email }));
      setCurrentPassword('');
      setNewPassword('');
      showToast('✅ Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const previewSkills = skills.split(',').map(s => s.trim()).filter(s => s.length > 0);

  const roleConfig = {
    candidate: { bg: 'rgba(16,185,129,0.1)', color: '#065F46', label: 'Candidate', icon: '👤' },
    recruiter: { bg: 'rgba(37,99,235,0.1)', color: '#1D4ED8', label: 'Recruiter', icon: '🏢' },
    admin: { bg: 'rgba(124,58,237,0.1)', color: '#6D28D9', label: 'Admin', icon: '⚡' }
  };

  const role = profile ? roleConfig[profile.role] : null;

  if (loading) return <div className="spinner"></div>;
  if (error) return <div className="empty-state"><h3>Something went wrong</h3><p>{error}</p></div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Hero header */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)',
        padding: '0 40px 80px',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />

        {/* Avatar section */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '860px', margin: '0 auto', paddingTop: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px' }}>
            {/* Large avatar */}
            <div style={{
              width: '96px', height: '96px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '36px', fontWeight: 800,
              fontFamily: 'var(--font-display)',
              border: '4px solid rgba(255,255,255,0.15)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              flexShrink: 0
            }}>
              {name?.charAt(0)?.toUpperCase()}
            </div>
            <div style={{ paddingBottom: '8px' }}>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '28px', fontWeight: 900,
                color: 'white', marginBottom: '8px'
              }}>
                {name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '4px 12px', borderRadius: 'var(--r-full)',
                  fontSize: '12px', fontWeight: 700,
                  background: role?.bg, color: role?.color
                }}>
                  {role?.icon} {role?.label}
                </span>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                  Member since {new Date(profile?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                {previewSkills.length > 0 && (
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                    · {previewSkills.length} skills
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '860px', margin: '-40px auto 0', padding: '0 24px 80px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>

          {/* Main form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Personal info card */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                👤 Personal Information
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-field">
                  <label>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', pointerEvents: 'none' }}>👤</span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      style={{ paddingLeft: '42px' }}
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', pointerEvents: 'none' }}>✉️</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{ paddingLeft: '42px' }}
                    />
                  </div>
                </div>
              </div>

              <div className="form-field" style={{ marginBottom: 0 }}>
                <label>Role</label>
                <div style={{
                  padding: '11px 14px',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--r-sm)',
                  background: 'var(--surface-2)',
                  fontSize: '14px',
                  color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  {role?.icon} {role?.label}
                  <span style={{ fontSize: '12px', color: 'var(--text-light)', marginLeft: '4px' }}>(cannot be changed)</span>
                </div>
              </div>
            </div>

            {/* Skills card — candidates only */}
            {user?.role === 'candidate' && (
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🎯 My Skills
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Used by AI to recommend matching jobs automatically
                </p>

                <div className="form-field">
                  <label>Skills (comma separated)</label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="React, Node.js, Python, SQL, MongoDB..."
                  />
                </div>

                {previewSkills.length > 0 && (
                  <div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>PREVIEW:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {previewSkills.map((skill, i) => (
                        <span key={i} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Password card */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🔒 Change Password
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Leave empty if you don't want to change your password
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-field" style={{ marginBottom: 0 }}>
                  <label>Current Password</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', pointerEvents: 'none' }}>🔒</span>
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Current password"
                      style={{ paddingLeft: '42px', paddingRight: '42px' }}
                    />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px', boxShadow: 'none', color: '#94A3B8' }}>
                      {showCurrentPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <div className="form-field" style={{ marginBottom: 0 }}>
                  <label>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', pointerEvents: 'none' }}>✨</span>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password"
                      style={{ paddingLeft: '42px', paddingRight: '42px' }}
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px', boxShadow: 'none', color: '#94A3B8' }}>
                      {showNewPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Save button */}
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '14px', fontSize: '15px', fontWeight: 700,
                borderRadius: 'var(--r-md)', justifyContent: 'center',
                background: saving ? '#94A3B8' : 'linear-gradient(135deg, var(--primary), #1D4ED8)',
                boxShadow: saving ? 'none' : 'var(--shadow-primary)',
                cursor: saving ? 'not-allowed' : 'pointer', transform: 'none'
              }}
              onMouseEnter={e => { if (!saving) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(37,99,235,0.45)'; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-primary)'; }}
            >
              {saving ? (
                <>
                  <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Saving...
                </>
              ) : '💾 Save Changes'}
            </button>
          </form>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '88px' }}>

            {/* Profile card */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)', textAlign: 'center' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '24px', fontWeight: 800,
                fontFamily: 'var(--font-display)', margin: '0 auto 12px'
              }}>
                {name?.charAt(0)?.toUpperCase()}
              </div>
              <p style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>{name}</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>{email}</p>
              <span style={{
                padding: '4px 12px', borderRadius: 'var(--r-full)',
                fontSize: '12px', fontWeight: 700,
                background: role?.bg, color: role?.color
              }}>
                {role?.icon} {role?.label}
              </span>
            </div>

            {/* Stats */}
            {user?.role === 'candidate' && previewSkills.length > 0 && (
              <div style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.05), rgba(6,182,212,0.05))', border: '1px solid rgba(37,99,235,0.15)', borderRadius: 'var(--r-lg)', padding: '20px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  🤖 AI Profile
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.5 }}>
                  Your skills are used to automatically recommend matching jobs
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {previewSkills.slice(0, 6).map((skill, i) => (
                    <span key={i} style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '3px 10px', borderRadius: 'var(--r-full)', fontSize: '11px', fontWeight: 600 }}>
                      {skill}
                    </span>
                  ))}
                  {previewSkills.length > 6 && (
                    <span style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', padding: '3px 10px', borderRadius: 'var(--r-full)', fontSize: '11px', fontWeight: 600 }}>
                      +{previewSkills.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Security tip */}
            <div style={{ background: 'linear-gradient(135deg, #0F172A, #1E3A5F)', borderRadius: 'var(--r-lg)', padding: '20px', color: 'white' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>🔐 Security Tips</p>
              <ul style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', paddingLeft: '16px', lineHeight: 1.8, margin: 0 }}>
                <li>Use a strong, unique password</li>
                <li>Never share your credentials</li>
                <li>Log out on shared devices</li>
              </ul>
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