import React from 'react';
import { Briefcase, AlertOctagon, CheckCircle } from 'lucide-react';

export const QuotaBadge = ({ activeCount = 0, max = 3, showDetails = false }) => {
  const isFull = activeCount >= max;
  const remaining = Math.max(0, max - activeCount);

  return (
    <div
      className="quota-box"
      style={{
        borderColor: isFull ? 'rgba(244, 63, 94, 0.4)' : 'rgba(255, 255, 255, 0.1)',
        background: isFull ? 'rgba(244, 63, 94, 0.08)' : 'rgba(255, 255, 255, 0.03)',
      }}
      title={`Active Assignments Quota: ${activeCount}/${max}`}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        {isFull ? (
          <AlertOctagon size={16} color="#fb7185" />
        ) : (
          <Briefcase size={16} color="#818cf8" />
        )}
        <span
          style={{
            fontSize: '0.82rem',
            fontWeight: 600,
            color: isFull ? '#fb7185' : 'var(--text-main)',
          }}
        >
          {activeCount}/{max} Active
        </span>
      </div>

      <div className="quota-indicator-bar">
        {[...Array(max)].map((_, i) => (
          <div
            key={i}
            className={`quota-dot ${
              i < activeCount ? (isFull ? 'full-limit' : 'filled') : ''
            }`}
          />
        ))}
      </div>

      {showDetails && (
        <span style={{ fontSize: '0.78rem', color: isFull ? '#fb7185' : 'var(--text-muted)' }}>
          {isFull
            ? 'Capacity Full (Cannot receive new awards)'
            : `${remaining} slot${remaining === 1 ? '' : 's'} available`}
        </span>
      )}
    </div>
  );
};
