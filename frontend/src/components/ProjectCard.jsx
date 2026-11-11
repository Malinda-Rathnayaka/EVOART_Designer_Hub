import React from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Calendar,
  DollarSign,
  FileText,
  Gavel,
  CheckCircle2,
  Clock,
  Lock,
  Unlock,
  Eye,
  Paperclip,
} from 'lucide-react';

export const ProjectCard = ({
  project,
  onOpenBidModal,
  onOpenAwardModal,
  onToggleBidding,
  onViewDetails,
}) => {
  const { isAdmin, isDesigner, user } = useAuth();

  const isBiddingOpen = project.biddingStatus === 'open';
  const isAssigned = project.status === 'assigned' || project.status === 'completed';
  const isAwardedToMe =
    isDesigner &&
    project.winningDesigner &&
    (project.winningDesigner._id === user?._id || project.winningDesigner === user?._id);

  const formattedDeadline = new Date(project.deadline).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate days remaining
  const daysLeft = Math.ceil(
    (new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="glass-card interactive-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header Badges */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--accent-cyan)',
              background: 'rgba(6, 182, 212, 0.1)',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              textTransform: 'uppercase',
            }}
          >
            {project.category || 'General Design'}
          </span>

          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            {isAssigned ? (
              <span className="badge badge-progress">
                <CheckCircle2 size={12} />
                Assigned
              </span>
            ) : isBiddingOpen ? (
              <span className="badge badge-open">
                <Unlock size={12} />
                Bidding Open
              </span>
            ) : (
              <span className="badge badge-closed">
                <Lock size={12} />
                Bidding Closed
              </span>
            )}
          </div>
        </div>

        {/* Project Title */}
        <h3
          style={{
            fontSize: '1.15rem',
            marginBottom: '0.65rem',
            cursor: 'pointer',
            lineHeight: 1.35,
          }}
          onClick={() => onViewDetails(project)}
          title={project.title}
        >
          {project.title}
        </h3>

        {/* Description snippet */}
        <p
          style={{
            fontSize: '0.88rem',
            color: 'var(--text-muted)',
            marginBottom: '1.25rem',
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {project.description}
        </p>

        {/* Project Key Metrics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            padding: '0.85rem 1rem',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
              Initial Project Price
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: 'var(--accent-emerald)', marginRight: 2 }}>$</span>
              {project.initialPrice?.toLocaleString()}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
              Deadline
            </div>
            <div
              style={{
                fontSize: '0.88rem',
                fontWeight: 600,
                color: daysLeft <= 3 ? '#fb7185' : 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                marginTop: '0.25rem',
              }}
            >
              <Calendar size={14} color="var(--accent-cyan)" />
              {formattedDeadline}
            </div>
          </div>
        </div>

        {/* Reference Files count if present */}
        {project.referenceFiles && project.referenceFiles.length > 0 && (
          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Paperclip size={14} color="var(--text-dim)" />
            <span>{project.referenceFiles.length} Reference File(s) attached</span>
          </div>
        )}

        {/* Designer Bid Status Banner (Strict Bid Privacy) */}
        {isDesigner && project.myBid && (
          <div
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              marginBottom: '1rem',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Your Private Bid: </span>
              <strong style={{ color: '#818cf8' }}>${project.myBid.amount}</strong>
            </div>
            <span
              style={{
                textTransform: 'capitalize',
                fontSize: '0.72rem',
                fontWeight: 700,
                color:
                  project.myBid.status === 'accepted'
                    ? '#34d399'
                    : project.myBid.status === 'rejected'
                    ? '#fb7185'
                    : '#fbbf24',
              }}
            >
              ● {project.myBid.status}
            </span>
          </div>
        )}

        {/* Actions Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
          {isAdmin ? (
            <>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onViewDetails(project)}
                style={{ flex: 1 }}
                title="View full project details"
              >
                <Eye size={14} />
                Details
              </button>

              <button
                className={`btn btn-sm ${isBiddingOpen ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => onToggleBidding(project._id, isBiddingOpen ? 'closed' : 'open')}
                title={isBiddingOpen ? 'Close Bidding' : 'Open Bidding'}
              >
                {isBiddingOpen ? <Lock size={14} /> : <Unlock size={14} />}
                {isBiddingOpen ? 'Close' : 'Open'}
              </button>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => onOpenAwardModal(project)}
                title="Review all submitted bids & award assignment"
                disabled={isAssigned}
              >
                <Gavel size={14} />
                Bids {project.bidCount !== undefined ? `(${project.bidCount})` : ''}
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onViewDetails(project)}
                style={{ flex: 1 }}
              >
                <Eye size={14} />
                View Details
              </button>

              {isAwardedToMe ? (
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => onViewDetails(project)}
                >
                  <CheckCircle2 size={14} />
                  Awarded to You!
                </button>
              ) : isBiddingOpen ? (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => onOpenBidModal(project, project.myBid)}
                >
                  <Gavel size={14} />
                  {project.myBid ? 'Edit Bid' : 'Place Bid'}
                </button>
              ) : (
                <button className="btn btn-secondary btn-sm" disabled>
                  <Lock size={14} />
                  Bidding Closed
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
