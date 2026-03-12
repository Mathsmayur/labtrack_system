import { useState, useEffect } from 'react';
import { getPCsByLab, getUnassignedPCs } from '../services/pcService';
import './DashboardSummaryCards.css';

const StatCard = ({ title, value, icon, colorClass, delay }) => (
  <div className={`stat-card glass-panel ${colorClass}`} style={{ animationDelay: `${delay}ms` }}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-info">
      <h3>{value}</h3>
      <p>{title}</p>
    </div>
  </div>
);

const DashboardSummaryCards = ({ labs }) => {
  const [stats, setStats] = useState({
    totalLabs: 0,
    totalPCs: 0,
    workingPCs: 0,
    brokenPCs: 0,
    repairPCs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalStats = async () => {
      if (!labs || labs.length === 0) return;
      try {
        let allPcs = [];
        const promises = labs.map(lab => getPCsByLab(lab.id));
        const results = await Promise.all(promises);
        results.forEach(res => {
          allPcs = allPcs.concat(res);
        });

        const unassigned = await getUnassignedPCs();
        allPcs = allPcs.concat(unassigned);

        const working = allPcs.filter(pc => pc.status === 'WORKING').length;
        const broken = allPcs.filter(pc => pc.status === 'NON_WORKING').length;
        const repair = allPcs.filter(pc => pc.status === 'REPAIR_IN_PROGRESS').length;

        setStats({
          totalLabs: labs.length,
          totalPCs: allPcs.length,
          workingPCs: working,
          brokenPCs: broken,
          repairPCs: repair
        });
      } catch (error) {
        console.error('Failed to fetch global stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalStats();
  }, [labs]);

  if (loading) {
    return <div className="summary-loading">Gathering System Metrics...</div>;
  }

  return (
    <div className="dashboard-summary-grid">
      <StatCard 
        title="Total Labs" 
        value={stats.totalLabs} 
        icon="🏢" 
        colorClass="stat-blue" 
        delay={0} 
      />
      <StatCard 
        title="Total Systems" 
        value={stats.totalPCs} 
        icon="🖥️" 
        colorClass="stat-purple" 
        delay={100} 
      />
      <StatCard 
        title="Working Smoothly" 
        value={stats.workingPCs} 
        icon="✅" 
        colorClass="stat-green" 
        delay={200} 
      />
      <StatCard 
        title="Needs Attention" 
        value={stats.brokenPCs} 
        icon="🚨" 
        colorClass="stat-red" 
        delay={300} 
      />
      <StatCard 
        title="In Repair" 
        value={stats.repairPCs} 
        icon="🛠️" 
        colorClass="stat-orange" 
        delay={400} 
      />
      <StatCard 
        title="Active Complaints" 
        value={stats.brokenPCs + stats.repairPCs} 
        icon="📋" 
        colorClass="stat-cyan" 
        delay={500} 
      />
    </div>
  );
};

export default DashboardSummaryCards;
