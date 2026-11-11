import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ReviewModal } from '../components/ReviewModal';
import { CancelModal } from '../components/CancelModal';
import {
  Award,
  CheckCircle2,
  Clock,
  RotateCcw,
  XCircle,
  FileText,
  DollarSign,
  Download,
  AlertTriangle,
  RefreshCw,
  Search,
} from 'lucide-react';

export const AdminAssignmentsPage = () => {
  const { showToast } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [reviewTarget, setReviewTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminAssignments();
      if (res.success) {
        setAssignments(res.data || []);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const openReviewForAssignment = async (assignment) => {
    try {
      const subRes = await api.getSubmissions(assignment._id);
      if (subRes.success && subRes.data && subRes.data.length > 0) {
        // Take latest submission
        const latestSubmission = subRes.data[subRes.data.length - 1];
        setReviewTarget({
          assignment,
          submission: latestSubmission,
        });
      } else {
        showToast('No deliverable files have been submitted yet by the designer', 'warning');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

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
        return <span className="badge badge-cancelled"><XCircle size={12} /> Cancelled (Slot Released)</span>;
      default:
        return <span className="badge badge-closed">{status}</span>;
    }
  };

  const filtered = assignments.filter((a) => {
    const title = a.project?.title || '';
    const designer = a.designer?.name || '';
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      designer.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    return true;
  });

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
          <h1 style={{ marginBottom: '0.25rem' }}>Assignment & Deliverable Reviews</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Monitor active project contracts, inspect design submissions, approve deliverables, or formally cancel
          </p>
        </div>

        <button onClick={fetchAssignments} className="btn btn-secondary">
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.04)', padding: '0.3rem', borderRadius: 'var(--radius-md)' }}>
          {[
            { id: 'all', label: `All (${assignments.length})` },
            { id: 'under_review', label: 'Pending Review' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'revision_requested', label: 'In Revision' },
            { id: 'approved', label: 'Approved' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`btn btn-sm ${statusFilter === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                border: statusFilter === tab.id ? 'none' : 'transparent',
                background: statusFilter === tab.id ? undefined : 'transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search project or designer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.3rem' }}
          />
          <Search
            size={15}
            color="var(--text-dim)"
            style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }}
          />
        </div>
      </div>

      {/* Assignments Table / Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          Loading assignments...
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
          <Award size={40} color="var(--text-dim)" style={{ margin: '0 auto 1rem auto' }} />
          <h3>No Assignments Matching Filter</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No assignments match the selected status or query.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((item) => {
            const isFinished = item.status === 'approved' || item.status === 'cancelled';
            const isUnderReview = item.status === 'under_review';

            return (
              <div
                key={item._id}
                className="glass-card"
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1.25rem',
                  borderLeft: isUnderReview
                    ? '4px solid #c084fc'
                    : item.status === 'approved'
                    ? '4px solid #10b981'
                    : '1px solid var(--border-light)',
                }}
              >
                {/* Left: Project & Designer info */}
                <div style={{ flex: '1 1 320px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                    {getStatusBadge(item.status)}
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      Awarded {new Date(item.awardedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>
                    {item.project?.title || 'Project Name'}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span>
                      Designer: <strong style={{ color: 'var(--text-main)' }}>{item.designer?.name}</strong> ({item.designer?.email})
                    </span>
                    <span>
                      Agreed Price: <strong style={{ color: 'var(--accent-emerald)' }}>${item.agreedPrice}</strong>
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  {/* Review Deliverable Button */}
                  <button
                    className={`btn btn-sm ${isUnderReview ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => openReviewForAssignment(item)}
                    title="Inspect submitted design deliverables and approve or request revision"
                  >
                    <CheckCircle2 size={14} />
                    {isUnderReview ? 'Review Deliverables' : 'Submissions'}
                  </button>

                  {/* Formally Cancel Button (Only if not already finished) */}
                  {!isFinished && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setCancelTarget(item)}
                      title="Formally cancel assignment and release designer slot"
                      style={{ color: '#fb7185' }}
                    >
                      <XCircle size={14} />
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewTarget && (
        <ReviewModal
          submission={reviewTarget.submission}
          assignment={reviewTarget.assignment}
          onClose={() => setReviewTarget(null)}
          onSuccess={fetchAssignments}
        />
      )}

      {/* Cancel Modal */}
      {cancelTarget && (
        <CancelModal
          assignment={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onSuccess={fetchAssignments}
        />
      )}
    </div>
  );
};
