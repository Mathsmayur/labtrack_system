import { useState, useEffect } from 'react';
import { getLabInventorySummary } from '../services/labService';
import { getPCsByLab } from '../services/pcService';
import { getDefectHistoryByLab } from '../services/defectHistoryService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Analytics.css'; // Reusing styles

function LabInventorySummary({ labId }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingInventory, setGeneratingInventory] = useState(false);
  const [generatingHealth, setGeneratingHealth] = useState(false);

  useEffect(() => {
    async function loadSummary() {
      if (!labId || labId === 'issues' || labId === 'inventory') {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await getLabInventorySummary(labId);
        setSummary(data);
      } catch (error) {
        console.error('Failed to load lab inventory summary:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSummary();
  }, [labId]);

  const generateInventoryReport = async () => {
    setGeneratingInventory(true);
    try {
      const pcs = await getPCsByLab(labId);
      const doc = new jsPDF();
      
      const rawLabName = (pcs && pcs.length > 0 && pcs[0].labName) ? pcs[0].labName : (summary && summary.labName ? summary.labName : `Lab_${labId}`);
      const labName = String(rawLabName);
      
      doc.setFontSize(18);
      doc.text(`PC Inventory Report`, 14, 20);
      doc.setFontSize(12);
      doc.text(`Lab: ${labName}`, 14, 30);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 38);

      const tableData = pcs.map(pc => [
        pc.pcNumber || 'N/A',
        pc.brand || 'N/A',
        pc.model || 'N/A',
        pc.productionYear || 'N/A',
        pc.ram || 'N/A',
        pc.rom || 'N/A',
        pc.processor || 'N/A',
        pc.status || 'N/A'
      ]);

      autoTable(doc, {
        startY: 45,
        head: [['PC ID', 'Brand', 'Model', 'Year', 'RAM', 'Storage', 'Processor', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] }
      });

      const safeFilename = labName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      doc.save(`${safeFilename}_inventory_report.pdf`);
    } catch (error) {
      console.error('Failed to generate inventory report:', error);
      alert(`Failed to generate PC Inventory Report: ${error.message || 'Unknown error'}`);
    } finally {
      setGeneratingInventory(false);
    }
  };

  const generateHealthReport = async () => {
    setGeneratingHealth(true);
    try {
      const defects = await getDefectHistoryByLab(labId);
      const doc = new jsPDF();
      
      const rawLabName = (summary && summary.labName) ? summary.labName : ((defects && defects.length > 0 && defects[0].labName) ? defects[0].labName : `Lab_${labId}`);
      const labName = String(rawLabName);
      
      doc.setFontSize(18);
      doc.text(`Lab Health & Defect Report`, 14, 20);
      doc.setFontSize(12);
      doc.text(`Lab Name: ${labName}`, 14, 30);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 38);
      
      // Summary Section
      doc.setFontSize(14);
      doc.text('Lab Health Summary', 14, 50);
      doc.setFontSize(11);
      doc.text(`Total PCs: ${summary?.totalPCs || 0}`, 14, 60);
      doc.text(`Working PCs: ${summary?.workingPCs || 0}`, 14, 68);
      doc.text(`Non-Working PCs: ${summary?.nonWorkingPCs || 0}`, 14, 76);
      
      // Defect History Section
      doc.setFontSize(14);
      doc.text('Defect History', 14, 90);
      
      const tableData = defects.map(defect => [
        defect.pcNumber || defect.pcId || 'N/A',
        (defect.problemType || 'UNKNOWN').replace(/_/g, ' '),
        defect.occurredAt ? new Date(defect.occurredAt).toLocaleString() : 'N/A',
        (defect.status || 'UNKNOWN').replace(/_/g, ' ')
      ]);

      autoTable(doc, {
        startY: 95,
        head: [['PC ID', 'Problem', 'Occurred Date', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] }
      });

      const safeFilename = labName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      doc.save(`${safeFilename}_health_report.pdf`);
    } catch (error) {
      console.error('Failed to generate health report:', error);
      alert(`Failed to generate Lab Health Report: ${error.message || 'Unknown error'}`);
    } finally {
      setGeneratingHealth(false);
    }
  };

  if (loading) return <div className="loading-skeleton" style={{ height: '100px', marginBottom: '20px' }}></div>;
  if (!summary || !summary.typeBreakdown || summary.typeBreakdown.length === 0) return null;

  return (
    <div className="analytics-card full-width" style={{ marginBottom: '20px', padding: '20px' }}>
      <div className="inventory-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <h3 className="neon-text-blue" style={{ margin: 0 }}>Lab Inventory Overview</h3>
        <div className="report-buttons" style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={generateInventoryReport} 
            disabled={generatingInventory}
            className="action-button secondary"
            style={{ fontSize: '0.85rem', padding: '8px 16px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer' }}
          >
            {generatingInventory ? 'Generating...' : '📥 Download PC Inventory Report'}
          </button>
          <button 
            onClick={generateHealthReport} 
            disabled={generatingHealth}
            className="action-button secondary"
            style={{ fontSize: '0.85rem', padding: '8px 16px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer' }}
          >
            {generatingHealth ? 'Generating...' : '📥 Download Lab Health Report'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div className="status-stats" style={{ display: 'flex', gap: '10px' }}>
            <span style={{ 
              background: 'rgba(0, 255, 136, 0.1)', 
              color: 'var(--status-working)', 
              padding: '4px 12px', 
              borderRadius: '20px', 
              fontSize: '0.85rem',
              border: '1px solid var(--status-working)'
            }}>
              {summary.workingPCs} Working
            </span>
            <span style={{ 
              background: 'rgba(255, 68, 68, 0.1)', 
              color: 'var(--status-broken)', 
              padding: '4px 12px', 
              borderRadius: '20px', 
              fontSize: '0.85rem',
              border: '1px solid var(--status-broken)'
            }}>
              {summary.nonWorkingPCs} Non-Working
            </span>
          </div>
          <span className="total-badge" style={{ 
            background: 'var(--secondary-neon)', 
            color: 'black', 
            fontWeight: 'bold',
            padding: '6px 15px',
            borderRadius: '6px'
          }}>
            {summary.totalPCs} Total
          </span>
        </div>
      </div>
      <div className="inventory-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
        {summary.typeBreakdown.map((type, index) => (
          <div key={index} className="inventory-item glass-panel" style={{ 
            padding: '15px', 
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div className="type-info">
              <span className="type-name" style={{ 
                color: 'var(--text-primary)', 
                fontSize: '0.95rem', 
                fontWeight: '600',
                display: 'block',
                marginBottom: '8px'
              }}>
                {type.typeName}
              </span>
              <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                <span>💾 {type.ram}</span>
                <span>💽 {type.rom}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                <span style={{ color: 'var(--status-working)' }}>W: {type.working}</span>
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
                <span style={{ color: 'var(--status-broken)' }}>NW: {type.nonWorking}</span>
              </div>
            </div>
            <div className="type-count" style={{ 
              color: 'var(--primary-neon)', 
              fontWeight: 'bold', 
              fontSize: '1.4rem', 
              marginTop: '5px',
              textAlign: 'right'
            }}>
              {type.total}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LabInventorySummary;
