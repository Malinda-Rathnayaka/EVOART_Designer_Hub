import React from 'react';

export const StatCard = ({ title, value, subtitle, icon, color = '#6366f1', glow = 'rgba(99,102,241,0.2)' }) => {
  return (
    <div className="glass-card" style={{ padding: '1.25rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          top: '-15px',
          right: '-15px',
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: glow,
          filter: 'blur(20px)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>{title}</span>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${color}33`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
          }}
        >
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '1.85rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.35rem' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};
