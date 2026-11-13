import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = ({ className = '', showLabel = false, size = 'md' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  const isSmall = size === 'sm';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle-btn ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45rem',
        padding: isSmall ? '0.35rem 0.55rem' : '0.4rem 0.75rem',
        borderRadius: 'var(--radius-full)',
        background: isDark
          ? 'rgba(255, 255, 255, 0.05)'
          : 'rgba(0, 0, 0, 0.05)',
        border: isDark
          ? '1px solid rgba(255, 255, 255, 0.12)'
          : '1px solid rgba(0, 0, 0, 0.1)',
        color: isDark ? 'var(--text-main)' : 'var(--text-main)',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        outline: 'none',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.borderColor = isDark ? '#fbbf24' : '#6366f1';
        e.currentTarget.style.boxShadow = isDark
          ? '0 0 12px rgba(251, 191, 36, 0.25)'
          : '0 0 12px rgba(99, 102, 241, 0.25)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.borderColor = isDark
          ? 'rgba(255, 255, 255, 0.12)'
          : 'rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {isDark ? (
          <Sun
            size={isSmall ? 15 : 17}
            color="#fbbf24"
            style={{
              filter: 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.5))',
            }}
          />
        ) : (
          <Moon
            size={isSmall ? 15 : 17}
            color="#6366f1"
            style={{
              filter: 'drop-shadow(0 0 4px rgba(99, 102, 241, 0.4))',
            }}
          />
        )}
      </div>

      {showLabel && (
        <span
          style={{
            fontSize: isSmall ? '0.75rem' : '0.8rem',
            fontWeight: 600,
            letterSpacing: '0.01em',
            color: 'var(--text-main)',
          }}
        >
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
};

