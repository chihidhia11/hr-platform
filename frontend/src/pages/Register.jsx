import { useState } from 'react';
import API from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('candidate');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/auth/register', { name, email, password, role });
      showToast('🎉 Account created! Redirecting...', 'success');
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      showToast(error.response?.data?.message || 'Something went wrong', 'error');
      setLoading(false);
    }
  };

  const inputStyle = (focused) => ({
    paddingLeft: '44px',
    border: `1.5px solid ${focused ? '#2563EB' : '#E2E8F0'}`,
    boxShadow: focused ? '0 0 0 4px rgba(37,99,235,0.1)' : 'none',
    borderRadius: '10px',
    transition: 'all 0.2s',
    background: 'white',
    fontSize: '14px',
    padding: '12px 14px 12px 44px',
    width: '100%'
  });

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: 'var(--font-body)',
      background: '#0F172A'
    }}>

      {/* ===== LEFT SIDE ===== */}
      <div style={{
        flex: '0 0 55%',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 40%, #0C4A6E 70%, #164E63 100%)',
      }}>

        {/* Animated blobs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', top: '-20%', right: '-10%',
            width: '55%', height: '55%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.3) 0%, transparent 70%)',
            animation: 'float 9s ease-in-out infinite',
            borderRadius: '50%'
          }} />
          <div style={{
            position: 'absolute', bottom: '-15%', left: '-10%',
            width: '45%', height: '45%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.25) 0%, transparent 70%)',
            animation: 'float 11s ease-in-out infinite reverse',
            borderRadius: '50%'
          }} />
          <div style={{
            position: 'absolute', top: '35%', left: '5%',
            width: '25%', height: '25%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)',
            animation: 'float 7s ease-in-out infinite',
            borderRadius: '50%'
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '28px 28px'
          }} />
        </div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '480px', width: '100%' }}>

          {/* Logo */}
          <div style={{ marginBottom: '48px' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '24px',
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-0.03em'
            }}>
              HR<span style={{ color: '#06B6D4' }}>Platform</span>
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '48px',
            fontWeight: 900,
            color: 'white',
            lineHeight: 1.1,
            marginBottom: '20px',
            letterSpacing: '-0.03em'
          }}>
            Start Your<br />
            <span style={{
              background: 'linear-gradient(90deg, #60A5FA, #06B6D4, #34D399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Journey.</span>
          </h1>

          <p style={{
            fontSize: '17px',
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.7,
            marginBottom: '48px',
            maxWidth: '360px'
          }}>
            Join thousands of professionals finding their dream jobs with AI-powered matching.
          </p>

          {/* Floating stat cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { icon: '🚀', label: 'Get Started in 60 Seconds', sub: 'Quick & easy signup', color: 'rgba(37,99,235,0.3)' },
              { icon: '🤖', label: 'AI Matches Your Skills', sub: 'Personalized job recommendations', color: 'rgba(6,182,212,0.3)' },
              { icon: '📧', label: 'Instant Notifications', sub: 'Never miss an opportunity', color: 'rgba(124,58,237,0.3)' },
            ].map((card, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '14px',
                padding: '14px 18px',
                animation: `slideUp 0.6s ease ${i * 0.1 + 0.2}s both`,
                transition: 'background 0.2s ease',
                cursor: 'default'
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: card.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', flexShrink: 0
                }}>
                  {card.icon}
                </div>
                <div>
                  <p style={{ color: 'white', fontWeight: 700, fontSize: '14px', margin: 0 }}>{card.label}</p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: 0 }}>{card.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== RIGHT SIDE ===== */}
      <div style={{
        flex: '0 0 45%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px 48px',
        background: '#F8FAFC',
        overflowY: 'auto'
      }}>

        <div style={{ width: '100%', maxWidth: '380px' }}>

          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '32px',
              fontWeight: 800,
              color: '#0F172A',
              marginBottom: '8px',
              letterSpacing: '-0.02em'
            }}>
              Create Account ✨
            </h2>
            <p style={{ color: '#64748B', fontSize: '15px', lineHeight: 1.6 }}>
              Join HRPlatform and find your dream job today.
            </p>
          </div>

          {/* Role selector */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            {['candidate', 'recruiter'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  border: `1.5px solid ${role === r ? '#2563EB' : '#E2E8F0'}`,
                  background: role === r ? 'rgba(37,99,235,0.06)' : 'white',
                  color: role === r ? '#2563EB' : '#64748B',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  boxShadow: role === r ? '0 0 0 4px rgba(37,99,235,0.08)' : 'none',
                  transform: 'none'
                }}
              >
                {r === 'candidate' ? '👤 Candidate' : '🏢 Recruiter'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>

            {/* Name */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: '#64748B', marginBottom: '6px', display: 'block'
              }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  fontSize: '16px', pointerEvents: 'none'
                }}>👤</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  placeholder="Dhia Chihi"
                  required
                  style={inputStyle(nameFocused)}
                />
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: '#64748B', marginBottom: '6px', display: 'block'
              }}>Email</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  fontSize: '16px', pointerEvents: 'none'
                }}>✉️</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  placeholder="you@example.com"
                  required
                  style={inputStyle(emailFocused)}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: '#64748B', marginBottom: '6px', display: 'block'
              }}>Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  fontSize: '16px', pointerEvents: 'none'
                }}>🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder="••••••••"
                  required
                  style={{ ...inputStyle(passwordFocused), paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '16px', padding: '4px', boxShadow: 'none', color: '#94A3B8'
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '15px',
                fontWeight: 700,
                borderRadius: '10px',
                background: loading
                  ? '#94A3B8'
                  : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 50%, #1E40AF 100%)',
                color: 'white',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(37,99,235,0.35)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '24px',
                letterSpacing: '0.01em',
                transform: 'none'
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 28px rgba(37,99,235,0.45)';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,99,235,0.35)';
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px', height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite'
                  }} />
                  Creating account...
                </>
              ) : (
                <>Create Account →</>
              )}
            </button>

            {/* Login link */}
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748B' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#2563EB', fontWeight: 700 }}>
                Sign In →
              </Link>
            </p>

          </form>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .login-left { display: none !important; }
        }
      `}</style>
    </div>
  );
}