import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { X, FolderPlus, Pencil, UploadCloud, File, AlertCircle, Image as ImageIcon } from 'lucide-react';

// Accepts optional `project` prop — if provided the modal runs in Edit mode,
// otherwise it runs in Create mode.
export const ProjectModal = ({ onClose, onSuccess, project }) => {
  const { showToast } = useAuth();

  // --- Determine mode ---
  const isEditMode = Boolean(project);

  // Helper: convert ISO date string → "YYYY-MM-DD" for <input type="date">
  const toDateInput = (iso) => {
    if (!iso) return '';
    return new Date(iso).toISOString().split('T')[0];
  };

  // --- Pre-populate fields from project when in Edit mode ---
  const [title, setTitle] = useState(isEditMode ? project.title : '');
  const [category, setCategory] = useState(isEditMode ? project.category : 'UI/UX Design');
  const [description, setDescription] = useState(isEditMode ? project.description : '');
  const [initialPrice, setInitialPrice] = useState(isEditMode ? project.initialPrice : '');
  const [deadline, setDeadline] = useState(isEditMode ? toDateInput(project.deadline) : '');
  const [biddingStatus, setBiddingStatus] = useState(isEditMode ? project.biddingStatus : 'open');
  const [referenceFiles, setReferenceFiles] = useState([]); // new uploads only
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files) {
      setReferenceFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim() || !initialPrice || !deadline) {
      setError('Please fill in all required fields');
      return;
    }

    if (Number(initialPrice) <= 0) {
      setError('Initial price must be greater than 0');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('description', description.trim());
      formData.append('initialPrice', Number(initialPrice));
      formData.append('deadline', deadline);
      formData.append('biddingStatus', biddingStatus);

      // Attach any new files selected by admin
      referenceFiles.forEach((file) => {
        formData.append('referenceFiles', file);
      });

      if (isEditMode) {
        // Edit mode: call updateProject with existing project ID
        await api.updateProject(project._id, formData);
        showToast('Project updated successfully!', 'success');
      } else {
        // Create mode: publish a brand-new project
        await api.createProject(formData);
        showToast('New project created successfully!', 'success');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || (isEditMode ? 'Failed to update project' : 'Failed to create project'));
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: isEditMode ? 'rgba(6, 182, 212, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isEditMode ? 'var(--accent-cyan)' : 'var(--accent-primary)',
              }}
            >
              {/* Icon switches based on mode */}
              {isEditMode ? <Pencil size={18} /> : <FolderPlus size={20} />}
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem' }}>
                {isEditMode ? 'Edit Design Project' : 'Create New Design Project'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {isEditMode
                  ? 'Update project details — new reference files will be appended'
                  : 'Set specifications, budget, deadline, and reference files'}
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
              <label className="form-label">Project Title *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Neo-Bank Mobile Experience Redesign"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                id="input-project-title"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Design Category *</label>
                <select
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  id="select-project-category"
                >
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Brand Identity">Brand Identity</option>
                  <option value="3D & Rendering">3D & Rendering</option>
                  <option value="Web Design">Web Design</option>
                  <option value="Illustration & Vector">Illustration & Vector</option>
                  <option value="Packaging & Print">Packaging & Print</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Initial Project Price ($USD) *</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 1500"
                  value={initialPrice}
                  onChange={(e) => setInitialPrice(e.target.value)}
                  min="1"
                  required
                  id="input-project-price"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Project Deadline *</label>
                <input
                  type="date"
                  className="form-control"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                  id="input-project-deadline"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Initial Bidding State</label>
                <select
                  className="form-control"
                  value={biddingStatus}
                  onChange={(e) => setBiddingStatus(e.target.value)}
                  id="select-project-bidding"
                >
                  <option value="open">Open For Bidding Immediately</option>
                  <option value="closed">Keep Closed (Draft Mode)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Project Scope & Deliverable Description *</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Detail the project goals, target audience, technical requirements, number of revisions, and expected design deliverables..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                id="input-project-description"
              />
            </div>

            {/* Reference Files Upload */}
            <div className="form-group">
              <label className="form-label">Attach Project Reference Images / Briefs</label>

              {/* In edit mode: show existing files so admin knows what's already attached */}
              {isEditMode && project.referenceFiles && project.referenceFiles.length > 0 && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Already Attached ({project.referenceFiles.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {project.referenceFiles.map((f, i) => {
                      const isImage = f.mimetype?.startsWith('image/') || /\.(jpe?g|png|webp|gif|svg)$/i.test(f.originalName || '');
                      return (
                        <div
                          key={i}
                          style={{
                            padding: '0.4rem 0.75rem',
                            background: 'rgba(255, 255, 255, 0.025)',
                            borderRadius: '6px',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'var(--text-muted)',
                          }}
                        >
                          {/* Thumbnail preview for image files */}
                          {isImage && f.url ? (
                            <img
                              src={f.url}
                              alt={f.originalName}
                              style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
                            />
                          ) : (
                            <ImageIcon size={14} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
                          )}
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {f.originalName || f.filename}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Upload zone for new files */}
              <div
                className="file-upload-zone"
                onClick={() => document.getElementById('project-files-input').click()}
              >
                <UploadCloud size={28} color="#818cf8" style={{ margin: '0 auto 0.4rem auto' }} />
                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                  {isEditMode ? 'Click to append additional reference files' : 'Click to upload moodboards, wireframes, or specs'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                  PNG, JPG, SVG, PDF, FIG (Max 50MB per file)
                </div>
                <input
                  id="project-files-input"
                  type="file"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </div>

              {referenceFiles.length > 0 && (
                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {referenceFiles.map((f, i) => (
                    <div
                      key={i}
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
                        {f.name}
                      </span>
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                        {(f.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                </div>
              )}
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
              id="btn-confirm-create-project"
            >
              {/* Label changes based on mode and submission state */}
              {submitting
                ? isEditMode ? 'Saving Changes...' : 'Creating Project...'
                : isEditMode ? 'Save Changes' : 'Publish Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
