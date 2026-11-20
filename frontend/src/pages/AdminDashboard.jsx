import React, { useState, useEffect, useRef } from 'react';
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
  Bell,
} from 'lucide-react';

export const AdminDashboard = ({ onViewDetails }) => {
  const { showToast } = useAuth();
  const [projects, setProjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bidNotifications, setBidNotifications] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('evo_admin_bid_notifications') || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  const [showBidNotifications, setShowBidNotifications] = useState(false);
  const [unreadBidNotifications, setUnreadBidNotifications] = useState(0);
  const seenBidSignatures = useRef(new Map());
  const notificationsInitialized = useRef(false);

  useEffect(() => {
    try {
      localStorage.setItem(
        'evo_admin_bid_notifications',
        JSON.stringify(bidNotifications)
      );
    } catch {
      // Notifications remain available for the current session.
    }
  }, [bidNotifications]);

  useEffect(() => {
    if (!('BroadcastChannel' in window)) return undefined;

    const channel = new BroadcastChannel('evo-art-bid-events');
    channel.onmessage = (event) => {
      const activity = event.data;
      if (!activity || !['bid_submitted', 'bid_updated'].includes(activity.type)) return;

      const notification = {
        id: `${activity.bidId || activity.projectId}-${activity.createdAt}`,
        projectId: activity.projectId,
        projectTitle: activity.projectTitle,
        title:
          activity.type === 'bid_updated'
            ? `${activity.designerName} updated a bid`
            : `${activity.designerName} submitted a bid`,
        detail: `${activity.projectTitle}: LKR ${Number(activity.amount).toLocaleString()} · ${activity.deliveryDays} days`,
        createdAt: new Date(activity.createdAt),
      };

      setBidNotifications((current) => {
        if (
          current.some(
            (item) => item.id === notification.id ||
              (item.title === notification.title && item.detail === notification.detail)
          )
        ) return current;
        setUnreadBidNotifications((count) => count + 1);
        return [notification, ...current].slice(0, 20);
      });
      showToast(notification.title, 'success');
    };

    return () => channel.close();
  }, [showToast]);

  // Modals state
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [awardProjectTarget, setAwardProjectTarget] = useState(null);
  // Edit modal: holds the project being edited (null = closed)
  const [editProjectTarget, setEditProjectTarget] = useState(null);

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

  useEffect(() => {
    let cancelled = false;

    const pollBidActivity = async () => {
      try {
        const projectsRes = await api.getProjects();
        if (!projectsRes.success || cancelled) return;

        const projectList = projectsRes.data || [];
        const bidLists = await Promise.all(
          projectList.map(async (project) => {
            const bidRes = await api.getProjectBids(project._id);
            return bidRes.success
              ? (bidRes.data || []).map((bid) => ({
                  ...bid,
                  projectId: project._id,
                  projectTitle: project.title,
                }))
              : [];
          })
        );
        const allBids = bidLists.flat();

        allBids.forEach((bid) => {
          const signature = [
            bid.updatedAt,
            bid.amount,
            bid.deliveryDays,
            bid.proposalText || '',
            bid.status,
            (bid.revisions || []).map((revision) =>
              `${revision.amount}:${revision.deliveryDays}:${revision.createdAt}`
            ).join('|'),
          ].join(':');
          const previous = seenBidSignatures.current.get(bid._id);

          if (!notificationsInitialized.current) {
            seenBidSignatures.current.set(bid._id, signature);
            return;
          }

          if (previous && previous !== signature) {
            const notification = {
              id: `${bid._id}-${Date.now()}`,
              projectId: bid.project?._id || bid.project,
              projectTitle: bid.projectTitle,
              title: `${bid.designer?.name || 'A designer'} updated a bid`,
              detail: `${bid.projectTitle}: LKR ${bid.amount?.toLocaleString()} · ${bid.deliveryDays} days`,
              createdAt: bid.updatedAt || new Date(),
            };
            setBidNotifications((current) =>
              current.some((item) => item.title === notification.title && item.detail === notification.detail)
                ? current
                : (() => {
                    setUnreadBidNotifications((count) => count + 1);
                    return [notification, ...current].slice(0, 20);
                  })()
            );
            showToast(notification.title, 'success');
          } else if (!previous) {
            const notification = {
              id: `${bid._id}-${Date.now()}`,
              projectId: bid.project?._id || bid.project,
              projectTitle: bid.projectTitle,
              title: `${bid.designer?.name || 'A designer'} submitted a bid`,
              detail: `${bid.projectTitle}: LKR ${bid.amount?.toLocaleString()} · ${bid.deliveryDays} days`,
              createdAt: bid.createdAt || new Date(),
            };
            setBidNotifications((current) =>
              current.some((item) => item.title === notification.title && item.detail === notification.detail)
                ? current
                : (() => {
                    setUnreadBidNotifications((count) => count + 1);
                    return [notification, ...current].slice(0, 20);
                  })()
            );
            showToast(notification.title, 'success');
          }

          seenBidSignatures.current.set(bid._id, signature);
        });

        notificationsInitialized.current = true;
      } catch {
        // Keep the dashboard available; the next polling cycle will retry.
      }
    };

    pollBidActivity();
    const intervalId = window.setInterval(pollBidActivity, 10000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [showToast]);

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
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="btn btn-secondary btn-icon-only"
              onClick={() => {
                setShowBidNotifications((visible) => {
                  if (!visible) setUnreadBidNotifications(0);
                  return !visible;
                });
              }}
              title="Bid notifications"
              aria-label={`Bid notifications, ${unreadBidNotifications} unread`}
              style={{ position: 'relative' }}
            >
              <Bell size={16} />
              {unreadBidNotifications > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    minWidth: '18px',
                    height: '18px',
                    borderRadius: '9999px',
                    background: '#000000',
                    color: '#ffffff',
                    border: '2px solid #ffffff',
                    fontSize: '10px',
                    lineHeight: '14px',
                    textAlign: 'center',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {unreadBidNotifications}
                </span>
              )}
            </button>
            {showBidNotifications && (
              <div
                style={{
                  position: 'absolute',
                  top: '52px',
                  left: '0',
                  zIndex: 70,
                  width: '340px',
                  maxHeight: '420px',
                  overflowY: 'auto',
                  border: '1px solid #d9d9d9',
                  borderRadius: '8px',
                  background: '#ffffff',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                  padding: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px' }}>
                  <strong style={{ fontSize: '15px', color: '#000000' }}>Bid Notifications</strong>
                  {bidNotifications.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => {
                        setBidNotifications([]);
                        setUnreadBidNotifications(0);
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
                {bidNotifications.length === 0 ? (
                  <p style={{ padding: '16px 8px', color: '#595959', fontSize: '13px' }}>No bid activity yet.</p>
                ) : (
                  bidNotifications.map((notification) => (
                    <button
                      type="button"
                      key={notification.id}
                      onClick={() => {
                        const project = projects.find(
                          (item) => item._id === notification.projectId
                        );
                        setShowBidNotifications(false);
                        if (project) {
                          setAwardProjectTarget(project);
                        } else if (notification.projectId) {
                          api.getProjectById(notification.projectId).then((response) => {
                            if (response.success) setAwardProjectTarget(response.data);
                          }).catch(() => {});
                        }
                      }}
                      style={{
                        width: '100%',
                        display: 'block',
                        textAlign: 'left',
                        background: '#ffffff',
                        border: 'none',
                        borderTop: '1px solid #d9d9d9',
                        padding: '12px 8px',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#000000' }}>
                        {notification.title}
                      </div>
                      <div style={{ fontSize: '13px', color: '#595959', marginTop: '3px' }}>
                        {notification.detail}
                      </div>
                      {notification.createdAt && (
                        <div
                          style={{
                            fontSize: '11px',
                            color: '#595959',
                            marginTop: '6px',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {new Date(notification.createdAt).toLocaleString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
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
        <div style={{ display: 'flex', gap: '8px', background: '#f2f2f2', padding: '6px', borderRadius: '8px', border: '1px solid #d9d9d9' }}>
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
              onEditProject={(proj) => setEditProjectTarget(proj)}
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

      {/* Edit Project Modal — admin-only; pre-populated with existing project data */}
      {editProjectTarget && (
        <ProjectModal
          project={editProjectTarget}
          onClose={() => setEditProjectTarget(null)}
          onSuccess={() => { setEditProjectTarget(null); fetchDashboardData(); }}
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
