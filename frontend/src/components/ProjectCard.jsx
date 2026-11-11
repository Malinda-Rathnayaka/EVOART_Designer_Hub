import React from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Calendar,
  Gavel,
  CheckCircle2,
  Lock,
  Unlock,
  Eye,
  Paperclip,
  Pencil,
  Image as ImageIcon,
} from 'lucide-react';

export const ProjectCard = ({
  project,
  onOpenBidModal,
  onOpenAwardModal,
  onToggleBidding,
  onViewDetails,
  onEditProject,   // Admin-only: opens the edit modal for this project
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

  // Logical Area: Identify attached reference image (Cloudinary or local)
  const isImageFile = (file) => {
    if (!file) return false;
    if (file.mimetype && file.mimetype.startsWith('image/')) return true;
    const name = file.originalName || file.filename || file.path || file.url || '';
    return /\.(jpe?g|png|webp|gif|svg|avif)$/i.test(name);
  };

  const imageFiles = (project.referenceFiles || []).filter(isImageFile);
  const primaryImage = imageFiles[0];
  const primaryImageUrl = primaryImage
    ? primaryImage.url || api.getFileUrl('references', primaryImage.filename)
    : null;

  return (
    <div
      className="glass-card interactive-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        padding: 0,
      }}
    >
      {/* Top Reference Image Banner */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '175px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.16) 0%, rgba(6, 182, 212, 0.1) 100%)',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
        onClick={() => onViewDetails(project)}
      >
        {primaryImageUrl ? (
          <>
            <img
              src={primaryImageUrl}
              alt={project.title}
              className="card-media-img"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            {/* Subtle Gradient Scrim for contrast */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, rgba(9, 12, 19, 0.4) 0%, rgba(9, 12, 19, 0.05) 50%, rgba(9, 12, 19, 0.8) 100%)',
                pointerEvents: 'none',
              }}
            />
          </>
        ) : (
          /* Sleek Graphic Placeholder when brief has no reference image */
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              background:
                'radial-gradient(ellipse at 50% 50%, rgba(99, 102, 241, 0.22) 0%, rgba(15, 20, 34, 0.88) 100%)',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ImageIcon size={20} color="var(--accent-primary)" />
            </div>
            <span
              style={{
                fontSize: '0.72rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                fontWeight: 600,
                color: 'var(--text-dim)',
              }}
            >
              Design Brief
            </span>
          </div>
        )}

        {/* Floating Category Badge (Top Left) */}
        <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', zIndex: 2 }}>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#ffffff',
              background: 'rgba(15, 20, 34, 0.82)',
              backdropFilter: 'blur(8px)',
              padding: '0.22rem 0.55rem',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              display: 'inline-block',
            }}
          >
            {project.category || 'General Design'}
          </span>
        </div>

        {/* Floating Bidding Status Badge (Top Right) */}
        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', zIndex: 2 }}>
          {isAssigned ? (
            <span className="badge badge-progress" style={{ backdropFilter: 'blur(8px)' }}>
              <CheckCircle2 size={12} />
              Assigned
            </span>
          ) : isBiddingOpen ? (
            <span className="badge badge-open" style={{ backdropFilter: 'blur(8px)' }}>
              <Unlock size={12} />
              Bidding Open
            </span>
          ) : (
            <span className="badge badge-closed" style={{ backdropFilter: 'blur(8px)' }}>
              <Lock size={12} />
              Bidding Closed
            </span>
          )}
        </div>

        {/* Floating Reference Assets Counter Pill (Bottom Right) */}
        {project.referenceFiles && project.referenceFiles.length > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: '0.65rem',
              right: '0.75rem',
              zIndex: 2,
              fontSize: '0.7rem',
              fontWeight: 600,
              color: '#ffffff',
              background: 'rgba(15, 20, 34, 0.85)',
              backdropFilter: 'blur(8px)',
              padding: '0.2rem 0.55rem',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Paperclip size={11} color="var(--accent-cyan)" />
            <span>
              {project.referenceFiles.length}{' '}
              {project.referenceFiles.length === 1 ? 'Reference' : 'References'}
            </span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div style={{ padding: '1.25rem 1.4rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Project Title */}
        <h3
          style={{
            fontSize: '1.15rem',
            marginBottom: '0.5rem',
            cursor: 'pointer',
            lineHeight: 1.35,
            fontWeight: 700,
          }}
          onClick={() => onViewDetails(project)}
          title={project.title}
        >
          {project.title}
        </h3>

        {/* Description snippet */}
        <p
          style={{
            fontSize: '0.86rem',
            color: 'var(--text-muted)',
            marginBottom: '1rem',
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.45,
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
            padding: '0.75rem 0.9rem',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
              Initial Price
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: 'var(--accent-emerald)', marginRight: 2 }}>$</span>
              {project.initialPrice?.toLocaleString()}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
              Deadline
            </div>
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: daysLeft <= 3 ? '#fb7185' : 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                marginTop: '0.2rem',
              }}
            >
              <Calendar size={13} color="var(--accent-cyan)" />
              {formattedDeadline}
            </div>
          </div>
        </div>

        {/* Designer Bid Status Banner (Strict Bid Privacy) */}
        {isDesigner && project.myBid && (
          <div
            style={{
              padding: '0.6rem 0.8rem',
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

              {/* Edit button — admin only; opens edit modal pre-populated with project data */}
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onEditProject && onEditProject(project)}
                title="Edit project details"
              >
                <Pencil size={14} />
                Edit
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
