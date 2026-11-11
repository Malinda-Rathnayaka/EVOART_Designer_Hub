import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { QuotaBadge } from './QuotaBadge';
import {
  Layers,
  FolderKanban,
  Users,
  Award,
  Gavel,
  CheckSquare,
  LogOut,
  UserCheck,
  ChevronDown,
} from 'lucide-react';

export const Navbar = ({ currentTab, onSelectTab }) => {
  const { user, logout, login, isAdmin, isDesigner, showToast } = useAuth();
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [registeredDesigners, setRegisteredDesigners] = useState([]);

  // Fetch real database-stored designers when switcher is opened
  useEffect(() => {
    if (showSwitcher) {
      api.getDesigners()
        .then((res) => {
          if (res.success) setRegisteredDesigners(res.data || []);
        })
        .catch(() => {});
    }
  }, [showSwitcher]);

  const handleQuickSwitchAdmin = async () => {
    try {
      setShowSwitcher(false);
      await login('admin@platform.com', 'admin123');
      onSelectTab('projects');
      showToast('Switched to Admin Director', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };


  return (
    <nav className="navbar" id="main-navigation">
      <div className="navbar-inner">
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <a href="#" className="brand-logo" onClick={() => onSelectTab(isAdmin ? 'projects' : 'explore')}>
            <div className="brand-icon">
              <Layers size={18} color="#ffffff" />
            </div>
            <span>
              EVO <span style={{ color: 'var(--accent-cyan)' }}>ART</span>
            </span>
          </a>

          {/* Navigation Links */}
          {user && (
            <ul className="nav-links">
              {isAdmin ? (
                <>
                  <li>
                    <button
                      className={`nav-link ${currentTab === 'projects' ? 'active' : ''}`}
                      onClick={() => onSelectTab('projects')}
                      id="nav-admin-projects"
                    >
                      <FolderKanban size={16} />
                      Projects & Bids
                    </button>
                  </li>
                  <li>
                    <button
                      className={`nav-link ${currentTab === 'designers' ? 'active' : ''}`}
                      onClick={() => onSelectTab('designers')}
                      id="nav-admin-designers"
                    >
                      <Users size={16} />
                      Designer Accounts
                    </button>
                  </li>
                  <li>
                    <button
                      className={`nav-link ${currentTab === 'assignments' ? 'active' : ''}`}
                      onClick={() => onSelectTab('assignments')}
                      id="nav-admin-assignments"
                    >
                      <Award size={16} />
                      Assignments & Reviews
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <button
                      className={`nav-link ${currentTab === 'explore' ? 'active' : ''}`}
                      onClick={() => onSelectTab('explore')}
                      id="nav-designer-explore"
                    >
                      <FolderKanban size={16} />
                      Browse Projects
                    </button>
                  </li>
                  <li>
                    <button
                      className={`nav-link ${currentTab === 'my-bids' ? 'active' : ''}`}
                      onClick={() => onSelectTab('my-bids')}
                      id="nav-designer-bids"
                    >
                      <Gavel size={16} />
                      My Private Bids
                    </button>
                  </li>
                  <li>
                    <button
                      className={`nav-link ${currentTab === 'my-assignments' ? 'active' : ''}`}
                      onClick={() => onSelectTab('my-assignments')}
                      id="nav-designer-assignments"
                    >
                      <CheckSquare size={16} />
                      My Assignments
                    </button>
                  </li>
                </>
              )}
            </ul>
          )}
        </div>

        {/* Right Section: Quota, Quick Demo Switcher, Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isDesigner && (
            <QuotaBadge
              activeCount={user.activeAssignmentsCount || 0}
              max={user.maxActiveAssignments || 3}
            />
          )}

          {/* Quick Demo Switcher Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowSwitcher(!showSwitcher)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
              title="Quick switch demo test user"
              id="btn-switch-account"
            >
              <UserCheck size={14} color="#818cf8" />
              <span>Switch User</span>
              <ChevronDown size={12} />
            </button>

            {showSwitcher && (
              <div
                style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: '260px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.6rem',
                  zIndex: 100,
                }}
              >
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', padding: '0.2rem 0.5rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  Maintained Admin (Seed)
                </div>
                <button
                  type="button"
                  onClick={handleQuickSwitchAdmin}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.5rem 0.65rem',
                    borderRadius: '6px',
                    background: isAdmin ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    color: isAdmin ? '#818cf8' : 'var(--text-main)',
                    fontSize: '0.82rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    border: 'none',
                    cursor: 'pointer',
                    marginBottom: '0.5rem',
                  }}
                  id="btn-switch-admin"
                >
                  <span style={{ fontWeight: 600 }}>Admin (Lead Director)</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>admin@platform.com</span>
                </button>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', marginTop: '0.3rem' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', padding: '0.2rem 0.5rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    Registered Designers in DB ({registeredDesigners.length})
                  </div>
                  {registeredDesigners.length === 0 ? (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.4rem 0.5rem' }}>
                      No designers yet. Create designer accounts in the Designer Accounts tab.
                    </div>
                  ) : (
                    registeredDesigners.slice(0, 5).map((d) => (
                      <div
                        key={d._id}
                        style={{
                          padding: '0.4rem 0.5rem',
                          borderRadius: '6px',
                          background: user?._id === d._id ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                          color: user?._id === d._id ? '#38bdf8' : 'var(--text-main)',
                          fontSize: '0.8rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <span style={{ fontWeight: 600, display: 'block' }}>{d.name}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{d.email}</span>
                        </div>
                        <span style={{ fontSize: '0.68rem', color: d.isActive ? '#34d399' : '#fb7185' }}>
                          {d.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          {user && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-light)',
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: isAdmin ? 'var(--accent-purple)' : 'var(--accent-cyan)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {user.name?.charAt(0)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{user.name.split(' ')[0]}</span>
                <span style={{ fontSize: '0.68rem', color: isAdmin ? '#c084fc' : '#38bdf8', textTransform: 'capitalize' }}>
                  {user.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="btn btn-secondary btn-icon-only"
                style={{ padding: '0.3rem', marginLeft: '0.35rem' }}
                title="Log out"
                id="btn-logout"
              >
                <LogOut size={14} color="#f43f5e" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
