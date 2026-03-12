import { useState, useEffect } from 'react';
import { getLabs } from '../services/labService';
import { createPC, updatePC, getUnassignedPCs, createBulkPCs } from '../services/pcService';
import { getCurrentUser } from '../services/authService';
import './PCManagement.css';

function PCManagement({ onPCUpdated }) {
  const [labs, setLabs] = useState([]);
  const [selectedLab, setSelectedLab] = useState(null);
  const [pcNumber, setPcNumber] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [status, setStatus] = useState('WORKING');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [productionYear, setProductionYear] = useState('');
  const [ram, setRam] = useState('');
  const [rom, setRom] = useState('');
  const [processor, setProcessor] = useState('');
  const [editingPC, setEditingPC] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [unassignedPCs, setUnassignedPCs] = useState([]);
  const [selectedUnassignedPCId, setSelectedUnassignedPCId] = useState(null);
  const [assignPcNumber, setAssignPcNumber] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  
  // Table State
  const [allPCs, setAllPCs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const itemsPerPage = 10;
  
  // Display toggle for forms
  const [showAddForm, setShowAddForm] = useState(false);

  // Bulk Add State
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkQuantity, setBulkQuantity] = useState(1);

  async function loadLabs() {
    try {
      const labList = await getLabs();
      setLabs(labList);
      if (labList.length > 0) {
        setSelectedLab(labList[0].id);
      }
    } catch (error) {
      console.error('Failed to load labs:', error);
    }
  };

  async function loadUnassignedPCs() {
    try {
      const list = await getUnassignedPCs();
      setUnassignedPCs(list);
    } catch (err) {
      console.error('Failed to load unassigned PCs', err);
    }
  };

  async function loadAllPCs() {
    try {
      const { getPCsByLab } = await import('../services/pcService');
      const labList = await getLabs();
      let pcs = [];
      const promises = labList.map(lab => getPCsByLab(lab.id));
      const results = await Promise.all(promises);
      results.forEach(res => { pcs = pcs.concat(res); });
      const unassigned = await getUnassignedPCs();
      pcs = pcs.concat(unassigned);
      setAllPCs(pcs);
    } catch (err) {
      console.error('Failed to load all PCs', err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLabs();
    loadAllPCs();
    const u = getCurrentUser();
    setCurrentUser(u);
    if (u && (u.role === 'PROFESSOR' || u.role === 'ADMIN')) {
      loadUnassignedPCs();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      if (editingPC) {
        await updatePC(editingPC.id, {
          status: status,
          specifications: specifications
        });
        setSuccessMessage('PC updated successfully!');
      } else {
        await createPC({
          labId: selectedLab,
          pcNumber: pcNumber,
          status: status,
          specifications: specifications,
          brand,
          model,
          productionYear: productionYear ? Number(productionYear) : null,
          ram,
          rom,
          processor
        });
        setSuccessMessage('PC added successfully!');
      }
      resetForm();
      setShowAddForm(false);
      loadAllPCs();
      if (onPCUpdated) {
        onPCUpdated();
      }
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to save PC';
      setError(errorMessage);
      console.error('Error creating PC:', err.response?.data || err);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      await createBulkPCs({
        labId: selectedLab,
        brand,
        model,
        productionYear: productionYear ? Number(productionYear) : null,
        ram,
        rom,
        processor,
        quantity: Number(bulkQuantity)
      });
      setShowBulkAdd(false);
      resetForm();
      setSuccessMessage(`Successfully added ${bulkQuantity} PC(s)!`);
      if (onPCUpdated) {
        onPCUpdated();
      }
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to bulk add PCs');
    }
  };

  const resetForm = () => {
    setPcNumber('');
    setSpecifications('');
    setStatus('WORKING');
    setBrand('');
    setModel('');
    setProductionYear('');
    setRam('');
    setRom('');
    setProcessor('');
    setEditingPC(null);
    setBulkQuantity(1);
    setError('');
    setSuccessMessage('');
  };



  const handleAssignSelected = async () => {
    if (!selectedUnassignedPCId) return setError('Select an unassigned PC');
    if (!selectedLab) return setError('Select a lab to assign to');
    if (!assignPcNumber) return setError('Enter PC number');
    try {
      await updatePC(selectedUnassignedPCId, {
        labId: selectedLab,
        pcNumber: assignPcNumber
      });
      setAssignPcNumber('');
      setSelectedUnassignedPCId(null);
      loadAllPCs();
      if (onPCUpdated) onPCUpdated();
      loadUnassignedPCs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign PC');
    }
  };

  // Table Logic
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const filteredPCs = allPCs.filter(pc => {
    const matchesSearch = (pc.pcNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (pc.brand || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || pc.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(filteredPCs.length / itemsPerPage);
  const currentPCs = filteredPCs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusChipClass = (status) => {
    switch (status) {
      case 'WORKING': return 'working';
      case 'NON_WORKING': return 'non-working';
      case 'REPAIR_IN_PROGRESS': return 'repair';
      default: return '';
    }
  };

  return (
    <div className="pc-management">
      <div className="pc-management-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="neon-text-purple">PC Inventory</h2>
        <div className="header-actions" style={{ display: 'flex', gap: '15px' }}>
          <button 
            className="btn-primary" 
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'View Inventory' : '+ Add New PC'}
          </button>
          {currentUser?.role === 'ADMIN' && showAddForm && (
            <button
              className="btn-secondary"
              onClick={() => {
                resetForm();
                setShowBulkAdd(!showBulkAdd);
              }}
            >
              {showBulkAdd ? 'Single Add' : 'Bulk Add'}
            </button>
          )}
        </div>
      </div>

      {showAddForm ? (
        <div className="glass-panel" style={{ padding: '30px', borderRadius: '16px', animation: 'slideUpFade 0.3s ease' }}>
        {showBulkAdd ? (
        <form onSubmit={handleBulkSubmit} className="pc-form">
          <h3>Bulk Add PCs</h3>
          <div className="form-group">
            <label>Lab (Optional)</label>
            <select
              value={selectedLab || ''}
              onChange={(e) => setSelectedLab(e.target.value === '' ? null : Number(e.target.value))}
            >
              <option value="">Select Lab (or keep Unassigned)</option>
              {labs.map(lab => (
                <option key={lab.id} value={lab.id}>{lab.name}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Brand *</label>
              <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} required placeholder="Brand" />
            </div>
            <div className="form-group">
              <label>Model *</label>
              <input type="text" value={model} onChange={(e) => setModel(e.target.value)} required placeholder="Model" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Production Year *</label>
              <input type="number" value={productionYear} onChange={(e) => setProductionYear(e.target.value)} required placeholder="2021" />
            </div>
            <div className="form-group">
              <label>RAM *</label>
              <input type="text" value={ram} onChange={(e) => setRam(e.target.value)} required placeholder="8GB" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>ROM *</label>
              <input type="text" value={rom} onChange={(e) => setRom(e.target.value)} required placeholder="256GB" />
            </div>
            <div className="form-group">
              <label>Processor *</label>
              <input type="text" value={processor} onChange={(e) => setProcessor(e.target.value)} required placeholder="Intel i5" />
            </div>
          </div>
          <div className="form-group">
            <label>Quantity *</label>
            <input type="number" min="1" value={bulkQuantity} onChange={(e) => setBulkQuantity(e.target.value)} required />
          </div>
          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message" style={{color: 'green', padding: '10px', marginBottom: '10px', backgroundColor: '#e8f5e9', borderRadius: '4px'}}>{successMessage}</div>}
          <div className="form-actions">
            <button type="submit" className="submit-button">Bulk Create</button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="pc-form">
          <div className="form-group">
            <label>Lab *</label>
            <select
              value={selectedLab || ''}
              onChange={(e) => setSelectedLab(e.target.value === '' ? null : Number(e.target.value))}
              required
              disabled={!!editingPC}
            >
              <option value="">Select Lab</option>
              {labs.map(lab => (
                <option key={lab.id} value={lab.id}>{lab.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>PC Number (Optional)</label>
            <input
              type="text"
              value={pcNumber}
              onChange={(e) => setPcNumber(e.target.value)}
              disabled={!!editingPC}
              placeholder="Leave blank for automatic name"
            />
          </div>
          <div className="form-group">
            <label>Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              <option value="WORKING">Working</option>
              <option value="NON_WORKING">Non-Working</option>
              <option value="REPAIR_IN_PROGRESS">Repair in Progress</option>
            </select>
          </div>
          <div className="form-group">
            <label>Specifications</label>
            <textarea
              value={specifications}
              onChange={(e) => setSpecifications(e.target.value)}
              rows="3"
              placeholder="PC specifications..."
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Brand *</label>
              <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} required placeholder="Brand" />
            </div>
            <div className="form-group">
              <label>Model *</label>
              <input type="text" value={model} onChange={(e) => setModel(e.target.value)} required placeholder="Model" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Production Year</label>
              <input type="number" value={productionYear} onChange={(e) => setProductionYear(e.target.value)} placeholder="2021" />
            </div>
            <div className="form-group">
              <label>RAM *</label>
              <input type="text" value={ram} onChange={(e) => setRam(e.target.value)} required placeholder="8GB" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>ROM *</label>
              <input type="text" value={rom} onChange={(e) => setRom(e.target.value)} required placeholder="256GB" />
            </div>
            <div className="form-group">
              <label>Processor *</label>
              <input type="text" value={processor} onChange={(e) => setProcessor(e.target.value)} required placeholder="Intel i5" />
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message" style={{color: 'green', padding: '10px', marginBottom: '10px', backgroundColor: '#e8f5e9', borderRadius: '4px'}}>{successMessage}</div>}
          <div className="form-actions">
            <button type="submit" className="submit-button">
              {editingPC ? 'Update PC' : 'Add PC'}
            </button>
            {editingPC && (
              <button type="button" onClick={resetForm} className="cancel-button">
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {(currentUser && (currentUser.role === 'PROFESSOR' || currentUser.role === 'ADMIN')) && (
        <div className="unassigned-section">
          <h3>Assign Unassigned PC</h3>
          <div className="form-group">
            <label>Unassigned PC</label>
            <select value={selectedUnassignedPCId || ''} onChange={(e) => setSelectedUnassignedPCId(e.target.value === '' ? null : Number(e.target.value))}>
              <option value="">Select PC</option>
              {unassignedPCs.map(pc => (
                <option key={pc.id} value={pc.id}>
                  {pc.id} - {pc.brand} {pc.model} | {pc.processor} | {pc.ram} / {pc.rom}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Assign PC Number</label>
            <input type="text" value={assignPcNumber} onChange={(e) => setAssignPcNumber(e.target.value)} placeholder="e.g., PC-01" />
          </div>
          <div className="form-actions">
            <button type="button" className="assign-button" onClick={handleAssignSelected}>Assign Selected PC</button>
          </div>
        </div>
      )}
      </div>
      ) : (
        <div className="pc-table-container glass-panel" style={{ padding: '20px', borderRadius: '16px', animation: 'slideUpFade 0.3s ease' }}>
          <div className="table-controls" style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '20px' }}>
            <input 
              type="text" 
              placeholder="Search by PC Number or Brand..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={{ flex: 1, maxWidth: '400px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', padding: '10px 15px', borderRadius: '8px' }}
            />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
              style={{ padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="WORKING">Working</option>
              <option value="NON_WORKING">Broken</option>
              <option value="REPAIR_IN_PROGRESS">In Repair</option>
            </select>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="nebula-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('pcNumber')} style={{ cursor: 'pointer' }}>
                    PC Number {sortConfig.key === 'pcNumber' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('brand')} style={{ cursor: 'pointer' }}>
                    Brand {sortConfig.key === 'brand' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Processor</th>
                  <th>Assigned Lab</th>
                  <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                    Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentPCs.length > 0 ? currentPCs.map(pc => (
                  <tr key={pc.id}>
                    <td><strong>{pc.pcNumber || `NODE-${pc.id}`}</strong></td>
                    <td>{pc.brand || 'Unknown'} - {pc.model}</td>
                    <td>{pc.processor} ({pc.ram} RAM)</td>
                    <td style={{ color: pc.labName ? 'inherit' : 'var(--text-muted)' }}>{pc.labName || 'Unassigned'}</td>
                    <td>
                      <span className={`status-badge ${getStatusChipClass(pc.status)}`}>
                        {pc.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No PCs found matching your criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="page-btn"
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                Previous
              </button>
              <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="page-btn"
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '6px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PCManagement;
