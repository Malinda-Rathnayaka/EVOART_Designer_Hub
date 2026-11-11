import React from 'react';
import { useAuth } from '../context/AuthContext';
import { QuotaBadge } from './QuotaBadge';
import {
  Layers,
  FolderKanban,
  Users,
  Award,
  Gavel,
  CheckSquare,
  LogOut,
} from 'lucide-react';

export const Navbar = ({ currentTab, onSelectTab }) => {
  const { user, logout, isAdmin, isDesigner } = useAuth();

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

        {/* Right Section: Quota & User Profile with Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isDesigner && (
            <QuotaBadge
              activeCount={user.activeAssignmentsCount || 0}
              max={user.maxActiveAssignments || 3}
            />
          )}

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
