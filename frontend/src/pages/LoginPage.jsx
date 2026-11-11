import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Briefcase,
} from 'lucide-react';

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

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
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
          'radial-gradient(ellipse at 50% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 50%), #090c13',
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-lg), 0 0 50px rgba(99, 102, 241, 0.15)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
              marginBottom: '1rem',
            }}
          >
            <Layers size={24} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>
            EVO <span style={{ color: 'var(--accent-cyan)' }}>ART</span>
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Designer Platform
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fb7185',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-control"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '2.5rem' }}
                id="input-login-email"
              />
              <Mail
                size={16}
                color="var(--text-dim)"
                style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: '2.5rem' }}
                id="input-login-password"
              />
              <Lock
                size={16}
                color="var(--text-dim)"
                style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginBottom: '1.75rem' }}
            disabled={submitting}
            id="btn-login-submit"
          >
            {submitting ? 'Authenticating...' : 'Sign In to Workspace'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Maintained Admin Credentials Quick-Select */}
        <div
          style={{
            borderTop: '1px solid var(--border-light)',
            paddingTop: '1.25rem',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-dim)',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem',
              textAlign: 'center',
            }}
          >
            System Credentials & Access
          </div>

          <button
            type="button"
            onClick={() => handleQuickFill('admin@platform.com', 'admin123')}
            className="btn btn-secondary"
            style={{ width: '100%', fontSize: '0.82rem', justifyContent: 'center', padding: '0.65rem 1rem', marginBottom: '0.85rem' }}
            id="btn-demo-admin"
          >
            <ShieldCheck size={16} color="#c084fc" />
            <span>Fill Admin Director (Maintained by Seed)</span>
          </button>

          <div
            style={{
              padding: '0.75rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              lineHeight: 1.45,
            }}
          >
            <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.2rem' }}>
              ℹ️ Designer Accounts Workflow:
            </strong>
            The database seeder maintains only the Administrator account and password. All designer accounts must be provisioned directly by the Admin via the Admin Dashboard and are stored in MongoDB.
          </div>
        </div>
      </div>
    </div>
  );
};
