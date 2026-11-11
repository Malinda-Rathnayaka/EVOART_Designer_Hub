import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, KeyRound, UserCircle, X } from 'lucide-react';

export const ProfileModal = ({ onClose }) => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [skills, setSkills] = useState(user?.skills?.join(', ') || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setBio(user?.bio || '');
    setSkills(user?.skills?.join(', ') || '');
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    const changingPassword = currentPassword || newPassword || confirmPassword;
    if (changingPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        setError('Enter your current password, new password, and confirmation');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('New password and confirmation do not match');
        return;
      }
    }

    setSubmitting(true);
    try {
      await updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        skills,
        ...(changingPassword ? { currentPassword, newPassword, confirmPassword } : {}),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Could not update your profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(34, 211, 238, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)',
              }}
            >
              <UserCircle size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Customize Your Profile</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Keep your designer profile up to date
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon-only" type="button" aria-label="Close profile editor">
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
              <label className="form-label" htmlFor="profile-name">Full Name *</label>
              <input id="profile-name" type="text" className="form-control" value={name} onChange={(event) => setName(event.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-email">Email Address</label>
              <input id="profile-email" type="email" className="form-control" value={user?.email || ''} disabled />
              <small style={{ color: 'var(--text-dim)' }}>Email is managed by the platform administrator.</small>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-skills">Skills & Specializations</label>
              <input id="profile-skills" type="text" className="form-control" placeholder="Figma, UI/UX, Typography" value={skills} onChange={(event) => setSkills(event.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-bio">Bio / Background</label>
              <textarea id="profile-bio" className="form-control" rows="3" placeholder="Tell clients about your design experience..." value={bio} onChange={(event) => setBio(event.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-current-password">
                <KeyRound size={14} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
                Change Password
              </label>
              <input id="profile-current-password" type="password" className="form-control" placeholder="Current password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" />
              <input id="profile-new-password" type="password" className="form-control" placeholder="New password (at least 6 characters)" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={6} autoComplete="new-password" style={{ marginTop: '0.65rem' }} />
              <input id="profile-confirm-password" type="password" className="form-control" placeholder="Type new password again" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={6} autoComplete="new-password" style={{ marginTop: '0.65rem' }} />
              <small style={{ color: 'var(--text-dim)' }}>Leave all three fields blank to keep your current password.</small>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
