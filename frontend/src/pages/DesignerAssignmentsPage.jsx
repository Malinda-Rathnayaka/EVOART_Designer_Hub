import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SubmissionModal } from '../components/SubmissionModal';
import { QuotaBadge } from '../components/QuotaBadge';
import {
  Award,
  UploadCloud,
  CheckCircle2,
  RotateCcw,
  Clock,
  XCircle,
  File,
  Download,
  AlertTriangle,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';

export const DesignerAssignmentsPage = ({ onViewDetails }) => {
  const { user, showToast, refreshUser } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submissionTarget, setSubmissionTarget] = useState(null);
  const [activeSubmissionsMap, setActiveSubmissionsMap] = useState({});

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await api.getDesignerAssignments();
      if (res.success) {
        setAssignments(res.data || []);

        // Also fetch submissions history for each assignment
        const subMap = {};
        for (const assign of res.data || []) {
          try {
            const sRes = await api.getSubmissions(assign._id);
            if (sRes.success) {
              subMap[assign._id] = sRes.data || [];
            }
          } catch (e) {
            console.warn(e);
          }
        }
        setActiveSubmissionsMap(subMap);
      }
      await refreshUser();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'in_progress':
        return <span className="badge badge-progress"><Clock size={12} /> In Progress</span>;
      case 'under_review':
        return <span className="badge badge-review"><CheckCircle2 size={12} /> Under Review</span>;
      case 'revision_requested':
        return <span className="badge badge-revision"><RotateCcw size={12} /> Revision Requested</span>;
      case 'approved':
        return <span className="badge badge-approved"><CheckCircle2 size={12} /> Approved (Slot Released)</span>;
      case 'cancelled':
        return <span className="badge badge-cancelled"><XCircle size={12} /> Cancelled</span>;
      default:
        return <span className="badge badge-closed">{status}</span>;
    }
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>My Awarded Assignments</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage awarded projects, upload design deliverables, and address admin revision requests
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <QuotaBadge
            activeCount={user?.activeAssignmentsCount || 0}
            max={user?.maxActiveAssignments || 3}
            showDetails={true}
          />
          <button onClick={fetchAssignments} className="btn btn-secondary btn-icon-only">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Assignments List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          Loading your assignments...
        </div>
      ) : assignments.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
          <Award size={40} color="var(--text-dim)" style={{ margin: '0 auto 1rem auto' }} />
          <h3>No Awarded Assignments Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            When an admin accepts your bid, your awarded assignment will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {assignments.map((assignment) => {
            const project = assignment.project || {};
            const submissions = activeSubmissionsMap[assignment._id] || [];
            const latestSubmission = submissions.length > 0 ? submissions[submissions.length - 1] : null;
            const isRevision = assignment.status === 'revision_requested';
            const isCanUpload = assignment.status === 'in_progress' || isRevision;

            return (
              <div
                key={assignment._id}
                className="glass-card"
                style={{
                  padding: '1.5rem',
                  borderLeft: isRevision
                    ? '4px solid #f59e0b'
                    : assignment.status === 'approved'
                    ? '4px solid #10b981'
                    : '4px solid var(--accent-primary)',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    {getStatusBadge(assignment.status)}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      Awarded {new Date(assignment.awardedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                    Agreed Contract: ${assignment.agreedPrice}
                  </div>
                </div>

                {/* Project Title */}
                <h3
                  style={{ fontSize: '1.25rem', marginBottom: '0.5rem', cursor: 'pointer' }}
                  onClick={() => onViewDetails(project)}
                >
                  {project.title}
                </h3>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  {project.description}
                </p>

                {/* Revision Feedback Alert Banner */}
                {isRevision && latestSubmission && latestSubmission.adminFeedback && (
                  <div
                    style={{
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', color: '#fbbf24', fontWeight: 700, fontSize: '0.9rem' }}>
                      <RotateCcw size={16} />
                      Admin Revision Request (Version {latestSubmission.version})
                    </div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontStyle: 'italic' }}>
                      "{latestSubmission.adminFeedback}"
                    </p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                      Please review feedback and upload your revised design files below.
                    </div>
                  </div>
                )}

                {/* Submissions History Preview */}
                {submissions.length > 0 && (
                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Uploaded Submissions ({submissions.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {submissions.map((sub) => (
                        <div
                          key={sub._id}
                          style={{
                            padding: '0.5rem 0.75rem',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: '6px',
                            border: '1px solid var(--border-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 600, fontSize: '0.85rem', marginRight: '0.5rem' }}>
                              Version {sub.version}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                              ({sub.files?.length} files • {new Date(sub.createdAt).toLocaleDateString()})
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            {sub.files?.map((f, i) => (
                              <a
                                key={i}
                                href={api.getFileUrl('submissions', f.filename)}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                                title={f.originalName}
                              >
                                <Download size={12} />
                                {f.originalName}
                              </a>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {isCanUpload && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setSubmissionTarget(assignment)}
                      id="btn-open-submit-work"
                    >
                      <UploadCloud size={15} />
                      {isRevision ? 'Upload Revised Files' : 'Upload Deliverables'}
                    </button>
                  )}

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onViewDetails(project)}
                  >
                    View Project Brief
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      {submissionTarget && (
        <SubmissionModal
          assignment={submissionTarget}
          onClose={() => setSubmissionTarget(null)}
          onSuccess={fetchAssignments}
        />
      )}
    </div>
  );
};
