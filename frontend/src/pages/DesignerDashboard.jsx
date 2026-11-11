import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ProjectCard } from '../components/ProjectCard';
import { BidModal } from '../components/BidModal';
import { QuotaBadge } from '../components/QuotaBadge';
import {
  FolderKanban,
  Search,
  RefreshCw,
  ShieldCheck,
  Briefcase,
  AlertOctagon,
} from 'lucide-react';

export const DesignerDashboard = ({ onViewDetails }) => {
  const { user, showToast, refreshUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Bid Modal state
  const [bidModalTarget, setBidModalTarget] = useState(null);
  const [existingBidTarget, setExistingBidTarget] = useState(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.getProjects({ biddingStatus: 'open' });
      if (res.success) {
        setProjects(res.data || []);
      }
      await refreshUser();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenBidModal = (project, existingBid) => {
    setBidModalTarget(project);
    setExistingBidTarget(existingBid || null);
  };

  const activeCount = user?.activeAssignmentsCount || 0;
  const isFullCapacity = activeCount >= 3;

  // Filter projects
  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* Top Welcome & Quota Alert Banner */}
      <div
        className="glass-card"
        style={{
          padding: '1.5rem',
          marginBottom: '2rem',
          background: isFullCapacity
            ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.12) 0%, rgba(18, 24, 40, 0.8) 100%)'
            : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(18, 24, 40, 0.8) 100%)',
          borderColor: isFullCapacity ? 'rgba(244, 63, 94, 0.3)' : 'rgba(99, 102, 241, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <h1 style={{ fontSize: '1.5rem' }}>
              Welcome back, {user?.name?.split(' ')[0]}
            </h1>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                background: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--accent-cyan)',
                fontWeight: 600,
              }}
            >
              Verified Designer
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Browse open design projects and place private bids below the initial price.
          </p>
        </div>

        {/* Quota Card */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
          <QuotaBadge activeCount={activeCount} max={3} showDetails={true} />
          {isFullCapacity && (
            <span style={{ fontSize: '0.75rem', color: '#fb7185', fontWeight: 600 }}>
              Complete an active assignment to accept new contracts
            </span>
          )}
        </div>
      </div>

      {/* Controls & Search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['all', 'UI/UX Design', 'Brand Identity', '3D & Rendering', 'Web Design'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
              }}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search available projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.3rem' }}
            />
            <Search
              size={15}
              color="var(--text-dim)"
              style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>

          <button onClick={fetchProjects} className="btn btn-secondary btn-icon-only" title="Refresh">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          Loading open design projects...
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
          <FolderKanban size={40} color="var(--text-dim)" style={{ margin: '0 auto 1rem auto' }} />
          <h3>No Open Projects Right Now</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Check back soon for new project briefs published by the platform director.
          </p>
        </div>
      ) : (
        <div className="grid-cards">
          {filtered.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onOpenBidModal={handleOpenBidModal}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}

      {/* Place/Edit Bid Modal */}
      {bidModalTarget && (
        <BidModal
          project={bidModalTarget}
          existingBid={existingBidTarget}
          onClose={() => {
            setBidModalTarget(null);
            setExistingBidTarget(null);
          }}
          onSuccess={fetchProjects}
        />
      )}
    </div>
  );
};
