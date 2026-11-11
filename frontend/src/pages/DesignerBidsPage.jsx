import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { BidModal } from '../components/BidModal';
import {
  Gavel,
  CheckCircle2,
  XCircle,
  Clock,
  Edit2,
  Calendar,
  DollarSign,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export const DesignerBidsPage = ({ onViewDetails }) => {
  const { showToast } = useAuth();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBid, setEditingBid] = useState(null);

  const fetchMyBids = async () => {
    try {
      setLoading(true);
      const res = await api.getMyBids();
      if (res.success) {
        setBids(res.data || []);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBids();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return <span className="badge badge-approved"><CheckCircle2 size={12} /> Accepted (Awarded)</span>;
      case 'rejected':
        return <span className="badge badge-cancelled"><XCircle size={12} /> Not Selected</span>;
      case 'submitted':
      default:
        return <span className="badge badge-progress"><Clock size={12} /> Under Admin Review</span>;
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
          <h1 style={{ marginBottom: '0.25rem' }}>My Private Bids</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Track all private bids submitted for client design projects
          </p>
        </div>

        <button onClick={fetchMyBids} className="btn btn-secondary">
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Privacy Guarantee Notice */}
      <div
        style={{
          padding: '0.85rem 1.25rem',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <ShieldCheck size={20} color="#34d399" />
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <strong>Bid Privacy Enforced:</strong> Your bids are 100% confidential. Neither other designers nor external visitors can view your bid amounts, timeline, or proposals.
        </span>
      </div>

      {/* Bids List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          Loading your bids...
        </div>
      ) : bids.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
          <Gavel size={40} color="var(--text-dim)" style={{ margin: '0 auto 1rem auto' }} />
          <h3>No Bids Submitted Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            You haven't submitted any bids on open projects yet.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {bids.map((bid) => {
            const project = bid.project || {};
            const isBiddingStillOpen = project.biddingStatus === 'open';

            return (
              <div
                key={bid._id}
                className="glass-card"
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1.25rem',
                }}
              >
                {/* Project Details */}
                <div style={{ flex: '1 1 320px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
                    {getStatusBadge(bid.status)}
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--accent-cyan)',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                      }}
                    >
                      {project.category || 'Design'}
                    </span>
                  </div>

                  <h3
                    style={{ fontSize: '1.15rem', marginBottom: '0.5rem', cursor: 'pointer' }}
                    onClick={() => onViewDetails(project)}
                  >
                    {project.title}
                  </h3>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <div>
                      Initial Project Price: <strong style={{ color: 'var(--text-main)' }}>${project.initialPrice}</strong>
                    </div>
                    <div>
                      Your Private Bid: <strong style={{ color: 'var(--accent-emerald)' }}>${bid.amount}</strong>
                    </div>
                    <div>
                      Delivery: <strong style={{ color: 'var(--text-main)' }}>{bid.deliveryDays} Days</strong>
                    </div>
                  </div>

                  {bid.proposalText && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                      "{bid.proposalText}"
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  {isBiddingStillOpen && bid.status === 'submitted' && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setEditingBid({ project, existingBid: bid })}
                      id="btn-edit-bid"
                    >
                      <Edit2 size={14} />
                      Update Bid
                    </button>
                  )}
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onViewDetails(project)}
                  >
                    View Project
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Bid Modal */}
      {editingBid && (
        <BidModal
          project={editingBid.project}
          existingBid={editingBid.existingBid}
          onClose={() => setEditingBid(null)}
          onSuccess={fetchMyBids}
        />
      )}
    </div>
  );
};
