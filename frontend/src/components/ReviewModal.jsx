import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  X,
  CheckCircle,
  RotateCcw,
  Download,
  File,
  AlertCircle,
  MessageSquare,
  ShieldAlert,
  ExternalLink,
} from 'lucide-react';

export const ReviewModal = ({ submission, assignment, onClose, onSuccess }) => {
  const { showToast } = useAuth();
  const [decision, setDecision] = useState('approve');
  const [adminFeedback, setAdminFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (decision === 'request_revision' && !adminFeedback.trim()) {
      setError('Please provide feedback explaining what revisions are required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.reviewSubmission(submission._id, decision, adminFeedback);
      if (res.slotReleased) {
        showToast(
          'Design successfully approved! The project is completed and the designer’s active assignment slot is now released.',
          'success'
        );
      } else {
        showToast(
          'Revision requested. Designer has been notified and the assignment slot remains active.',
          'warning'
        );
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Review submission failed');
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-emerald)',
              }}
            >
              <CheckCircle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem' }}>Review Design Submission</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Version {submission.version} • Submitted by {submission.designer?.name || 'Designer'}
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

            {/* Submission Files List */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Deliverable Files ({submission.files?.length || 0})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {submission.files?.map((file, i) => {
                  const fileUrl = api.getFileUrl('submissions', file.filename);
                  return (
                    <div
                      key={i}
                      style={{
                        padding: '0.6rem 0.85rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '6px',
                        border: '1px solid var(--border-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <File size={16} color="var(--accent-cyan)" />
                        <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>
                          {file.originalName}
                        </span>
                        {file.storageType === 'google_drive' && (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              padding: '0.1rem 0.45rem',
                              borderRadius: '4px',
                              background: 'rgba(34, 211, 238, 0.12)',
                              color: 'var(--accent-cyan)',
                              border: '1px solid rgba(34, 211, 238, 0.3)',
                              fontWeight: 600,
                            }}
                          >
                            Google Drive
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        {file.url && (
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', gap: '0.3rem' }}
                            title="Open in Google Drive"
                          >
                            <ExternalLink size={12} color="var(--accent-cyan)" />
                            Google Drive
                          </a>
                        )}
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                          title="Download / Preview file"
                        >
                          <Download size={13} />
                          Download
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Designer Comments */}
            {submission.comments && (
              <div
                style={{
                  padding: '0.85rem 1rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, marginBottom: '0.25rem' }}>
                  DESIGNER NOTES
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontStyle: 'italic' }}>
                  "{submission.comments}"
                </div>
              </div>
            )}

            {/* Review Decision Choice */}
            <div className="form-group">
              <label className="form-label">Review Action</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div
                  onClick={() => setDecision('approve')}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: decision === 'approve' ? '2px solid #10b981' : '1px solid var(--border-light)',
                    background: decision === 'approve' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <CheckCircle size={18} color="#34d399" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#34d399' }}>
                      Approve & Complete
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      Releases designer active slot
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setDecision('request_revision')}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: decision === 'request_revision' ? '2px solid #f59e0b' : '1px solid var(--border-light)',
                    background: decision === 'request_revision' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <RotateCcw size={18} color="#fbbf24" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fbbf24' }}>
                      Request Revision
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      Keeps assignment slot occupied
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Feedback Input */}
            <div className="form-group">
              <label className="form-label">
                {decision === 'request_revision'
                  ? 'Revision Instructions (Required) *'
                  : 'Approval Comments (Optional)'}
              </label>
              <textarea
                className="form-control"
                rows="3"
                placeholder={
                  decision === 'request_revision'
                    ? 'State precisely what changes or adjustments are required before final approval...'
                    : 'Add any compliments or concluding remarks...'
                }
                value={adminFeedback}
                onChange={(e) => setAdminFeedback(e.target.value)}
                required={decision === 'request_revision'}
                id="input-review-feedback"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${decision === 'approve' ? 'btn-success' : 'btn-primary'}`}
              disabled={submitting}
              id="btn-confirm-review"
            >
              {submitting
                ? 'Processing...'
                : decision === 'approve'
                ? 'Approve Design & Release Slot'
                : 'Send Revision Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
