import { useState, useEffect } from 'react';
import API from '../api/axios';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [skills, setSkills] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

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
    setMessage('');
    setError('');

    try {
      const res = await API.put(
        '/auth/profile',
        {
          name,
          email,
          currentPassword,
          newPassword,
          skills: skills.split(',').map((s) => s.trim()).filter((s) => s)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('Profile updated successfully!');

      // Update localStorage with new name/email
      localStorage.setItem('user', JSON.stringify({
        ...user,
        name: res.data.user.name,
        email: res.data.user.email
      }));

      setCurrentPassword('');
      setNewPassword('');

    } catch (err) {
      setError(err.response?.data?.message || 'Could not update profile');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error && !profile) return <p>{error}</p>;

  return (
    <div className="form-page" style={{ maxWidth: '500px' }}>
      <h2>My Profile</h2>

      {/* Profile info display */}
      <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--color-bg)', borderRadius: '8px' }}>
        <p style={{ margin: '4px 0' }}>
          <strong>Role:</strong>{' '}
          <span className={`status-pill ${profile?.role === 'admin' ? 'status-accepted' : profile?.role === 'recruiter' ? 'status-pending' : 'status-pill'}`}>
            {profile?.role}
          </span>
        </p>
        <p style={{ margin: '4px 0', fontSize: '13px', color: 'var(--color-text-muted)' }}>
          Member since {new Date(profile?.createdAt).toLocaleDateString()}
        </p>
        {profile?.skills?.length > 0 && (
          <p style={{ margin: '8px 0 0', fontSize: '13px' }}>
            <strong>Skills:</strong> {profile.skills.join(', ')}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Skills — only show for candidates */}
        {user?.role === 'candidate' && (
          <div className="form-field">
            <label>My Skills (comma separated)</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. React, Node.js, Python, SQL..."
            />
          </div>
        )}

        <hr style={{ border: '1px solid var(--color-border)', margin: '20px 0' }} />
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
          Leave password fields empty if you don't want to change it.
        </p>

        <div className="form-field">
          <label>Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password to change it"
          />
        </div>
        <div className="form-field">
          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />
        </div>

        <button type="submit">Save Changes</button>
      </form>

      {message && <p style={{ color: 'var(--color-accepted)', marginTop: '12px' }}>{message}</p>}
      {error && <p style={{ color: 'var(--color-rejected)', marginTop: '12px' }}>{error}</p>}
    </div>
  );
}

export default Profile;