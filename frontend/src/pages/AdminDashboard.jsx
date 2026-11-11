import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectModal } from '../components/ProjectModal';
import { AwardModal } from '../components/AwardModal';
import {
  FolderKanban,
  Unlock,
  Award,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  Filter,
} from 'lucide-react';

export const AdminDashboard = ({ onViewDetails }) => {
  const { showToast } = useAuth();
  const [projects, setProjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [awardProjectTarget, setAwardProjectTarget] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [projRes, assignRes] = await Promise.all([
        api.getProjects(),
        api.getAdminAssignments(),
      ]);

      if (projRes.success) {
        setProjects(projRes.data || []);
      }
      if (assignRes.success) {
        setAssignments(assignRes.data || []);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleBidding = async (projectId, newStatus) => {
    try {
      await api.toggleBidding(projectId, newStatus);
      showToast(`Bidding is now ${newStatus} for this project`, 'success');
      fetchDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Metrics computation
  const totalProjects = projects.length;
  const openBiddingCount = projects.filter((p) => p.biddingStatus === 'open').length;
  const activeAssignmentsCount = assignments.filter((a) =>
    ['in_progress', 'under_review', 'revision_requested'].includes(a.status)
  ).length;
  const pendingReviewCount = assignments.filter((a) => a.status === 'under_review').length;

  // Filtered projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.category?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'open') return project.biddingStatus === 'open';
    if (filterTab === 'assigned') return project.status === 'assigned';
    if (filterTab === 'completed') return project.status === 'completed';
    return true;
  });

  return (
    <div>
      {/* Dashboard Top Header */}
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
          <h1 style={{ marginBottom: '0.25rem' }}>Project Command Center</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage client design briefs, toggle bidding windows, and select winning designers
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={fetchDashboardData}
            className="btn btn-secondary"
            title="Refresh dashboard data"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
          <button
            onClick={() => setShowProjectModal(true)}
            className="btn btn-primary"
            id="btn-create-project-open"
          >
            <Plus size={16} />
            Create Design Project
          </button>
        </div>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid-stats" style={{ marginBottom: '2.5rem' }}>
        <StatCard
          title="Total Projects"
          value={totalProjects}
          subtitle="Portfolio projects created"
          icon={<FolderKanban size={20} />}
          color="#6366f1"
          glow="rgba(99, 102, 241, 0.25)"
        />
        <StatCard
          title="Open for Bidding"
          value={openBiddingCount}
          subtitle="Active designer bidding"
          icon={<Unlock size={20} />}
          color="#10b981"
          glow="rgba(16, 185, 129, 0.25)"
        />
        <StatCard
          title="Active Assignments"
          value={activeAssignmentsCount}
          subtitle="Max 3 active per designer"
          icon={<Award size={20} />}
          color="#06b6d4"
          glow="rgba(6, 182, 212, 0.25)"
        />
        <StatCard
          title="Pending Reviews"
          value={pendingReviewCount}
          subtitle="Deliverables awaiting sign-off"
          icon={<CheckCircle2 size={20} />}
          color="#a855f7"
          glow="rgba(168, 85, 247, 0.25)"
        />
      </div>

      {/* Filter Tabs & Search */}
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
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.04)', padding: '0.3rem', borderRadius: 'var(--radius-md)' }}>
          {[
            { id: 'all', label: `All (${projects.length})` },
            { id: 'open', label: `Bidding Open (${openBiddingCount})` },
            { id: 'assigned', label: 'Assigned' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`btn btn-sm ${filterTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                border: filterTab === tab.id ? 'none' : 'transparent',
                background: filterTab === tab.id ? undefined : 'transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '280px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.3rem', fontSize: '0.85rem' }}
          />
          <Search
            size={15}
            color="var(--text-dim)"
            style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }}
          />
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          Loading projects...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
          <FolderKanban size={40} color="var(--text-dim)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>No Projects Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            No projects matched your active filter or search query.
          </p>
          <button
            onClick={() => setShowProjectModal(true)}
            className="btn btn-primary"
          >
            <Plus size={16} />
            Create First Project
          </button>
        </div>
      ) : (
        <div className="grid-cards">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onOpenAwardModal={(proj) => setAwardProjectTarget(proj)}
              onToggleBidding={handleToggleBidding}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showProjectModal && (
        <ProjectModal
          onClose={() => setShowProjectModal(false)}
          onSuccess={fetchDashboardData}
        />
      )}

      {/* Award Winner Modal */}
      {awardProjectTarget && (
        <AwardModal
          project={awardProjectTarget}
          onClose={() => setAwardProjectTarget(null)}
          onSuccess={fetchDashboardData}
        />
      )}
    </div>
  );
};
