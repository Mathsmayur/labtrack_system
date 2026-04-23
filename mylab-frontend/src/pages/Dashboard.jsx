import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/authService';
import { getLabs, createLab } from '../services/labService';
import { getPCsByLab, getPCById, updatePC as updatePCService, getUnassignedPCs, deletePC } from '../services/pcService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getDefectHistoryByPC } from '../services/defectHistoryService';
import { createComplaint } from '../services/complaintService';
import { getLabStatus } from '../services/labScheduleService';
import PCManagement from '../components/PCManagement';
import Analytics from '../components/Analytics';
import UserManagement from '../components/UserManagement';
import LabManagement from '../components/LabManagement';
import InvalidPcTypeAdmin from '../components/InvalidPcTypeAdmin';
import ScheduleManagement from '../components/ScheduleManagement';
import LabOccupancyChart from '../components/LabOccupancyChart';
import LabAvailabilitySearch from '../components/LabAvailabilitySearch';
import MasterSchedule from '../components/MasterSchedule';
import BrokenPCOverview from '../components/BrokenPCOverview';
import LabInventorySummary from '../components/LabInventorySummary';
import Sidebar from '../components/Sidebar';
import DashboardSummaryCards from '../components/DashboardSummaryCards';
import NotificationBell from '../components/NotificationBell';
import ceIcon from '../assets/ce-icon.png';
import itIcon from '../assets/it-icon.png';
import { useTheme } from '../context/ThemeContext';
import './Dashboard.css';

