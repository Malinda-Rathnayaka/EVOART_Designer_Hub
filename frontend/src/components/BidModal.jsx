import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { X, ShieldCheck, DollarSign, Calendar, AlertCircle } from 'lucide-react';

export const BidModal = ({ project, existingBid, onClose, onSuccess }) => {
  const { showToast } = useAuth();
  const [amount, setAmount] = useState(existingBid ? existingBid.amount : '');
  const [deliveryDays, setDeliveryDays] = useState(existingBid ? existingBid.deliveryDays : 3);
  const [proposalText, setProposalText] = useState(existingBid ? existingBid.proposalText : '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const initialPrice = project ? project.initialPrice : 0;
  const numAmount = Number(amount);
  const isInvalidAmount = amount !== '' && (numAmount >= initialPrice || numAmount <= 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!amount || numAmount <= 0) {
      setError('Please provide a valid bid amount');
      return;
    }

    if (numAmount >= initialPrice) {
      setError(`Your bid ($${numAmount}) must be strictly lower than the initial project price ($${initialPrice})`);
      return;
    }

    setSubmitting(true);
    try {
      if (existingBid) {
        await api.updateBid(existingBid._id, {
          amount: numAmount,
          deliveryDays: Number(deliveryDays),
          proposalText,
        });
        showToast('Your bid was successfully updated!', 'success');
      } else {
        await api.submitBid({
          projectId: project._id,
          amount: numAmount,
          deliveryDays: Number(deliveryDays),
          proposalText,
        });
        showToast('Your private bid was successfully placed!', 'success');
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit bid');
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
              }}
            >
              <DollarSign size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>
                {existingBid ? 'Update Your Bid' : 'Submit Private Bid'}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {project?.title}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon-only">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Price guideline notice */}
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                marginBottom: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Initial Project Price
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  ${initialPrice.toLocaleString()}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Maximum Allowed Bid
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                  Under ${initialPrice.toLocaleString()}
                </div>
              </div>
            </div>

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

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Your Bid Amount ($USD) *
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder={`Must be < $${initialPrice}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  max={initialPrice - 1}
                  required
                  id="input-bid-amount"
                />
                {isInvalidAmount && (
                  <span style={{ fontSize: '0.75rem', color: '#fb7185', marginTop: '0.2rem' }}>
                    Bid must be strictly lower than ${initialPrice}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Estimated Delivery (Days) *
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 5"
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(e.target.value)}
                  min="1"
                  max="90"
                  required
                  id="input-bid-days"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Proposal & Approach Notes
              </label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Describe your design methodology, relevant portfolio experience, and deliverable commitments..."
                value={proposalText}
                onChange={(e) => setProposalText(e.target.value)}
                id="input-bid-proposal"
              />
            </div>

            {/* Privacy Guarantee Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.78rem',
                color: 'var(--text-dim)',
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <ShieldCheck size={16} color="#34d399" />
              <span>
                <strong>Bid Privacy Protected:</strong> Only the platform administrator can review your bid. Other designers can never inspect your bid amount or proposal.
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || isInvalidAmount || !amount}
              id="btn-submit-bid"
            >
              {submitting ? 'Submitting...' : existingBid ? 'Update Bid' : 'Confirm & Place Bid'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
