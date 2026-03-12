import React, { useState, useEffect } from 'react';
import { getPCsByStatus } from '../services/pcService';

const BrokenPCOverview = ({ onRefresh }) => {
  const [brokenPCs, setBrokenPCs] = useState([]);
  const [repairPCs, setRepairPCs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const broken = await getPCsByStatus('NON_WORKING');
      const repair = await getPCsByStatus('REPAIR_IN_PROGRESS');
      setBrokenPCs(broken);
      setRepairPCs(repair);
    } catch (err) {
      setError('Failed to fetch broken PCs overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [onRefresh]);

  if (loading) return <div className="skeleton" style={{ height: '150px', width: '100%', borderRadius: '16px', marginTop: '10px' }}></div>;
  if (error) return <div className="glass-panel" style={{ padding: '20px', color: 'var(--status-broken)' }}>{error}</div>;

  const totalIssues = brokenPCs.length + repairPCs.length;

  if (totalIssues === 0) {
    return (
      <div className="empty-state glass-panel" style={{ padding: '40px 20px', textAlign: 'center', margin: '10px 0', border: '1px solid var(--status-working)', borderRadius: '16px', animation: 'slideUpFade 0.5s ease' }}>
        <div style={{ fontSize: '3rem', marginBottom: '10px', animation: 'pulsate 2s infinite' }}>✨</div>
        <h3 style={{ color: 'var(--status-working)', marginBottom: '5px' }}>All Systems Operational</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>There are no critical issues at the moment.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '25px', marginBottom: '30px', borderLeft: '5px solid var(--status-broken)', background: 'rgba(220, 38, 38, 0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, color: 'var(--status-broken)', display: 'flex', alignItems: 'center', gap: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          <span style={{ fontSize: '1.5rem', animation: 'pulsate 2s infinite' }}>⚠️</span> Critical PC Issues ({totalIssues})
        </h3>
        <button onClick={fetchData} className="complaint-button" style={{ padding: '6px 15px', fontSize: '0.8rem' }}>Refresh</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {[...brokenPCs, ...repairPCs].map(pc => (
          <div key={pc.id} className="glass-panel" style={{ padding: '15px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '1.1rem' }}>{pc.pcNumber}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{pc.labName} • {pc.department}</div>
              </div>
              <span style={{ 
                fontSize: '0.7rem', 
                padding: '3px 10px', 
                borderRadius: '20px', 
                fontWeight: '800',
                background: pc.status === 'NON_WORKING' ? 'rgba(220, 38, 38, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: pc.status === 'NON_WORKING' ? '#FF8585' : '#F59E0B',
                border: `1px solid ${pc.status === 'NON_WORKING' ? 'var(--status-broken)' : 'var(--status-repair)'}`
              }}>
                {pc.status.replace(/_/g, ' ')}
              </span>
            </div>
            {pc.latestProblemType && (
              <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', borderTop: '1px solid var(--glass-border)', paddingTop: '8px' }}>
                <span style={{ color: 'var(--status-broken)', marginRight: '5px' }}>●</span>
                {pc.latestProblemType.replace(/_/g, ' ')}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <style>{`
        @keyframes pulsate {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default BrokenPCOverview;
