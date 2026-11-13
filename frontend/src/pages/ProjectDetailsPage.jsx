import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { BidModal } from '../components/BidModal';
import { AwardModal } from '../components/AwardModal';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Download,
  File,
  Gavel,
  Lock,
  Unlock,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  Award,
  User,
  Tag,
} from 'lucide-react';

export const ProjectDetailsPage = ({ project: initialProject, onBack, onNavigateToAssignments }) => {
  const { user, isAdmin, isDesigner, showToast } = useAuth();
  const [project, setProject] = useState(initialProject);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showBidModal, setShowBidModal] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const res = await api.getProjectById(initialProject._id);
      if (res.success) {
        setProject(res.data);
      }

      if (isAdmin) {
        const bidsRes = await api.getProjectBids(initialProject._id);
        if (bidsRes.success) {
          setBids(bidsRes.data || []);
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [initialProject._id]);

  const handleToggleBidding = async () => {
    try {
      const newStatus = project.biddingStatus === 'open' ? 'closed' : 'open';
      await api.toggleBidding(project._id, newStatus);
      showToast(`Bidding status changed to ${newStatus}`, 'success');
      fetchProjectDetails();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const isBiddingOpen = project.biddingStatus === 'open';
  const isAssigned = project.status === 'assigned' || project.status === 'completed';
  const isAwardedToMe =
    isDesigner &&
    project.winningDesigner &&
    (project.winningDesigner._id === user?._id || project.winningDesigner === user?._id);

  return (
    <div>
      {/* Back button */}
      <button
        onClick={onBack}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.5rem' }}
        id="btn-back-projects"
      >
        <ArrowLeft size={15} />
        Back to Dashboard
      </button>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
        {/* Left Column: Project Brief & Reference Assets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            {/* Header Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--accent-cyan)',
                  background: 'rgba(6, 182, 212, 0.12)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  textTransform: 'uppercase',
                }}
              >
                {project.category}
              </span>

              {isAssigned ? (
                <span className="badge badge-progress">
                  <CheckCircle2 size={12} /> Assigned
                </span>
              ) : isBiddingOpen ? (
                <span className="badge badge-open">
                  <Unlock size={12} /> Bidding Open
                </span>
              ) : (
                <span className="badge badge-closed">
                  <Lock size={12} /> Bidding Closed
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '1.85rem', marginBottom: '1rem', lineHeight: 1.25 }}>
              {project.title}
            </h1>

            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.75rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={15} color="var(--accent-cyan)" />
                Deadline: {new Date(project.deadline).toLocaleDateString()}
              </span>
              <span>
                Posted: {new Date(project.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Description Body */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Project Scope & Specifications</h3>
              <div
                style={{
                  fontSize: '0.95rem',
                  color: 'var(--text-main)',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {project.description}
              </div>
            </div>

            {/* Reference Files */}
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Project Reference Assets</h3>
              {project.referenceFiles && project.referenceFiles.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {project.referenceFiles.map((file, i) => {
                    const downloadUrl = file.url || api.getFileUrl('references', file.filename);
                    const isImage = file.mimetype?.startsWith('image/') || /\.(jpg|jpeg|png|webp|svg|gif)$/i.test(file.originalName || file.filename);

                    return (
                      <div
                        key={i}
                        style={{
                          padding: '0.75rem 1rem',
                          background: 'rgba(255, 255, 255, 0.03)',
                          borderRadius: '8px',
                          border: '1px solid var(--border-light)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                          {isImage && (file.url || downloadUrl) ? (
                            <img
                              src={file.url || downloadUrl}
                              alt={file.originalName}
                              style={{
                                width: '40px',
                                height: '40px',
                                objectFit: 'cover',
                                borderRadius: '6px',
                                border: '1px solid var(--border-light)',
                                background: '#111',
                              }}
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <File size={18} color="var(--accent-cyan)" />
                          )}
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {file.originalName}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                              {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.storageType === 'cloudinary' || file.url?.includes('cloudinary') ? 'Cloudinary Hosted' : 'Reference Spec'}
                            </div>
                          </div>
                        </div>

                        <a
                          href={downloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ flexShrink: 0 }}
                        >
                          <Download size={13} />
                          Download
                        </a>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ fontSize: '0.88rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                  No reference files attached to this brief.
                </div>
              )}
            </div>
          </div>

          {/* Admin View: All Submitted Bids Table */}
          {isAdmin && (
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <h3 style={{ fontSize: '1.25rem', margin: 0 }}>All Bidding Designers</h3>
                    <span
                      style={{
                        padding: '0.2rem 0.65rem',
                        borderRadius: '999px',
                        background: 'rgba(99, 102, 241, 0.15)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--accent-primary)',
                      }}
                    >
                      {bids.length} {bids.length === 1 ? 'Candidate' : 'Candidates'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                    All private proposals submitted below the ${project.initialPrice?.toLocaleString()} budget limit
                  </div>
                </div>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowAwardModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Gavel size={14} />
                  {isAssigned ? 'Open Full Comparison' : 'Award Comparison Modal'}
                </button>
              </div>

              {bids.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  <User size={36} color="var(--text-dim)" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontWeight: 500 }}>No designers have placed bids on this project yet.</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>
                    Once bidding is open, eligible designers will submit private offers here.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {bids.map((bid) => {
                    const isWinning =
                      project.winningBid &&
                      (project.winningBid._id === bid._id || project.winningBid === bid._id);
                    const savings = (project.initialPrice || 0) - bid.amount;
                    const savingsPct =
                      project.initialPrice > 0 ? Math.round((savings / project.initialPrice) * 100) : 0;
                    const initials = (bid.designer?.name || 'D')
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <div
                        key={bid._id}
                        style={{
                          padding: '1.25rem',
                          borderRadius: '12px',
                          background: isWinning
                            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.02) 100%)'
                            : 'rgba(255, 255, 255, 0.02)',
                          border: isWinning
                            ? '1.5px solid rgba(16, 185, 129, 0.4)'
                            : '1px solid var(--border-subtle)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.85rem',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {/* Top row: Profile and Price */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '1rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                            <div
                              style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '50%',
                                background: isWinning
                                  ? 'linear-gradient(135deg, #10b981, #059669)'
                                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '0.95rem',
                                color: '#ffffff',
                                boxShadow: isWinning
                                  ? '0 0 12px rgba(16, 185, 129, 0.3)'
                                  : '0 0 12px rgba(99, 102, 241, 0.25)',
                                flexShrink: 0,
                              }}
                            >
                              {initials}
                            </div>

                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <strong style={{ fontSize: '1.02rem', color: 'var(--text-main)' }}>
                                  {bid.designer?.name || 'Designer'}
                                </strong>
                                {isWinning && (
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.25rem',
                                      padding: '0.15rem 0.55rem',
                                      borderRadius: '999px',
                                      background: 'rgba(16, 185, 129, 0.15)',
                                      border: '1px solid rgba(16, 185, 129, 0.3)',
                                      fontSize: '0.72rem',
                                      fontWeight: 700,
                                      color: 'var(--accent-emerald)',
                                    }}
                                  >
                                    <CheckCircle2 size={12} /> Awarded Winner
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.15rem' }}>
                                {bid.designer?.email || 'Registered Designer'}
                              </div>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div
                              style={{
                                fontSize: '1.35rem',
                                fontWeight: 800,
                                color: isWinning ? 'var(--accent-emerald)' : 'var(--text-main)',
                              }}
                            >
                              ${bid.amount}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                              Save ${savings} (-{savingsPct}%)
                            </div>
                          </div>
                        </div>

                        {/* Proposal & Badges */}
                        {bid.proposalText && (
                          <div
                            style={{
                              padding: '0.65rem 0.85rem',
                              borderRadius: '8px',
                              background: 'rgba(0, 0, 0, 0.25)',
                              borderLeft: '3px solid var(--accent-primary)',
                              fontSize: '0.83rem',
                              color: 'var(--text-muted)',
                              fontStyle: 'italic',
                              lineHeight: 1.45,
                            }}
                          >
                            "{bid.proposalText}"
                          </div>
                        )}

                        {/* Bottom Meta & Skills */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '0.6rem',
                            paddingTop: '0.4rem',
                            borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                            fontSize: '0.78rem',
                            color: 'var(--text-dim)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Clock size={13} color="var(--accent-cyan)" />
                              Est. {bid.deliveryDays} Days Turnaround
                            </span>

                            {bid.designer?.skills && bid.designer.skills.length > 0 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                                <Tag size={12} color="var(--text-dim)" />
                                {bid.designer.skills.slice(0, 3).map((skill, idx) => (
                                  <span
                                    key={idx}
                                    style={{
                                      padding: '0.1rem 0.45rem',
                                      borderRadius: '4px',
                                      background: 'rgba(255, 255, 255, 0.05)',
                                      fontSize: '0.7rem',
                                      color: 'var(--text-muted)',
                                    }}
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {!isAssigned && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => setShowAwardModal(true)}
                              style={{ padding: '0.3rem 0.75rem', fontSize: '0.76rem' }}
                            >
                              <Award size={13} /> Select Candidate
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Pricing & Action Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.35rem' }}>
              Initial Project Price
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'baseline', marginBottom: '1.25rem' }}>
              <span style={{ color: 'var(--accent-emerald)', marginRight: 2 }}>$</span>
              {project.initialPrice?.toLocaleString()}
            </div>

            {/* If Designer: Bid Actions & Privacy Notice */}
            {isDesigner && (
              <div>
                {isAwardedToMe ? (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div
                      style={{
                        padding: '0.85rem',
                        borderRadius: '8px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#34d399',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        marginBottom: '1rem',
                        textAlign: 'center',
                      }}
                    >
                      🎉 Awarded to You!
                    </div>
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                      onClick={onNavigateToAssignments}
                    >
                      View Assignment & Deliverables
                    </button>
                  </div>
                ) : (
                  <div>
                    {project.myBid ? (
                      <div style={{ marginBottom: '1.25rem' }}>
                        <div
                          style={{
                            padding: '0.85rem',
                            borderRadius: '8px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.25)',
                            marginBottom: '1rem',
                          }}
                        >
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Your Private Bid</div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#818cf8' }}>
                            ${project.myBid.amount}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            Delivery: {project.myBid.deliveryDays} Days • Status: {project.myBid.status}
                          </div>
                        </div>

                        {isBiddingOpen && (
                          <button
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            onClick={() => setShowBidModal(true)}
                            id="btn-details-edit-bid"
                          >
                            <Gavel size={15} />
                            Update Your Bid
                          </button>
                        )}
                      </div>
                    ) : isBiddingOpen ? (
                      <button
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%', marginBottom: '1.25rem' }}
                        onClick={() => setShowBidModal(true)}
                        id="btn-details-place-bid"
                      >
                        <Gavel size={16} />
                        Place Private Bid
                      </button>
                    ) : (
                      <div
                        style={{
                          padding: '0.85rem',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          color: 'var(--text-dim)',
                          textAlign: 'center',
                          fontSize: '0.88rem',
                          marginBottom: '1.25rem',
                        }}
                      >
                        Bidding is currently closed for this project.
                      </div>
                    )}

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.75rem',
                        color: 'var(--text-dim)',
                        lineHeight: 1.4,
                      }}
                    >
                      <ShieldCheck size={16} color="#34d399" style={{ flexShrink: 0 }} />
                      <span>
                        Bid Privacy: Only the lead administrator can inspect your bid. Other designers cannot see your price.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* If Admin: Management Controls */}
            {isAdmin && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  className={`btn ${isBiddingOpen ? 'btn-secondary' : 'btn-success'}`}
                  style={{ width: '100%' }}
                  onClick={handleToggleBidding}
                >
                  {isBiddingOpen ? <Lock size={15} /> : <Unlock size={15} />}
                  {isBiddingOpen ? 'Close Bidding Window' : 'Open Bidding Window'}
                </button>

                <button
                  className={`btn ${isAssigned ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ width: '100%' }}
                  onClick={() => setShowAwardModal(true)}
                >
                  <Gavel size={15} />
                  {isAssigned ? `Inspect All Bids (${bids.length})` : `Review Bids & Award (${bids.length})`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bid Modal */}
      {showBidModal && (
        <BidModal
          project={project}
          existingBid={project.myBid}
          onClose={() => setShowBidModal(false)}
          onSuccess={fetchProjectDetails}
        />
      )}

      {/* Award Modal */}
      {showAwardModal && (
        <AwardModal
          project={project}
          onClose={() => setShowAwardModal(false)}
          onSuccess={fetchProjectDetails}
        />
      )}
    </div>
  );
};
