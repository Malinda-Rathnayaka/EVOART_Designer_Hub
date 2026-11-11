import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

export const AwardModal = ({ project, onClose, onSuccess }) => {
  const { showToast } = useAuth();
  const [bids, setBids] = useState([]);
  const [designersStats, setDesignersStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [awardingBidId, setAwardingBidId] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [selectedBid, setSelectedBid] = useState(null);

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
    if (!selectedBid) return;

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

  const lowestBid = bids.length > 0 ? Math.min(...bids.map((b) => b.amount)) : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '720px' }}
      >
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
              <Award size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem' }}>Review Bids & Select Winner</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {project?.title} • Initial Price: ${project?.initialPrice?.toLocaleString()}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon-only">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              Loading submitted bids...
            </div>
          ) : bids.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                No Bids Submitted Yet
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Designers have not placed bids on this project yet. Ensure bidding status is set to "Open".
              </p>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Submitted Bids ({bids.length})
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>
                  All bids are strictly lower than initial price ${project.initialPrice}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
                {bids.map((bid) => {
                  const designerId = bid.designer?._id || bid.designer;
                  const designerInfo = designersStats[designerId] || {};
                  const activeCount = designerInfo.activeAssignmentsCount || 0;
                  const isCapacityFull = activeCount >= 3;
                  const isSelected = selectedBid?._id === bid._id;
                  const isLowest = bid.amount === lowestBid;

                  return (
                    <div
                      key={bid._id}
                      onClick={() => !isCapacityFull && setSelectedBid(bid)}
                      style={{
                        padding: '1rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected
                          ? 'rgba(99, 102, 241, 0.12)'
                          : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected
                          ? '2px solid var(--accent-primary)'
                          : '1px solid var(--border-light)',
                        cursor: isCapacityFull ? 'not-allowed' : 'pointer',
                        opacity: isCapacityFull ? 0.65 : 1,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
                              {bid.designer?.name || 'Designer'}
                            </span>
                            {isLowest && (
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  background: 'rgba(16, 185, 129, 0.15)',
                                  color: '#34d399',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  border: '1px solid rgba(16, 185, 129, 0.3)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 2,
                                }}
                              >
                                <Sparkles size={10} /> Lowest Bid
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                            {bid.designer?.email}
                          </span>
                        </div>

                        {/* Bid Amount & Days */}
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                            ${bid.amount?.toLocaleString()}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Est. {bid.deliveryDays} Days
                          </div>
                        </div>
                      </div>

                      {/* Proposal Text */}
                      {bid.proposalText && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
                          "{bid.proposalText}"
                        </p>
                      )}

                      {/* Designer Quota Limit Status */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
                          <span style={{ color: 'var(--text-dim)' }}>Current Active Load:</span>
                          <span
                            style={{
                              fontWeight: 700,
                              color: isCapacityFull ? '#fb7185' : '#818cf8',
                            }}
                          >
                            {activeCount}/3 Active Assignments
                          </span>
                        </div>

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
                            <AlertTriangle size={13} />
                            Quota Reached (Max 3 Active)
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                            {isSelected ? '✓ Selected to Award' : 'Click to select this bid'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedBid && (
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">
                    Optional Admin Onboarding Notes (for {selectedBid.designer?.name})
                  </label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="e.g. Approved. Please coordinate brand assets via project dashboard."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!selectedBid || awardingBidId !== null}
            onClick={handleAward}
            id="btn-confirm-award"
          >
            {awardingBidId ? 'Awarding Assignment...' : `Award Assignment to ${selectedBid?.designer?.name || 'Winner'}`}
          </button>
        </div>
      </div>
    </div>
  );
};
