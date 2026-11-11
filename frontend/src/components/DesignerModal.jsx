import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { X, UserPlus, AlertCircle } from 'lucide-react';

export const DesignerModal = ({ onClose, onSuccess }) => {
  const { showToast } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('designer123');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('Figma, UI/UX, Typography');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password) {
      setError('Name, email, and password are required');
      return;
    }

    setSubmitting(true);
    try {
      await api.createDesigner({
        name: name.trim(),
        email: email.trim(),
        password,
        bio: bio.trim(),
        skills,
      });

      showToast(`Designer account created for ${name}!`, 'success');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create designer account');
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
              }}
            >
              <UserPlus size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Create Designer Account</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Assign login credentials to a verified designer
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon-only">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: '#fb7185',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Jordan Hayes"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                id="input-designer-name"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="e.g. jordan@designer.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  id="input-designer-email"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Password *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Initial password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  id="input-designer-password"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Skills & Specializations (Comma-separated)</label>
              <input
                type="text"
                className="form-control"
                placeholder="Figma, UI/UX, 3D Modeling, Brand Identity"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bio / Background</label>
              <textarea
                className="form-control"
                rows="2"
                placeholder="Brief professional profile and experience..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              id="btn-confirm-create-designer"
            >
              {submitting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
