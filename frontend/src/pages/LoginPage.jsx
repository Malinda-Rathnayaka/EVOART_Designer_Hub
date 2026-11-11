import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Layers, Lock, Mail, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        background:
          'radial-gradient(ellipse 60% 50% at 15% 10%, rgba(124, 58, 237, 0.35) 0%, transparent 60%), radial-gradient(ellipse 50% 45% at 85% 90%, rgba(34, 211, 238, 0.22) 0%, transparent 60%), #05060a',
      }}
    >
      {/* Split card: brand panel + form panel */}
      <div
        style={{
          width: '100%',
          maxWidth: '920px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          borderRadius: '28px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(13, 16, 27, 0.75)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow:
            '0 30px 80px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(124, 58, 237, 0.08), 0 0 120px rgba(124, 58, 237, 0.12)',
          animation: 'loginFade 0.6s ease both',
        }}
      >
        {/* ---------- LEFT: Brand / visual panel ---------- */}
        <div
          className="login-brand-panel"
          style={{
            position: 'relative',
            padding: '3rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background:
              'linear-gradient(160deg, rgba(124, 58, 237, 0.45) 0%, rgba(37, 24, 84, 0.55) 45%, rgba(9, 12, 20, 0.9) 100%)',
            borderRight: '1px solid rgba(255, 255, 255, 0.06)',
            overflow: 'hidden',
          }}
        >
          {/* Decorative orbs */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              width: '260px',
              height: '260px',
              borderRadius: '50%',
              top: '-90px',
              left: '-90px',
              background:
                'radial-gradient(circle, rgba(167, 139, 250, 0.55) 0%, transparent 70%)',
              filter: 'blur(10px)',
              pointerEvents: 'none',
            }}
          />
          <div
            aria-hidden
            style={{
              position: 'absolute',
              width: '320px',
              height: '320px',
              borderRadius: '50%',
              bottom: '-140px',
              right: '-120px',
              background:
                'radial-gradient(circle, rgba(34, 211, 238, 0.35) 0%, transparent 70%)',
              filter: 'blur(14px)',
              pointerEvents: 'none',
            }}
          />
          {/* Subtle grid overlay */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
              backgroundSize: '44px 44px',
              maskImage:
                'radial-gradient(ellipse at 30% 30%, #000 30%, transparent 75%)',
              WebkitMaskImage:
                'radial-gradient(ellipse at 30% 30%, #000 30%, transparent 75%)',
              pointerEvents: 'none',
            }}
          />

          {/* Brand mark */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background:
                    'linear-gradient(135deg, #a78bfa 0%, #6366f1 55%, #22d3ee 100%)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow:
                    '0 10px 28px rgba(124, 58, 237, 0.55), inset 0 1px 0 rgba(255,255,255,0.35)',
                }}
              >
                <Layers size={22} color="#ffffff" />
              </div>
              <div>
                <div
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    letterSpacing: '0.14em',
                    color: '#ffffff',
                  }}
                >
                  EVO <span style={{ color: '#22d3ee' }}>ART</span>
                </div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    letterSpacing: '0.28em',
                    textTransform: 'uppercase',
                    color: 'rgba(226, 232, 240, 0.55)',
                  }}
                >
                  Designer Platform
                </div>
              </div>
            </div>
          </div>

          {/* Headline */}
          <div style={{ position: 'relative', zIndex: 1, margin: '2.5rem 0' }}>
            <h2
              style={{
                fontSize: '2.1rem',
                lineHeight: 1.18,
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                marginBottom: '0.9rem',
              }}
            >
              Craft your
              <br />
              <span
                style={{
                  background:
                    'linear-gradient(90deg, #c4b5fd 0%, #22d3ee 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                visual universe.
              </span>
            </h2>
            <p
              style={{
                fontSize: '0.9rem',
                lineHeight: 1.65,
                color: 'rgba(203, 213, 225, 0.72)',
                maxWidth: '300px',
              }}
            >
              A workspace built for designers — assets, boards and collaboration
              in one calm, dark canvas.
            </p>
          </div>

          {/* Footer micro-copy */}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.72rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(148, 163, 184, 0.55)',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#22d3ee',
                boxShadow: '0 0 10px #22d3ee',
              }}
            />
            Secure workspace access
          </div>
        </div>

        {/* ---------- RIGHT: Form panel ---------- */}
        <div
          style={{
            padding: '3rem 2.75rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div style={{ marginBottom: '2rem' }}>
            <h1
              style={{
                fontSize: '1.6rem',
                fontWeight: 800,
                color: '#f8fafc',
                letterSpacing: '-0.02em',
                marginBottom: '0.4rem',
              }}
            >
              Welcome back
            </h1>
            <p style={{ fontSize: '0.86rem', color: 'rgba(148, 163, 184, 0.85)' }}>
              Sign in to continue to your workspace.
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '14px',
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.32)',
                color: '#fb7185',
                fontSize: '0.82rem',
                marginBottom: '1.4rem',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="form-group">
              <label
                className="form-label"
                style={{
                  fontSize: '0.74rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'rgba(148, 163, 184, 0.9)',
                  fontWeight: 600,
                }}
              >
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  id="input-login-email"
                  style={{
                    paddingLeft: '2.75rem',
                    height: '50px',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.035)',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    color: '#f1f5f9',
                    fontSize: '0.9rem',
                    transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(167, 139, 250, 0.65)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.055)';
                    e.target.style.boxShadow = '0 0 0 4px rgba(124, 58, 237, 0.14)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.09)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.035)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <Mail
                  size={17}
                  color="rgba(148, 163, 184, 0.8)"
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group" style={{ marginBottom: '1.9rem' }}>
              <label
                className="form-label"
                style={{
                  fontSize: '0.74rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'rgba(148, 163, 184, 0.9)',
                  fontWeight: 600,
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  id="input-login-password"
                  style={{
                    paddingLeft: '2.75rem',
                    height: '50px',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.035)',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    color: '#f1f5f9',
                    fontSize: '0.9rem',
                    transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(34, 211, 238, 0.6)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.055)';
                    e.target.style.boxShadow = '0 0 0 4px rgba(34, 211, 238, 0.12)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.09)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.035)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <Lock
                  size={17}
                  color="rgba(148, 163, 184, 0.8)"
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={submitting}
              id="btn-login-submit"
              style={{
                width: '100%',
                height: '52px',
                borderRadius: '14px',
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.55rem',
                fontSize: '0.94rem',
                fontWeight: 700,
                letterSpacing: '0.01em',
                color: '#ffffff',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                background:
                  'linear-gradient(100deg, #7c3aed 0%, #6366f1 50%, #22d3ee 100%)',
                boxShadow:
                  '0 14px 34px rgba(99, 102, 241, 0.38), inset 0 1px 0 rgba(255,255,255,0.28)',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
              }}
              onMouseEnter={(e) => {
                if (submitting) return;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 20px 44px rgba(99, 102, 241, 0.5), inset 0 1px 0 rgba(255,255,255,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 14px 34px rgba(99, 102, 241, 0.38), inset 0 1px 0 rgba(255,255,255,0.28)';
              }}
            >
              {submitting ? 'Authenticating...' : 'Sign In to Workspace'}
              <ArrowRight size={17} />
            </button>
          </form>

          <p
            style={{
              marginTop: '1.9rem',
              fontSize: '0.75rem',
              textAlign: 'center',
              color: 'rgba(100, 116, 139, 0.9)',
              letterSpacing: '0.02em',
            }}
          >
            Protected workspace · Authorized access only
          </p>
        </div>
      </div>

      {/* Responsive + animation styles */}
      <style>{`
        @keyframes loginFade {
          from { opacity: 0; transform: translateY(14px) scale(0.985); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (max-width: 820px) {
          .login-brand-panel { display: none !important; }
          /* collapse grid to single column when brand panel hides */
          div[style*="max-width: 920px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};