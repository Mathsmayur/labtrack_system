import { useState, useEffect } from 'react';
import { getLabs } from '../services/labService';
import { createPC, updatePC, deletePC, getUnassignedPCs, createBulkPCs } from '../services/pcService';
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
  const [unassignedPCs, setUnassignedPCs] = useState([]);
  const [selectedUnassignedPCId, setSelectedUnassignedPCId] = useState(null);
  const [assignPcNumber, setAssignPcNumber] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  
  // Bulk Add State
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkQuantity, setBulkQuantity] = useState(1);

  useEffect(() => {
    loadLabs();
    const u = getCurrentUser();
    setCurrentUser(u);
    if (u && (u.role === 'PROFESSOR' || u.role === 'ADMIN')) {
      loadUnassignedPCs();
    }
  }, []);

  const loadLabs = async () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingPC) {
        await updatePC(editingPC.id, {
          status: status,
          specifications: specifications
        });
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
      }
      resetForm();
      if (onPCUpdated) onPCUpdated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save PC');
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setError('');

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
      if (onPCUpdated) onPCUpdated();
      // Load unassigned pcs if we didn't select a lab (though current UI forces lab, backend might not)
      // Actually usually bulk PCs are unassigned or assigned to lab. 
      // If prompt logic was to create "unassigned" PCs, labId might be null.
      // But typically we assign to a lab or pool.
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
  };

  const loadUnassignedPCs = async () => {
    try {
      const list = await getUnassignedPCs();
      setUnassignedPCs(list);
    } catch (err) {
      console.error('Failed to load unassigned PCs', err);
    }
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
      if (onPCUpdated) onPCUpdated();
      loadUnassignedPCs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign PC');
    }
  };

  return (
    <div className="pc-management">
      <div className="pc-management-header">
        <h2>PC Management</h2>
        {currentUser?.role === 'ADMIN' && (
          <button 
            className="bulk-add-btn" 
            onClick={() => {
              resetForm();
              setShowBulkAdd(!showBulkAdd);
            }}
          >
            {showBulkAdd ? 'Switch to Single Add' : 'Switch to Bulk Add'}
          </button>
        )}
      </div>

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
            <label>PC Number *</label>
            <input
              type="text"
              value={pcNumber}
              onChange={(e) => setPcNumber(e.target.value)}
              required
              disabled={!!editingPC}
              placeholder="e.g., PC-01"
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
              <label>Brand</label>
              <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Brand" />
            </div>
            <div className="form-group">
              <label>Model</label>
              <input type="text" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Model" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Production Year</label>
              <input type="number" value={productionYear} onChange={(e) => setProductionYear(e.target.value)} placeholder="2021" />
            </div>
            <div className="form-group">
              <label>RAM</label>
              <input type="text" value={ram} onChange={(e) => setRam(e.target.value)} placeholder="8GB" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>ROM</label>
              <input type="text" value={rom} onChange={(e) => setRom(e.target.value)} placeholder="256GB" />
            </div>
            <div className="form-group">
              <label>Processor</label>
              <input type="text" value={processor} onChange={(e) => setProcessor(e.target.value)} placeholder="Intel i5" />
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
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
                <option key={pc.id} value={pc.id}>{pc.id} - {pc.brand ? `${pc.brand} ${pc.model}` : 'Type N/A'}</option>
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
  );
}

export default PCManagement;
