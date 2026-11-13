import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminDesignersPage } from './pages/AdminDesignersPage';
import { AdminAssignmentsPage } from './pages/AdminAssignmentsPage';
import { DesignerDashboard } from './pages/DesignerDashboard';
import { DesignerBidsPage } from './pages/DesignerBidsPage';
import { DesignerAssignmentsPage } from './pages/DesignerAssignmentsPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { ProfileModal } from './components/ProfileModal';

function AppContent() {
  const { user, loading, isAdmin, isDesigner } = useAuth();
  const [currentTab, setCurrentTab] = useState(() => (user?.role === 'designer' ? 'explore' : 'projects'));
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Automatically navigate to the role-specific dashboard when user logs in
  useEffect(() => {
    if (user) {
      setSelectedProject(null);
      if (user.role === 'admin') {
        setCurrentTab('projects');
      } else if (user.role === 'designer') {
        setCurrentTab('explore');
      }
    }
  }, [user?._id, user?.role]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          fontSize: '1rem',
        }}
      >
        Initializing EVO ART Designer Platform...
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const handleSelectTab = (tab) => {
    setSelectedProject(null);
    setCurrentTab(tab);
  };

  const handleViewProjectDetails = (project) => {
    setSelectedProject(project);
    setCurrentTab('project-details');
  };

  const handleBackFromDetails = () => {
    setSelectedProject(null);
    setCurrentTab(isAdmin ? 'projects' : 'explore');
  };

  return (
    <div className="app-container">
      <Navbar currentTab={currentTab} onSelectTab={handleSelectTab} onProfileClick={() => setShowProfileModal(true)} />

      <main className="main-content">
        {/* Project Details View */}
        {currentTab === 'project-details' && selectedProject ? (
          <ProjectDetailsPage
            project={selectedProject}
            onBack={handleBackFromDetails}
            onNavigateToAssignments={() => handleSelectTab('my-assignments')}
          />
        ) : isAdmin ? (
          /* Admin Views */
          <>
            {currentTab === 'projects' && (
              <AdminDashboard onViewDetails={handleViewProjectDetails} />
            )}
            {currentTab === 'designers' && <AdminDesignersPage />}
            {currentTab === 'assignments' && <AdminAssignmentsPage />}
          </>
        ) : (
          /* Designer Views */
          <>
            {currentTab === 'explore' && (
              <DesignerDashboard onViewDetails={handleViewProjectDetails} />
            )}
            {currentTab === 'my-bids' && (
              <DesignerBidsPage onViewDetails={handleViewProjectDetails} />
            )}
            {currentTab === 'my-assignments' && (
              <DesignerAssignmentsPage onViewDetails={handleViewProjectDetails} />
            )}
          </>
        )}
      </main>

      <Toast />
      {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
