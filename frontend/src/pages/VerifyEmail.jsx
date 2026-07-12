import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let called = false;
    const verify = async () => {
      if (called) return;
      called = true;
      try {
        const res = await API.get(`/auth/verify/${token}`);
        setMessage(res.data.message);
        setStatus('success');
      } catch (err) {
        setMessage(err.response?.data?.message || 'Verification failed');
        setStatus('error');
      }
    };
    verify();
  }, [token]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', position: 'relative', overflow: 'hidden'
    }}>
      {/* Background dots */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '28px 28px'
      }} />

      {/* Blobs */}
      <div style={{
        position: 'absolute', top: '-20%', left: '-10%',
        width: '50%', height: '50%',
        background: 'radial-gradient(circle, rgba(37,99,235,0.3) 0%, transparent 70%)',
        borderRadius: '50%', animation: 'float 8s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', right: '-10%',
        width: '40%', height: '40%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.25) 0%, transparent 70%)',
        borderRadius: '50%', animation: 'float 10s ease-in-out infinite reverse'
      }} />

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 1,
        background: 'rgba(255,255,255,0.97)',
        borderRadius: '24px', padding: '48px 40px',
        maxWidth: '440px', width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        textAlign: 'center'
      }}>

        {/* Logo */}
        <div style={{ marginBottom: '32px' }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '22px', fontWeight: 800,
            color: '#0F172A', letterSpacing: '-0.03em'
          }}>
            HR<span style={{ color: '#2563EB' }}>Platform</span>
          </span>
        </div>

        {/* Status icon */}
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: status === 'loading'
            ? 'linear-gradient(135deg, #E2E8F0, #CBD5E1)'
            : status === 'success'
              ? 'linear-gradient(135deg, #10B981, #34D399)'
              : 'linear-gradient(135deg, #EF4444, #F87171)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '32px', margin: '0 auto 24px',
          boxShadow: status === 'success'
            ? '0 8px 24px rgba(16,185,129,0.3)'
            : status === 'error'
              ? '0 8px 24px rgba(239,68,68,0.3)'
              : 'none',
          transition: 'all 0.3s'
        }}>
          {status === 'loading' ? (
            <div style={{
              width: '28px', height: '28px',
              border: '3px solid rgba(255,255,255,0.3)',
              borderTop: '3px solid white',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite'
            }} />
          ) : status === 'success' ? '✓' : '✕'}
        </div>

        {/* Title */}
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '26px', fontWeight: 800,
          color: '#0F172A', marginBottom: '12px',
          letterSpacing: '-0.02em'
        }}>
          {status === 'loading' && 'Verifying...'}
          {status === 'success' && 'Email Verified! 🎉'}
          {status === 'error' && 'Verification Failed'}
        </h2>

        {/* Message */}
        <p style={{
          fontSize: '15px', color: '#64748B',
          lineHeight: 1.7, marginBottom: '32px'
        }}>
          {status === 'loading' && 'Please wait while we verify your email address...'}
          {status !== 'loading' && message}
        </p>

        {/* CTA */}
        {status === 'success' && (
          <Link to="/login" style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
            color: 'white', padding: '14px 32px',
            borderRadius: '10px', fontWeight: 700,
            fontSize: '15px', textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
            transition: 'all 0.2s'
          }}>
            Sign In Now →
          </Link>
        )}

        {status === 'error' && (
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
              color: 'white', padding: '12px 24px',
              borderRadius: '10px', fontWeight: 700,
              fontSize: '14px', textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(37,99,235,0.3)'
            }}>
              Register Again
            </Link>
            <Link to="/login" style={{
              display: 'inline-block',
              background: 'transparent',
              color: '#2563EB', padding: '12px 24px',
              borderRadius: '10px', fontWeight: 700,
              fontSize: '14px', textDecoration: 'none',
              border: '1.5px solid #2563EB'
            }}>
              Back to Login
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}