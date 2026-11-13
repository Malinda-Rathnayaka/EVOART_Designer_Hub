import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  X,
  Award,
  DollarSign,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Tag,
  SlidersHorizontal,
  Layers,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const AwardModal = ({ project, onClose, onSuccess }) => {
  const { showToast } = useAuth();
  const [bids, setBids] = useState([]);
  const [designersStats, setDesignersStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [awardingBidId, setAwardingBidId] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [selectedBid, setSelectedBid] = useState(null);
  const [sortBy, setSortBy] = useState('price_asc'); // 'price_asc' | 'days_asc' | 'newest'

  const isAssigned = project?.status === 'assigned' || project?.status === 'completed';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bidsRes, designersRes] = await Promise.all([
          api.getProjectBids(project._id),
          api.getDesigners(),
        ]);

        if (bidsRes.success) {
          setBids(bidsRes.data || []);
        }

        if (designersRes.success) {
          const stats = {};
          (designersRes.data || []).forEach((d) => {
            stats[d._id] = d;
          });
          setDesignersStats(stats);
        }
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [project._id, showToast]);

  const handleAward = async () => {
    if (!selectedBid || isAssigned) return;

    try {
      setAwardingBidId(selectedBid._id);
      await api.awardProject({
        projectId: project._id,
        bidId: selectedBid._id,
        adminNotes,
      });

      showToast(
        `Assignment awarded to ${selectedBid.designer?.name || 'Designer'}!`,
        'success'
      );
      onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to award assignment', 'error');
    } finally {
      setAwardingBidId(null);
    }
  };

  // Metrics computation for admin clarity
  const lowestBid = bids.length > 0 ? Math.min(...bids.map((b) => b.amount)) : null;
  const fastestDays = bids.length > 0 ? Math.min(...bids.map((b) => b.deliveryDays || 999)) : null;
  const avgBid = bids.length > 0
    ? Math.round(bids.reduce((sum, b) => sum + (b.amount || 0), 0) / bids.length)
    : null;

  // Sorted bids according to active filter
  const sortedBids = useMemo(() => {
    return [...bids].sort((a, b) => {
      if (sortBy === 'price_asc') return a.amount - b.amount;
      if (sortBy === 'days_asc') return (a.deliveryDays || 0) - (b.deliveryDays || 0);
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });
  }, [bids, sortBy]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: isAssigned ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isAssigned ? '#34d399' : 'var(--accent-primary)',
              }}
            >
              <Award size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>
                {isAssigned ? 'Bidding Designers & Project Candidate History' : 'Review Bids & Award Assignment'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {project?.title} • Initial Budget: <strong style={{ color: 'var(--text-main)' }}>${project?.initialPrice?.toLocaleString()}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon-only">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
              Loading candidate designer bids...
            </div>
          ) : bids.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                No Bids Submitted Yet
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Designers have not placed bids on this project yet. Ensure bidding status is set to "Open" to receive proposals.
              </p>
            </div>
          ) : (
            <div>
              {/* Top Quick Metrics Summary Banner */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '0.75rem',
                  padding: '0.85rem 1.1rem',
                  background: 'rgba(255, 255, 255, 0.025)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Total Candidates
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {bids.length} Designer{bids.length === 1 ? '' : 's'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Lowest Offer
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    ${lowestBid?.toLocaleString()}
                    {project.initialPrice && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#10b981' }}>
                        (-${project.initialPrice - lowestBid})
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Average Bid
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                    ${avgBid?.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Fastest Turnaround
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#818cf8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={16} />
                    {fastestDays} Days
                  </div>
                </div>
              </div>

              {/* Sort & Filter Controls */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  marginBottom: '1rem',
                  paddingBottom: '0.65rem',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  All Designer Proposals ({bids.length})
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <SlidersHorizontal size={12} />
                    Sort:
                  </span>
                  {[
                    { id: 'price_asc', label: 'Lowest Price' },
                    { id: 'days_asc', label: 'Fastest Delivery' },
                    { id: 'newest', label: 'Newest' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSortBy(s.id)}
                      className={`btn btn-sm ${sortBy === s.id ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '0.74rem', padding: '0.25rem 0.6rem' }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bids List with Detailed Designer Profiles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {sortedBids.map((bid) => {
                  const designerId = bid.designer?._id || bid.designer;
                  const designerInfo = designersStats[designerId] || bid.designer || {};
                  const activeCount = designerInfo.activeAssignmentsCount || 0;
                  const isCapacityFull = activeCount >= 3;
                  const isSelected = selectedBid?._id === bid._id;
                  const isLowest = bid.amount === lowestBid;
                  const isFastest = bid.deliveryDays === fastestDays;
                  const savings = project.initialPrice ? project.initialPrice - bid.amount : 0;
                  const savingsPercent = project.initialPrice ? Math.round((savings / project.initialPrice) * 100) : 0;
                  const isWinning =
                    project.winningBid?._id === bid._id ||
                    project.winningBid === bid._id ||
                    (project.winningDesigner &&
                      (project.winningDesigner._id === designerId || project.winningDesigner === designerId));

                  return (
                    <div
                      key={bid._id}
                      onClick={() => !isAssigned && !isCapacityFull && setSelectedBid(bid)}
                      style={{
                        padding: '1.15rem 1.35rem',
                        borderRadius: 'var(--radius-md)',
                        background: isWinning
                          ? 'rgba(16, 185, 129, 0.08)'
                          : isSelected
                          ? 'rgba(99, 102, 241, 0.12)'
                          : 'rgba(255, 255, 255, 0.03)',
                        border: isWinning
                          ? '2px solid rgba(16, 185, 129, 0.5)'
                          : isSelected
                          ? '2px solid var(--accent-primary)'
                          : '1px solid var(--border-light)',
                        cursor: isAssigned || isCapacityFull ? 'default' : 'pointer',
                        opacity: !isWinning && isCapacityFull ? 0.65 : 1,
                        transition: 'all 0.2s ease',
                        position: 'relative',
                      }}
                    >
                      {/* Top Header Row: Designer Avatar + Bio + Bid Pricing */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                        {/* Designer Identity */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                          {/* Designer Initial Avatar */}
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '50%',
                              background: isWinning
                                ? 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)'
                                : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                              color: '#ffffff',
                              fontSize: '1.1rem',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                              flexShrink: 0,
                            }}
                          >
                            {bid.designer?.name?.charAt(0) || 'D'}
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                                {bid.designer?.name || 'Designer'}
                              </span>

                              {isWinning && (
                                <span
                                  style={{
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    background: 'rgba(16, 185, 129, 0.2)',
                                    color: '#34d399',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(16, 185, 129, 0.4)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                  }}
                                >
                                  <Award size={12} /> Awarded Winner
                                </span>
                              )}

                              {isLowest && (
                                <span
                                  style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    background: 'rgba(16, 185, 129, 0.15)',
                                    color: '#34d399',
                                    padding: '2px 7px',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 3,
                                  }}
                                >
                                  <Sparkles size={11} /> Lowest Price
                                </span>
                              )}

                              {isFastest && (
                                <span
                                  style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    background: 'rgba(6, 182, 212, 0.15)',
                                    color: '#38bdf8',
                                    padding: '2px 7px',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(6, 182, 212, 0.3)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 3,
                                  }}
                                >
                                  <Zap size={11} /> Fastest Delivery
                                </span>
                              )}
                            </div>

                            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.15rem' }}>
                              {bid.designer?.email}
                            </div>
                          </div>
                        </div>

                        {/* Bid Pricing & Delivery Box */}
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--accent-emerald)', lineHeight: 1.1 }}>
                            ${bid.amount?.toLocaleString()}
                          </div>
                          {savings > 0 && (
                            <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>
                              Save ${savings} ({savingsPercent}% under budget)
                            </div>
                          )}
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.3rem', marginTop: '0.25rem' }}>
                            <Calendar size={12} color="var(--accent-cyan)" />
                            Est. {bid.deliveryDays} Days
                          </div>
                        </div>
                      </div>

                      {/* Designer Skills Tags */}
                      {designerInfo.skills && designerInfo.skills.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>
                            Skills:
                          </span>
                          {designerInfo.skills.map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              style={{
                                fontSize: '0.72rem',
                                padding: '1px 7px',
                                borderRadius: '4px',
                                background: 'rgba(99, 102, 241, 0.12)',
                                color: '#a5b4fc',
                                border: '1px solid rgba(99, 102, 241, 0.25)',
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Designer Bio Snippet */}
                      {designerInfo.bio && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.65rem', fontStyle: 'italic' }}>
                          Bio: {designerInfo.bio}
                        </div>
                      )}

                      {/* Designer Proposal Notes Box */}
                      {bid.proposalText && (
                        <div
                          style={{
                            padding: '0.6rem 0.85rem',
                            background: 'rgba(0, 0, 0, 0.2)',
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            fontSize: '0.84rem',
                            color: '#cbd5e1',
                            marginBottom: '0.75rem',
                            lineHeight: 1.45,
                          }}
                        >
                          <strong style={{ color: '#818cf8', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.2rem' }}>
                            Proposal Details:
                          </strong>
                          "{bid.proposalText}"
                        </div>
                      )}

                      {/* Footer: Capacity status & Selection Check */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: '0.6rem',
                          borderTop: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
                          <span style={{ color: 'var(--text-dim)' }}>Workload Status:</span>
                          <span
                            style={{
                              fontWeight: 700,
                              color: isCapacityFull ? '#fb7185' : '#34d399',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                          >
                            <ShieldCheck size={13} />
                            {activeCount}/3 Active Assignments {isCapacityFull ? '(At Full Capacity)' : '(Available)'}
                          </span>
                        </div>

                        {!isAssigned && (
                          <div>
                            {isCapacityFull ? (
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  color: '#fb7185',
                                  fontWeight: 600,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                }}
                              >
                                <AlertTriangle size={13} /> Cannot Award (Quota Full)
                              </span>
                            ) : (
                              <span
                                style={{
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  color: isSelected ? 'var(--accent-primary)' : 'var(--text-dim)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                }}
                              >
                                {isSelected ? (
                                  <>
                                    <CheckCircle2 size={15} color="var(--accent-primary)" />
                                    Selected to Award
                                  </>
                                ) : (
                                  'Click to select'
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Admin Onboarding Notes (Only when awarding an open project) */}
              {!isAssigned && selectedBid && (
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">
                    Onboarding Instructions & Message for {selectedBid.designer?.name}
                  </label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="e.g. Congratulations! Your bid was accepted. Please check the project brief and kick off the discovery wireframes."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Close
          </button>
          {!isAssigned && (
            <button
              type="button"
              className="btn btn-primary"
              disabled={!selectedBid || awardingBidId !== null}
              onClick={handleAward}
              id="btn-confirm-award"
            >
              {awardingBidId
                ? 'Awarding Assignment...'
                : selectedBid
                ? `Award Assignment to ${selectedBid.designer?.name || 'Winner'}`
                : 'Select a Designer Bid Above'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
