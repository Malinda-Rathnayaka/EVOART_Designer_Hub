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
  Users,
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
    if (file.storageType === 'cloudinary' && (file.url || file.path)) return true;
    const name = file.originalName || file.filename || file.path || file.url || '';
    return /\.(jpe?g|png|webp|gif|svg|avif)$/i.test(name);
  };

  const imageFiles = (project.referenceFiles || []).filter(isImageFile);
  const primaryImage = imageFiles[0];
  const getPrimaryImageUrl = (file) => {
    if (!file) return null;
    if (file.url && /^https?:\/\//i.test(file.url)) return file.url;
    if (file.path && /^https?:\/\//i.test(file.path)) return file.path;
    if (file.path && file.path.startsWith('/uploads/')) return file.path;
    if (file.path && file.path.startsWith('/api/')) return file.path;
    return file.filename ? api.getFileUrl('references', file.filename) : null;
  };
  const primaryImageUrl = getPrimaryImageUrl(primaryImage);

  return (
    <div
      className="glass-card interactive-card project-card"
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
        className="project-card-media"
        style={{
          position: 'relative',
          width: '100%',
          height: '175px',
          background: '#f2f2f2',
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
            {/* Neutral overlay keeps image labels legible without changing the image. */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 1,
                background: 'rgba(0, 0, 0, 0.08)',
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
              background: '#f2f2f2',
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
              fontSize: '12px',
              fontWeight: 600,
              color: '#ffffff',
              background: '#000000',
              backdropFilter: 'none',
              padding: '5px 8px',
              borderRadius: '4px',
              border: '1px solid #000000',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              display: 'inline-block',
            }}
          >
            {project.category || 'General Design'}
          </span>
        </div>

        {/* Floating Bidding Status Badge (Top Right) */}
        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', zIndex: 2 }}>
          {isAssigned ? (
            <span className="badge badge-progress" style={{ background: '#000000', color: '#ffffff', border: '1px solid #000000', backdropFilter: 'none' }}>
              <CheckCircle2 size={12} />
              Assigned
            </span>
          ) : isBiddingOpen ? (
            <span className="badge badge-open" style={{ background: '#000000', color: '#ffffff', border: '1px solid #000000', backdropFilter: 'none' }}>
              <Unlock size={12} />
              Bidding Open
            </span>
          ) : (
            <span className="badge badge-closed" style={{ background: '#d9d9d9', color: '#000000', border: '1px solid #d9d9d9', backdropFilter: 'none' }}>
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
              fontSize: '12px',
              fontWeight: 600,
              color: '#ffffff',
              background: '#000000',
              backdropFilter: 'none',
              padding: '5px 8px',
              borderRadius: '4px',
              border: '1px solid #000000',
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
      <div className="project-card-body" style={{ padding: '20px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Project Title */}
        <h3
          className="project-card-title"
          style={{
            fontSize: '18px',
            marginBottom: '8px',
            cursor: 'pointer',
            lineHeight: 1.35,
            fontWeight: 600,
            color: '#000000',
          }}
          onClick={() => onViewDetails(project)}
          title={project.title}
        >
          {project.title}
        </h3>

        {/* Description snippet */}
        <p
          className="project-card-description"
          style={{
            fontSize: '15px',
            color: '#595959',
            marginBottom: '16px',
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
          className="project-card-metrics"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            padding: '12px',
            background: '#f2f2f2',
            borderRadius: '8px',
            border: '1px solid #d9d9d9',
            marginBottom: '16px',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', color: '#595959', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.08em' }}>
              Initial Price
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#000000', display: 'flex', alignItems: 'center', fontVariantNumeric: 'tabular-nums' }}>
              <span style={{ color: '#595959', marginRight: 4 }}>LKR</span>
              {project.initialPrice?.toLocaleString()}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#595959', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.08em' }}>
              Deadline
            </div>
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#000000',
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
              <strong style={{ color: '#818cf8' }}>LKR {project.myBid.amount}</strong>
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

        {/* Admin Designer Bidding Status Banner */}
        {isAdmin && (
          <div
            onClick={() => onOpenAwardModal(project)}
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              background: (project.bidCount || 0) > 0 ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.03)',
              border: (project.bidCount || 0) > 0 ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid var(--border-subtle)',
              marginBottom: '1rem',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            title="Click to inspect all bidding designers"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
              e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = (project.bidCount || 0) > 0 ? 'rgba(99, 102, 241, 0.25)' : 'var(--border-subtle)';
              e.currentTarget.style.background = (project.bidCount || 0) > 0 ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.03)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  background: (project.bidCount || 0) > 0 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Users size={13} color={(project.bidCount || 0) > 0 ? '#818cf8' : 'var(--text-dim)'} />
              </div>
              <span style={{ color: (project.bidCount || 0) > 0 ? 'var(--text-main)' : 'var(--text-dim)', fontWeight: 600 }}>
                {project.bidCount !== undefined && project.bidCount > 0
                  ? `${project.bidCount} ${project.bidCount === 1 ? 'Designer Bidding' : 'Designers Bidding'}`
                  : '0 Bids Submitted'}
              </span>
            </div>
            {project.assignedDesigner ? (
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle2 size={12} /> Awarded: {project.assignedDesigner?.name || 'Assigned'}
              </span>
            ) : (project.bidCount || 0) > 0 ? (
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                View All Bids →
              </span>
            ) : (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Awaiting Bids</span>
            )}
          </div>
        )}

        {/* Actions Bar */}
        <div className={`project-card-actions ${isAdmin ? 'is-admin' : ''}`} style={{ display: 'grid', gap: '8px', marginTop: 'auto' }}>
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
                className={`btn btn-sm ${isAssigned ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => onOpenAwardModal(project)}
                title={isAssigned ? "View all bidding designers and awarded winner" : "Review all submitted bids & award assignment"}
              >
                <Gavel size={14} />
                {isAssigned ? `Bids (${project.bidCount || 0})` : `Bids ${project.bidCount !== undefined ? `(${project.bidCount})` : ''}`}
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
