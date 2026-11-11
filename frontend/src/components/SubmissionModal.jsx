import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { X, UploadCloud, File, AlertCircle, Info } from 'lucide-react';

export const SubmissionModal = ({ assignment, onClose, onSuccess }) => {
  const { showToast, refreshUser } = useAuth();
  const [files, setFiles] = useState([]);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isRevision = assignment?.status === 'revision_requested';

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (files.length === 0) {
      setError('Please select at least one deliverable file to upload');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('comments', comments);
      files.forEach((f) => {
        formData.append('files', f);
      });

      await api.uploadSubmission(assignment._id, formData);
      await refreshUser();
      showToast(
        isRevision
          ? 'Revised design files uploaded! Admin has been notified for review.'
          : 'Deliverable design files submitted! Assignment is now under review.',
        'success'
      );
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to upload design files');
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
              }}
            >
              <UploadCloud size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem' }}>
                {isRevision ? 'Upload Revised Design Files' : 'Submit Completed Design Deliverables'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {assignment?.project?.title || 'Assignment Deliverables'}
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
              <label className="form-label">
                Select Design Deliverable Files *
              </label>
              <div className="file-upload-zone" onClick={() => document.getElementById('deliverable-files-input').click()}>
                <UploadCloud size={32} color="#818cf8" style={{ margin: '0 auto 0.5rem auto' }} />
                <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: '0.25rem' }}>
                  Click to select files from your computer
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  PNG, JPG, SVG, PDF, ZIP, PSD, AI, FIG (Max 50MB per file)
                </div>
                <input
                  id="deliverable-files-input"
                  type="file"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </div>

              {files.length > 0 && (
                <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Selected Files ({files.length}):
                  </div>
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.4rem 0.75rem',
                        background: 'rgba(255, 255, 255, 0.04)',
                        borderRadius: '6px',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <File size={14} color="var(--accent-cyan)" />
                        {file.name}
                      </span>
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Designer Notes / Deliverable Summary
              </label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Provide notes on the exported deliverables, file formats, and any instructions for the reviewer..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                id="input-deliverable-comments"
              />
            </div>

            {/* Quota Rule Reminder Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <Info size={16} color="#818cf8" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong>Workflow Note:</strong> Submitting files moves this assignment to <em>Under Review</em>.
                Your active assignment slot is <strong>not</strong> released until the administrator gives final approval.
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || files.length === 0}
              id="btn-upload-submission"
            >
              {submitting ? 'Uploading...' : isRevision ? 'Submit Revised Files' : 'Submit Deliverables'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
