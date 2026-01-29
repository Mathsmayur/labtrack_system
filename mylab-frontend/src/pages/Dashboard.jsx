import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/authService';
import { getLabs, createLab } from '../services/labService';
import { getPCsByLab, getPCById, updatePC as updatePCService } from '../services/pcService';
import { getDefectHistoryByPC } from '../services/defectHistoryService';
import { createComplaint } from '../services/complaintService';
import PCManagement from '../components/PCManagement';
import Analytics from '../components/Analytics';
import UserManagement from '../components/UserManagement';
import LabManagement from '../components/LabManagement';
import InvalidPcTypeAdmin from '../components/InvalidPcTypeAdmin';
import './Dashboard.css';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('labs');
  const [labs, setLabs] = useState([]);
  const [selectedLab, setSelectedLab] = useState(null);
  const [pcs, setPcs] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPC, setSelectedPC] = useState(null);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [showPCDetails, setShowPCDetails] = useState(false);
  const [defectHistory, setDefectHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    loadLabs();
  }, [navigate]);

  useEffect(() => {
    if (selectedLab) {
      loadPCs();
    }
  }, [selectedLab, filterStatus]);

  const loadLabs = async () => {
    try {
      const currentUser = getCurrentUser();
      const department = currentUser?.department;
      const labList = await getLabs(department);
      setLabs(labList);
      if (labList.length > 0) {
        setSelectedLab(labList[0]);
      }
    } catch (error) {
      console.error('Failed to load labs:', error);
    }
  };
 
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

  const loadPCs = async () => {
    if (!selectedLab) return;
    try {
      const pcList = await getPCsByLab(selectedLab.id, filterStatus || null);
      setPcs(pcList);
    } catch (error) {
      console.error('Failed to load PCs:', error);
    }
  };

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

  const handleComplaint = (pc) => {
    setSelectedPC(pc);
    setShowComplaintForm(true);
  };

  const handlePCUpdated = () => {
    if (selectedLab) {
      loadPCs();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'WORKING':
        return '#4caf50';
      case 'NON_WORKING':
        return '#f44336';
      case 'REPAIR_IN_PROGRESS':
        return '#ff9800';
      default:
        return '#9e9e9e';
    }
  };

  const filteredPCs = pcs.filter(pc =>
    pc.pcNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canManagePCs = user && (user.role === 'ADMIN' || user.role === 'PROFESSOR' || user.role === 'TECHNICIAN');
  const canViewAnalytics = user && (user.role === 'ADMIN' || user.role === 'TECHNICIAN' || user.role === 'PROFESSOR');
  const canManageUsers = user && user.role === 'ADMIN';
  const canManageLabs = user && user.role === 'ADMIN';
  const canViewInvalidPcAdmin = user && user.role === 'ADMIN';

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>LabTrack Dashboard</h1>
        <div className="header-actions">
          <span className="user-info">Welcome, {user?.name} ({user?.role})</span>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>

      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'labs' ? 'active' : ''}`}
          onClick={() => setActiveTab('labs')}
        >
          Labs
        </button>
        {canManagePCs && (
          <button
            className={`tab-button ${activeTab === 'pc-management' ? 'active' : ''}`}
            onClick={() => setActiveTab('pc-management')}
          >
            PC Management
          </button>
        )}
        {canViewAnalytics && (
          <button
            className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        )}
        {canManageUsers && (
          <button
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </button>
        )}
        {canManageLabs && (
          <button
            className={`tab-button ${activeTab === 'lab-management' ? 'active' : ''}`}
            onClick={() => setActiveTab('lab-management')}
          >
            Lab Management
          </button>
        )}
        {canViewInvalidPcAdmin && (
          <button
            className={`tab-button ${activeTab === 'invalid-pc-types' ? 'active' : ''}`}
            onClick={() => setActiveTab('invalid-pc-types')}
          >
            Invalid PC Types
          </button>
        )}
      </div>

      <div className="dashboard-content">
        {activeTab === 'labs' && (
          <>
            <div className="sidebar">
              <h3>Labs</h3>
              <div className="lab-list">
                {labs.map(lab => (
                  <button
                    key={lab.id}
                    className={`lab-button ${selectedLab?.id === lab.id ? 'active' : ''}`}
                    onClick={() => setSelectedLab(lab)}
                  >
                    {lab.name}
                  </button>
                ))}
              </div>
              {user?.role === 'ADMIN' && (
                <div className="add-lab-section">
                  <button className="add-lab-button" onClick={() => setShowAddLabForm(!showAddLabForm)}>
                    {showAddLabForm ? 'Cancel' : 'Add Lab'}
                  </button>
                  {showAddLabForm && (
                    <div className="add-lab-form">
                      <input value={newLabName} onChange={(e) => setNewLabName(e.target.value)} placeholder="Lab name" />
                      <select value={newLabDepartment} onChange={(e) => setNewLabDepartment(e.target.value)}>
                        <option value="CE">CE</option>
                        <option value="IT">IT</option>
                      </select>
                      <button onClick={handleAddLab}>Save</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="main-content">
              <div className="filters">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Status</option>
                  <option value="WORKING">Working</option>
                  <option value="NON_WORKING">Non-Working</option>
                  <option value="REPAIR_IN_PROGRESS">Repair in Progress</option>
                </select>
                <input
                  type="text"
                  placeholder="Search PC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="pc-grid">
                {filteredPCs.map(pc => (
                  <div
                    key={pc.id}
                    className="pc-card"
                    style={{ borderColor: getStatusColor(pc.status) }}
                    onClick={() => handlePCClick(pc)}
                  >
                    <div className="pc-status-indicator" style={{ backgroundColor: getStatusColor(pc.status) }}></div>
                    <h3>{pc.pcNumber}</h3>
                    <p className="pc-status">{pc.status.replace('_', ' ')}</p>
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
            </div>
          </>
        )}

        {activeTab === 'pc-management' && canManagePCs && (
          <div className="tab-content">
            <PCManagement onPCUpdated={handlePCUpdated} />
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
          onSuccess={() => {
            setShowComplaintForm(false);
            loadPCs();
          }}
        />
      )}
    </div>
  );
}

function PCDetailsModal({ pc, defectHistory, onClose, user, onPCUpdated }) {
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState(pc.status);
  const [updating, setUpdating] = useState(false);

  const canEditStatus = user && (user.role === 'ADMIN' || user.role === 'TECHNICIAN');

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
          <h2>PC Details: {pc.pcNumber}</h2>
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
    } catch (err) {
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
