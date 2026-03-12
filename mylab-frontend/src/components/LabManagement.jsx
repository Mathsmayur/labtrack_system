import { useState, useEffect } from 'react';
import { getLabs, createLab, updateLab, deleteLab } from '../services/labService';
import { createBulkPCs } from '../services/pcService';
import './LabManagement.css';

function LabManagement() {
  const [labs, setLabs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLab, setEditingLab] = useState(null);
  const [formData, setFormData] = useState({ name: '', department: 'CE' });
  const [error, setError] = useState('');
  const [bulkData, setBulkData] = useState({
    brand: '',
    model: '',
    productionYear: '',
    ram: '',
    rom: '',
    processor: '',
    quantity: 0,
    labId: ''
  });
  const [bulkError, setBulkError] = useState('');
  const [bulkSuccess, setBulkSuccess] = useState('');

  async function loadLabs() {
    try {
      const list = await getLabs();
      setLabs(list);
    } catch (err) {
      console.error('Failed to load labs', err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLabs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingLab) {
        await updateLab(editingLab.id, formData);
      } else {
        await createLab(formData);
      }
      setShowForm(false);
      setEditingLab(null);
      setFormData({ name: '', department: 'CE' });
      loadLabs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save lab');
    }
  };

  const handleEdit = (lab) => {
    setEditingLab(lab);
    setFormData({ name: lab.name, department: lab.department });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lab?')) return;
    try {
      await deleteLab(id);
      loadLabs();
    } catch (err) {
      console.error('Failed to delete lab', err);
    }
  };

  return (
    <div className="lab-management">
      <h2>Lab Management</h2>
      <button onClick={() => { setShowForm(!showForm); setEditingLab(null); setFormData({ name: '', department: 'CE' }); }}>
        {showForm ? 'Cancel' : 'Add Lab'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="lab-form">
          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Department *</label>
              <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}>
                <option value="CE">CE</option>
                <option value="IT">IT</option>
              </select>
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit">{editingLab ? 'Update' : 'Create'}</button>
        </form>
      )}

      <div className="bulk-section" style={{ marginTop: 24 }}>
        <h3>Bulk PC Addition (Admin)</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Brand</label>
            <input value={bulkData.brand} onChange={(e) => setBulkData({ ...bulkData, brand: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Model</label>
            <input value={bulkData.model} onChange={(e) => setBulkData({ ...bulkData, model: e.target.value })} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Production Year</label>
            <input type="number" value={bulkData.productionYear} onChange={(e) => setBulkData({ ...bulkData, productionYear: e.target.value })} />
          </div>
          <div className="form-group">
            <label>RAM</label>
            <input value={bulkData.ram} onChange={(e) => setBulkData({ ...bulkData, ram: e.target.value })} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>ROM</label>
            <input value={bulkData.rom} onChange={(e) => setBulkData({ ...bulkData, rom: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Processor</label>
            <input value={bulkData.processor} onChange={(e) => setBulkData({ ...bulkData, processor: e.target.value })} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Quantity</label>
            <input type="number" value={bulkData.quantity} onChange={(e) => setBulkData({ ...bulkData, quantity: Number(e.target.value) })} />
          </div>
          <div className="form-group">
            <label>Assign to Lab (optional)</label>
            <select value={bulkData.labId} onChange={(e) => setBulkData({ ...bulkData, labId: e.target.value })}>
              <option value="">None</option>
              {labs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
        </div>
        {bulkError && <div className="error-message">{bulkError}</div>}
        {bulkSuccess && <div className="error-message" style={{ background:'#e6ffed', color:'#216e39' }}>{bulkSuccess}</div>}
        <div style={{ marginTop: 10 }}>
          <button className="submit-button" onClick={async () => {
            setBulkError(''); setBulkSuccess('');
            try {
              await createBulkPCs({
                brand: bulkData.brand,
                model: bulkData.model,
                productionYear: bulkData.productionYear ? Number(bulkData.productionYear) : null,
                ram: bulkData.ram,
                rom: bulkData.rom,
                processor: bulkData.processor,
                quantity: bulkData.quantity,
                labId: bulkData.labId ? Number(bulkData.labId) : null
              });
              setBulkSuccess('Bulk PCs created/updated successfully.');
              setBulkData({ brand:'', model:'', productionYear:'', ram:'', rom:'', processor:'', quantity:0, labId:'' });
              loadLabs();
            } catch (err) {
              setBulkError(err.response?.data?.message || 'Failed to create bulk PCs');
            }
          }}>Create Bulk PCs</button>
        </div>
      </div>

      <table className="labs-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {labs.map(lab => (
            <tr key={lab.id}>
              <td>{lab.id}</td>
              <td>{lab.name}</td>
              <td>{lab.department}</td>
              <td>
                <button onClick={() => handleEdit(lab)}>Edit</button>
                <button onClick={() => handleDelete(lab.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LabManagement;

