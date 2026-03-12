import { useState, useEffect } from 'react';
import { getInvalidPcTypes, cleanupInvalidPcType, cleanupAllInvalidPcTypes } from '../services/pcService';
import './LabManagement.css';

function InvalidPcTypeAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const list = await getInvalidPcTypes();
      setRows(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCleanup = async (id) => {
    try {
      await cleanupInvalidPcType(id);
      setMessage('Row cleaned');
      load();
    } catch {
      setMessage('Failed to clean row');
    }
  };

  const handleCleanupAll = async () => {
    try {
      const res = await cleanupAllInvalidPcTypes();
      setMessage(`${res} rows cleaned`);
      load();
    } catch {
      setMessage('Failed to clean rows');
    }
  };

  return (
    <div className="lab-management">
      <h2>Invalid PC Type Rows</h2>
      {message && <div className="error-message" style={{ background: 'rgba(0, 255, 136, 0.1)', color: 'var(--status-working)', border: '1px solid rgba(0, 255, 136, 0.3)' }}>{message}</div>}
      <div style={{ marginBottom: 12 }}>
        <button className="add-lab-button" onClick={handleCleanupAll}>Cleanup All</button>
        <button className="add-lab-button" onClick={load} style={{ marginLeft: 8 }}>Refresh</button>
      </div>
      {loading ? <p>Loading...</p> : (
        <table className="labs-table">
          <thead>
            <tr><th>ID</th><th>PC Number</th><th>pc_type_id</th><th>lab_id</th><th>Action</th></tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.pcNumber}</td>
                <td>{r.pcTypeId}</td>
                <td>{r.labId}</td>
                <td>
                  <button className="edit-button" onClick={() => handleCleanup(r.id)}>Cleanup</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default InvalidPcTypeAdmin;

