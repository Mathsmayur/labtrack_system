import { useState, useEffect } from 'react';
import { getAnalytics } from '../services/analyticsService';
import './Analytics.css';

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="analytics-error">Failed to load analytics</div>;
  }

  const formatProblemType = (type) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="analytics-container">
      <h2>Analytics & Reports</h2>
      
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Most Problematic PCs</h3>
          {analytics.mostProblematicPCs && analytics.mostProblematicPCs.length > 0 ? (
            <ul className="analytics-list">
              {analytics.mostProblematicPCs.slice(0, 5).map((item, index) => (
                <li key={index}>
                  <span>{item.pc?.pcNumber || 'N/A'}</span>
                  <span className="count">{item.complaintCount} complaints</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No data available</p>
          )}
        </div>

        <div className="analytics-card">
          <h3>Most Common Problems</h3>
          {analytics.mostCommonProblems && analytics.mostCommonProblems.length > 0 ? (
            <ul className="analytics-list">
              {analytics.mostCommonProblems.slice(0, 5).map((item, index) => (
                <li key={index}>
                  <span>{formatProblemType(item.problemType)}</span>
                  <span className="count">{item.count} times</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No data available</p>
          )}
        </div>

        <div className="analytics-card">
          <h3>Complaint Statistics</h3>
          <div className="stat-item">
            <span>Weekly Complaints:</span>
            <span className="stat-value">{analytics.weeklyComplaintCount || 0}</span>
          </div>
          <div className="stat-item">
            <span>Monthly Complaints:</span>
            <span className="stat-value">{analytics.monthlyComplaintCount || 0}</span>
          </div>
          <div className="stat-item">
            <span>Average Repair Time:</span>
            <span className="stat-value">
              {analytics.averageRepairTime 
                ? `${Math.round(analytics.averageRepairTime)} hours`
                : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
