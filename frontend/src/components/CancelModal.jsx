import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { X, AlertTriangle } from 'lucide-react';

export const CancelModal = ({ assignment, onClose, onSuccess }) => {
  const { showToast } = useAuth();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.cancelAssignment(assignment._id, reason);
      showToast('Assignment formally cancelled and designer slot released.', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to cancel assignment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(244, 63, 94, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-rose)',
              }}
            >
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Formally Cancel Assignment</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {assignment?.project?.title}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon-only">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Formally cancelling this assignment will terminate the design contract with{' '}
              <strong style={{ color: 'var(--text-main)' }}>{assignment?.designer?.name}</strong>{' '}
              and <strong>release their active assignment slot</strong> so they may take on other work.
            </p>

            <div className="form-group">
              <label className="form-label">Reason for Cancellation</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="e.g. Scope was deprecated by client, mutual agreement, or unresponsive deadline..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Keep Assignment
            </button>
            <button
              type="submit"
              className="btn btn-danger"
              disabled={submitting || !reason.trim()}
            >
              {submitting ? 'Cancelling...' : 'Confirm Cancellation & Release Slot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
