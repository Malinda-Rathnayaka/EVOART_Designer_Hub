import React from 'react';

export const StatCard = ({ title, value, subtitle, icon, color = '#6366f1', glow = 'rgba(99,102,241,0.2)' }) => {
  return (
    <div className="glass-card stat-card" style={{ padding: '20px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#595959', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</span>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            background: '#f2f2f2',
            border: '1px solid #d9d9d9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000000',
          }}
        >
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '30px', fontWeight: 600, fontFamily: 'var(--font-heading)', color: '#000000', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: '13px', color: '#595959', marginTop: '6px' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};
