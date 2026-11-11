import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { QuotaBadge } from '../components/QuotaBadge';
import { DesignerModal } from '../components/DesignerModal';
import {
  Users,
  UserPlus,
  Briefcase,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Power,
  Trash2,
  Database,
  X,
  ShieldCheck,
} from 'lucide-react';

export const AdminDesignersPage = () => {
  const { showToast } = useAuth();
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [designerToDelete, setDesignerToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDesigners = async () => {
    try {
      setLoading(true);
      const res = await api.getDesigners();
      if (res.success) {
        setDesigners(res.data || []);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigners();
  }, []);

  const handleToggleStatus = async (designer) => {
    try {
      await api.updateDesigner(designer._id, {
        isActive: !designer.isActive,
      });
      showToast(
        `Designer ${designer.name} has been ${designer.isActive ? 'deactivated' : 'activated'}.`,
        'success'
      );
      fetchDesigners();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!designerToDelete) return;
    try {
      setDeleting(true);
      await api.deleteDesigner(designerToDelete._id);
      showToast(
        `Designer "${designerToDelete.name}" was successfully deleted from the database.`,
        'success'
      );
      setDesignerToDelete(null);
      fetchDesigners();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filteredDesigners = designers.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.skills?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalActive = designers.filter((d) => d.isActive).length;

  return (
    <div>
      {/* Page Header */}
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
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h1 style={{ margin: 0 }}>Designer Account Management</h1>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--accent-primary)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Database size={11} /> MongoDB Stored
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Provision verified designer accounts, set passwords, maintain records in database, and manage accounts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchDesigners} className="btn btn-secondary">
            <RefreshCw size={15} />
            Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
            id="btn-create-designer-open"
          >
            <UserPlus size={16} />
            Register New Designer
          </button>
        </div>
      </div>

      {/* Info & Metrics Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '1.5rem',
          fontSize: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div>
            <span style={{ color: 'var(--text-dim)' }}>Registered in Database: </span>
            <strong style={{ color: 'var(--text-main)' }}>{designers.length} Designers</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-dim)' }}>Active & Eligible: </span>
            <strong style={{ color: '#34d399' }}>{totalActive}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-dim)' }}>Security Rule: </span>
            <span style={{ color: 'var(--text-muted)' }}>Admin seeds only admin pass; designer accounts created here</span>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ minWidth: '260px', position: 'relative' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search designers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.3rem', fontSize: '0.85rem', paddingBlock: '0.45rem' }}
          />
          <Search
            size={14}
            color="var(--text-dim)"
            style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }}
          />
        </div>
      </div>

      {/* Designers Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          Loading designer records from database...
        </div>
      ) : filteredDesigners.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
          <Users size={40} color="var(--text-dim)" style={{ margin: '0 auto 1rem auto' }} />
          <h3>No Designers Registered Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '440px', marginInline: 'auto' }}>
            The database only maintains the Admin account initially. All designer accounts must be provisioned through this dashboard.
          </p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary" id="btn-create-first-designer">
            <UserPlus size={16} />
            Register First Designer
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {filteredDesigners.map((designer) => {
            const activeCount = designer.activeAssignmentsCount || 0;
            const isFull = activeCount >= 3;

            return (
              <div key={designer._id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        boxShadow: '0 0 15px rgba(6, 182, 212, 0.3)',
                      }}
                    >
                      {designer.name.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', lineHeight: 1.2 }}>{designer.name}</h3>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                        {designer.email}
                      </span>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-full)',
                      background: designer.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                      color: designer.isActive ? '#34d399' : '#fb7185',
                      border: `1px solid ${designer.isActive ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`,
                    }}
                  >
                    {designer.isActive ? 'Active' : 'Suspended'}
                  </span>
                </div>

                {/* Bio snippet */}
                {designer.bio && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', fontStyle: 'italic' }}>
                    "{designer.bio}"
                  </p>
                )}

                {/* Skills tags */}
                {designer.skills && designer.skills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
                    {designer.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text-muted)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Assignment Capacity & Quota Box */}
                <div
                  style={{
                    marginTop: 'auto',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                      Active Assignment Capacity
                    </span>
                    <QuotaBadge activeCount={activeCount} max={3} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <div>
                      Total Awarded: <strong style={{ color: 'var(--text-main)' }}>{designer.totalAssignmentsCount || 0}</strong>
                    </div>
                    <div>
                      Completed: <strong style={{ color: '#34d399' }}>{designer.completedAssignmentsCount || 0}</strong>
                    </div>
                  </div>

                  {isFull && (
                    <div
                      style={{
                        marginTop: '0.5rem',
                        fontSize: '0.75rem',
                        color: '#fb7185',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <AlertTriangle size={13} />
                      Maximum 3 assignments reached (Ineligible for new awards)
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleToggleStatus(designer)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                  >
                    <Power size={13} color={designer.isActive ? '#fb7185' : '#34d399'} />
                    {designer.isActive ? 'Deactivate' : 'Activate'}
                  </button>

                  <button
                    onClick={() => setDesignerToDelete(designer)}
                    className="btn btn-secondary btn-sm"
                    style={{
                      color: '#fb7185',
                      borderColor: 'rgba(244, 63, 94, 0.3)',
                    }}
                    title={`Delete ${designer.name} permanently`}
                    id={`btn-delete-${designer._id}`}
                  >
                    <Trash2 size={13} color="#fb7185" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {designerToDelete && (
        <div className="modal-overlay" onClick={() => !deleting && setDesignerToDelete(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '440px', padding: '1.75rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(244, 63, 94, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fb7185',
                  flexShrink: 0,
                }}
              >
                <Trash2 size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Delete Designer Account</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  Irreversible MongoDB Database Action
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Are you sure you want to delete <strong style={{ color: 'var(--text-main)' }}>{designerToDelete.name}</strong> ({designerToDelete.email})?
              This will permanently delete this designer from the database, unassign any active projects, and remove their bids.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setDesignerToDelete(null)}
                className="btn btn-secondary"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="btn btn-danger"
                style={{
                  background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                  color: '#ffffff',
                  border: 'none',
                }}
                disabled={deleting}
                id="btn-confirm-delete-designer"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Designer Modal */}
      {showModal && (
        <DesignerModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchDesigners}
        />
      )}
    </div>
  );
};