function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth <= 768);
  const [labs, setLabs] = useState([]);
  const [selectedLab, setSelectedLab] = useState(null);
  const [pcs, setPcs] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPC, setSelectedPC] = useState(null);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [showPCDetails, setShowPCDetails] = useState(false);
  const [defectHistory, setDefectHistory] = useState([]);
  const [labStatuses, setLabStatuses] = useState({});
  const [unassignedPCsCount, setUnassignedPCsCount] = useState(0);
  const [scheduleView, setScheduleView] = useState('master'); // 'master' or 'lab'
  const navigate = useNavigate();

  const loadUnassignedCount = useCallback(async () => {
    try {
      const unassigned = await getUnassignedPCs();
      setUnassignedPCsCount(unassigned.length);
    } catch (error) {
      console.error('Failed to load unassigned count:', error);
    }
  }, []);

  const loadLabs = useCallback(async () => {
    try {
      const currentUser = getCurrentUser();
      const department = currentUser?.department;
      const labList = await getLabs(department);
      setLabs(labList);
      if (labList.length > 0) {
        setSelectedLab(labList[0]);
        // Load statuses for all labs
        const statusMap = {};
        for (const lab of labList) {
          try {
            const status = await getLabStatus(lab.id);
            statusMap[lab.id] = status;
          } catch (e) {
            console.error(`Status failed for lab ${lab.id}`, e);
          }
        }
        setLabStatuses(statusMap);
      }

      // Check for unassigned PCs
      await loadUnassignedCount();

    } catch (error) {
      console.error('Failed to load labs:', error);
    }
  }, [loadUnassignedCount]);

  const [showAddLabForm, setShowAddLabForm] = useState(false);
  const [newLabName, setNewLabName] = useState('');
  const [newLabDepartment, setNewLabDepartment] = useState('CE');

  const handleAddLab = async () => {
    try {
      await createLab({ name: newLabName, department: newLabDepartment });
      setShowAddLabForm(false);
      setNewLabName('');
      setNewLabDepartment('CE');
      loadLabs();
    } catch (err) {
      console.error('Failed to add lab', err);
    }
  };

  const loadPCs = useCallback(async () => {
    if (!selectedLab) return;
    try {
      let pcList;
      if (selectedLab.id === 'inventory') {
        pcList = await getUnassignedPCs();
      } else {
        pcList = await getPCsByLab(selectedLab.id, filterStatus || null);
      }
      setPcs(pcList);
    } catch (error) {
      console.error('Failed to load PCs:', error);
    }
  }, [selectedLab, filterStatus]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(currentUser);
    loadLabs();
  }, [navigate, loadLabs]);

  useEffect(() => {
    if (selectedLab) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadPCs();
    }
  }, [selectedLab, loadPCs]);

  const handlePCClick = async (pc) => {
    try {
      const pcDetails = await getPCById(pc.id);
      setSelectedPC(pcDetails);
      const history = await getDefectHistoryByPC(pc.id);
      setDefectHistory(history);
      setShowPCDetails(true);
    } catch (error) {
      console.error('Failed to load PC details:', error);
    }
  };

  const refreshPCDetails = async (pcId) => {
    try {
      const pcDetails = await getPCById(pcId);
      setSelectedPC(pcDetails);
      const history = await getDefectHistoryByPC(pcId);
      setDefectHistory(history);
    } catch (error) {
      console.error('Failed to refresh PC details:', error);
    }
  };

  const handleComplaint = (pc) => {
    setSelectedPC(pc);
    setShowComplaintForm(true);
  };

  const handlePCUpdated = () => {
    // Always reload PCs when PC is updated, regardless of selectedLab
    loadPCs();
    // Also reload unassigned count
    loadUnassignedCount();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'WORKING':
        return 'var(--status-working)';
      case 'NON_WORKING':
        return 'var(--status-broken)';
      case 'REPAIR_IN_PROGRESS':
        return 'var(--status-repair)';
      default:
        return 'var(--text-muted)';
    }
  };

  const filteredPCs = pcs.filter(pc =>
    (pc.pcNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canManagePCs = user && (user.role === 'ADMIN' || user.role === 'PROFESSOR' || user.role === 'TECHNICIAN');
  const canViewAnalytics = user && (user.role === 'ADMIN' || user.role === 'TECHNICIAN' || user.role === 'PROFESSOR');
  const canManageUsers = user && user.role === 'ADMIN';
  const canManageLabs = user && user.role === 'ADMIN';
  const canViewInvalidPcAdmin = user && user.role === 'ADMIN';

  const getPCClass = (status) => {
    switch (status) {
      case 'NON_WORKING': return 'pc-card non-working';
      case 'REPAIR_IN_PROGRESS': return 'pc-card repair';
      default: return 'pc-card';
    }
  };

  return (
    <div className="dashboard-layout" data-theme={theme}>
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        canManagePCs={canManagePCs}
        canViewAnalytics={canViewAnalytics}
        canManageUsers={canManageUsers}
      />
      
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button 
              className="mobile-menu-btn glass-panel"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            >
              ☰
            </button>
            <h1 className="neon-text-purple">Labtrack System</h1>
          </div>
          <div className="header-actions">
            <button onClick={toggleTheme} className="theme-toggle-dashboard">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            {(user?.role === 'ADMIN' || user?.role === 'TECHNICIAN') && (
              <NotificationBell />
            )}
            <span className="user-info">Logged in as <strong className="neon-text-blue">{user?.name}</strong></span>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        </header>

        <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="tab-content overview-tab">
            <DashboardSummaryCards labs={labs} />
            <div className="overview-widgets">
              <div className="widget-card glass-panel">
                 <h3 className="neon-text-purple">Critical Issues</h3>
                 <BrokenPCOverview onRefresh={handlePCUpdated} />
              </div>
              <div className="widget-card glass-panel">
                 <h3 className="neon-text-purple">System Occupancy</h3>
                 <LabOccupancyChart />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'labs' && (
          <>
            <div className="sidebar glass-panel">
              <h3 className="neon-text-purple">Labs</h3>
              <div className="lab-list">
                <button
                  className={`lab-button ${selectedLab?.id === 'issues' ? 'active' : ''}`}
                  onClick={() => setSelectedLab({ id: 'issues', name: 'Critical Issues' })}
                >
                  <div className="lab-button-inner">
                    <div className="lab-btn-content">
                      <span className="lab-name" style={{ color: 'var(--status-broken)', fontWeight: '800' }}>🚨 BROKEN PCS</span>
                    </div>
                    <div className="lab-status-times">
                      <div className="unassigned-desc">PCs requiring urgent attention</div>
                    </div>
                  </div>
                </button>

                {unassignedPCsCount > 0 && (
                  <button
                    className={`lab-button ${selectedLab?.id === 'inventory' ? 'active' : ''}`}
                    onClick={() => setSelectedLab({ id: 'inventory', name: 'Inventory' })}
                  >
                    <div className="lab-button-inner">
                      <div className="lab-btn-content">
                        <span className="lab-name">Unassigned PCs</span>
                        <div className="lab-status-mini count" style={{ background: 'var(--status-repair)', color: '#fff' }}>{unassignedPCsCount}</div>
                      </div>
                      <div className="unassigned-desc">PCs not yet assigned to any lab</div>
                    </div>
                  </button>
                )}

                {labs.map(lab => {
                  const status = labStatuses[lab.id];
                  const isOccupied = status?.currentStatus === 'Occupied';
                  return (
                    <button
                      key={lab.id}
                      className={`lab-button ${selectedLab?.id === lab.id ? 'active' : ''}`}
                      onClick={() => setSelectedLab(lab)}
                    >
                      <div className="lab-button-inner">
                        <div className="lab-btn-content">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <img 
                              src={lab.name.includes('IT') ? itIcon : ceIcon} 
                              alt="lab-icon" 
                              style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                            />
                            <span className="lab-name">{lab.name}</span>
                          </div>
                          {status && (
                            <div className={`lab-status-mini ${isOccupied ? 'occupied' : 'unoccupied'}`}>
                              {isOccupied ? 'BUSY' : 'READY'}
                            </div>
                          )}
                        </div>
                        {status && (
                          <div className="lab-status-times">
                            <div>Next Occupancy: <span className="neon-text-blue">{status.nextOccupied}</span></div>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="main-content">
              {selectedLab?.id === 'issues' ? (
                <BrokenPCOverview onRefresh={handlePCUpdated} />
              ) : (
                <>
                  <LabInventorySummary labId={selectedLab?.id} />
                  <div className="filters glass-panel" style={{ padding: '15px' }}>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="filter-select"
                    >
                      <option value="">All PCs</option>
                      <option value="WORKING">Working</option>
                      <option value="NON_WORKING">Non-Working</option>
                      <option value="REPAIR_IN_PROGRESS">Repair in Progress</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Search PCs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </div>

                  <div className="pc-grid">
                    {filteredPCs.map(pc => (
                      <div
                        key={pc.id}
                        className={getPCClass(pc.status)}
                        onClick={() => handlePCClick(pc)}
                      >
                        <div className="pc-status-indicator" style={{ backgroundColor: getStatusColor(pc.status), boxShadow: `0 0 15px ${getStatusColor(pc.status)}` }}></div>
                        <h3>{pc.pcNumber || `NODE-${pc.id}`}</h3>
                        <p className="pc-status">
                          System {pc.status.toLowerCase().replace(/_/g, ' ')}
                        </p>
                        {pc.status !== 'WORKING' && pc.latestProblemType && (
                          <div className="pc-issue-badge">
                            {pc.latestProblemType.replace(/_/g, ' ')}
                          </div>
                        )}
                        <button
                          className="complaint-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleComplaint(pc);
                          }}
                        >
                          Report Issue
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}
        
        {activeTab === 'broken-pcs' && (
          <div className="tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
             <h2 className="neon-text-purple" style={{ marginBottom: '20px' }}>Global Complaints & Critical Issues</h2>
             <BrokenPCOverview onRefresh={handlePCUpdated} />
          </div>
        )}
        
        {activeTab === 'occupancy' && (
          <div className="tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
             <LabOccupancyChart />
             <LabAvailabilitySearch />
          </div>
        )}

        {activeTab === 'pc-management' && canManagePCs && (
          <div className="tab-content">
            <PCManagement onPCUpdated={handlePCUpdated} />
          </div>
        )}

        {activeTab === 'schedule' && canManagePCs && (
          <div className="tab-content">
            <div className="view-toggle" style={{ display: 'flex', background: 'var(--bg-deep)', padding: '4px', borderRadius: '6px', marginBottom: '20px', width: 'fit-content' }}>
              <button 
                className={`toggle-btn ${scheduleView === 'master' ? 'active' : ''}`}
                onClick={() => setScheduleView('master')}
                style={{ padding: '8px 16px', border: 'none', background: scheduleView === 'master' ? 'var(--bg-glass)' : 'transparent', color: scheduleView === 'master' ? 'var(--primary-neon)' : 'var(--text-secondary)', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', boxShadow: scheduleView === 'master' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}
              >
                All Labs View
              </button>
              <button 
                className={`toggle-btn ${scheduleView === 'lab' ? 'active' : ''}`}
                onClick={() => setScheduleView('lab')}
                style={{ padding: '8px 16px', border: 'none', background: scheduleView === 'lab' ? 'var(--bg-glass)' : 'transparent', color: scheduleView === 'lab' ? 'var(--primary-neon)' : 'var(--text-secondary)', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', boxShadow: scheduleView === 'lab' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}
              >
                Manage Specific Lab
              </button>
            </div>
            
            {scheduleView === 'master' ? (
              <MasterSchedule labs={labs} />
            ) : (
              <ScheduleManagement labId={selectedLab?.id} labName={selectedLab?.name} />
            )}
          </div>
        )}

        {activeTab === 'analytics' && canViewAnalytics && (
          <div className="tab-content">
            <Analytics />
          </div>
        )}

        {activeTab === 'users' && canManageUsers && (
          <div className="tab-content">
            <UserManagement />
          </div>
        )}
        {activeTab === 'lab-management' && canManageLabs && (
          <div className="tab-content">
            <LabManagement />
          </div>
        )}
        {activeTab === 'invalid-pc-types' && canViewInvalidPcAdmin && (
          <div className="tab-content">
            <InvalidPcTypeAdmin />
          </div>
        )}
      </div>

      {showPCDetails && selectedPC && (
        <PCDetailsModal
          pc={selectedPC}
          defectHistory={defectHistory}
          onClose={() => {
            setShowPCDetails(false);
            setSelectedPC(null);
          }}
          user={user}
          onPCUpdated={loadPCs}
        />
      )}

      {showComplaintForm && selectedPC && (
        <ComplaintForm
          pc={selectedPC}
          userId={user?.id || 1}
          onClose={() => {
            setShowComplaintForm(false);
            setSelectedPC(null);
          }}
          onSuccess={async () => {
            setShowComplaintForm(false);
            // Reload the PC details to get updated status
            if (selectedPC) {
              await refreshPCDetails(selectedPC.id);
            }
            loadPCs();
          }}
        />
      )}
      </div>
    </div>
  );
}

function PCDetailsModal({ pc, defectHistory, onClose, user, onPCUpdated }) {
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState(pc.status);
  const [updating, setUpdating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const canEditStatus = user && (user.role === 'ADMIN' || user.role === 'TECHNICIAN');
  const canDeletePc = user && (user.role === 'ADMIN' || user.role === 'PROFESSOR');

  const generatePCHistoryReport = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text(`PC History Report: ${pc.pcNumber}`, 14, 20);
      
      doc.setFontSize(12);
      doc.text(`PC ID: ${pc.pcNumber}`, 14, 32);
      doc.text(`Lab: ${pc.labName || 'N/A'}`, 14, 40);
      doc.text(`Brand/Model: ${pc.brand || 'N/A'} ${pc.model || ''}`, 14, 48);
      doc.text(`Current Status: ${pc.status}`, 14, 56);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 64);

      doc.setFontSize(14);
      doc.text('Complete Defect History', 14, 76);

      const tableData = defectHistory.map(defect => [
        defect.problemType.replace(/_/g, ' '),
        defect.occurredAt ? new Date(defect.occurredAt).toLocaleString() : 'N/A',
        defect.resolvedAt ? new Date(defect.resolvedAt).toLocaleString() : 'Pending',
        defect.status,
        defect.technicianRemarks || 'N/A'
      ]);

      autoTable(doc, {
        startY: 82,
        head: [['Problem', 'Occurred', 'Resolved', 'Status', 'Remarks']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] }
      });

      const safeFilename = pc.pcNumber.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      doc.save(`${safeFilename}_history_report.pdf`);
    } catch (error) {
      console.error('Failed to generate PC history report:', error);
      alert('Failed to generate PC History Report');
    }
  };

  const handleDeletePC = async () => {
    setUpdating(true);
    try {
      await deletePC(pc.id);
      if (onPCUpdated) onPCUpdated();
      onClose();
    } catch (error) {
      console.error('Failed to delete PC:', error);
      alert('Failed to delete PC. It might have active complaints or history associated with it.');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (newStatus === pc.status) {
      setEditingStatus(false);
      return;
    }
    setUpdating(true);
    try {
      await updatePCService(pc.id, { status: newStatus });
      if (onPCUpdated) onPCUpdated();
      setEditingStatus(false);
      onClose();
    } catch (error) {
      console.error('Failed to update PC status:', error);
      alert('Failed to update PC status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <h2>PC Details: {pc.pcNumber}</h2>
            <button 
              onClick={generatePCHistoryReport}
              className="action-button secondary"
              style={{ fontSize: '0.85rem', padding: '6px 12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer' }}
            >
              📥 Download History
            </button>
            {canDeletePc && (
              confirmDelete ? (
                <div className="delete-confirm-inline">
                  <span className="confirm-text">Are you sure?</span>
                  <button onClick={handleDeletePC} disabled={updating} className="confirm-delete-btn">Yes, Delete</button>
                  <button onClick={() => setConfirmDelete(false)} disabled={updating} className="cancel-delete-btn">Cancel</button>
                </div>
              ) : (
                <button 
                  onClick={() => setConfirmDelete(true)} 
                  className="delete-pc-modal-btn"
                  title="Remove PC from system"
                >
                  🗑️ Remove
                </button>
              )
            )}
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="detail-section">
            <h3>Information</h3>
            <p><strong>Lab:</strong> {pc.labName}</p>
            <div className="status-section">
              <p><strong>Status:</strong></p>
              {editingStatus && canEditStatus ? (
                <div className="status-edit">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    disabled={updating}
                  >
                    <option value="WORKING">Working</option>
                    <option value="NON_WORKING">Non-Working</option>
                    <option value="REPAIR_IN_PROGRESS">Repair in Progress</option>
                  </select>
                  <button onClick={handleStatusUpdate} disabled={updating} className="save-button">
                    {updating ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => {
                    setEditingStatus(false);
                    setNewStatus(pc.status);
                  }} disabled={updating} className="cancel-button">
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="status-display">
                  <span>{pc.status.replace('_', ' ')}</span>
                  {canEditStatus && (
                    <button onClick={() => setEditingStatus(true)} className="edit-button">
                      Edit
                    </button>
                  )}
                </div>
              )}
            </div>
            <p><strong>Brand:</strong> {pc.brand || 'N/A'}</p>
            <p><strong>Model:</strong> {pc.model || 'N/A'}</p>
            <p><strong>Production Year:</strong> {pc.productionYear || 'N/A'}</p>
            <p><strong>RAM:</strong> {pc.ram || 'N/A'}</p>
            <p><strong>ROM:</strong> {pc.rom || 'N/A'}</p>
            <p><strong>Processor:</strong> {pc.processor || 'N/A'}</p>
          </div>
          <div className="detail-section">
            <h3>Defect History</h3>
            {defectHistory.length === 0 ? (
              <p>No defect history available.</p>
            ) : (
              <div className="defect-list">
                {defectHistory.map((defect, index) => {
                  const occurred = new Date(defect.occurredAt);
                  const daysSince = Math.floor((Date.now() - occurred.getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={index} className="defect-item">
                      <p><strong>Problem:</strong> {defect.problemType.replace(/_/g, ' ')}</p>
                      {defect.description && <p><strong>Description:</strong> {defect.description}</p>}
                      <p><strong>Occurred:</strong> {occurred.toLocaleString()} ({daysSince} day{daysSince !== 1 ? 's' : ''} ago)</p>
                        {defect.resolvedAt && (
                          <p><strong>Resolved:</strong> {new Date(defect.resolvedAt).toLocaleString()}</p>
                        )}
                        <p><strong>Status:</strong> {defect.status}</p>
                        {defect.technicianRemarks && <p><strong>Technician Remarks:</strong> {defect.technicianRemarks}</p>}
                      </div>
                    )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ComplaintForm({ pc, userId, onClose, onSuccess }) {
  const [problemType, setProblemType] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!problemType) {
      setError('Please select a problem type');
      return;
    }

    try {
      await createComplaint({
        pcId: pc.id,
        userId: userId,
        problemType: problemType,
        description: problemType === 'OTHER' ? description : null
      });
      onSuccess();
    } catch {
      setError('Failed to submit complaint. Please try again.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Report Issue - {pc.pcNumber}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="complaint-form">
          <div className="form-group">
            <label>Problem Type *</label>
            <select
              value={problemType}
              onChange={(e) => setProblemType(e.target.value)}
              required
            >
              <option value="">Select Problem</option>
              <option value="KEYBOARD_NOT_WORKING">Keyboard not working</option>
              <option value="MOUSE_NOT_WORKING">Mouse not working</option>
              <option value="DISPLAY_ISSUE">Display issue</option>
              <option value="CPU_OVERHEATING">CPU overheating</option>
              <option value="MEMORY_RAM_ISSUE">Memory/RAM issue</option>
              <option value="SYSTEM_NOT_BOOTING">System not booting</option>
              <option value="INTERNET_ISSUE">Internet issue</option>
              <option value="SOFTWARE_ISSUE">Software issue</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          {problemType === 'OTHER' && (
            <div className="form-group">
              <label>Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows="4"
                placeholder="Please describe the problem..."
              />
            </div>
          )}
          {error && <div className="error-message">{error}</div>}
          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
            <button type="submit" className="submit-button">Submit Complaint</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Dashboard;
