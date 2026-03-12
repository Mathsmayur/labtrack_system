import React, { useState } from 'react';
import { getFreeLabs } from '../services/labScheduleService';

import './LabAvailabilitySearch.css';

const LabAvailabilitySearch = () => {
  const [day, setDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase());
  const [startTime, setStartTime] = useState(new Date().toTimeString().substring(0, 5));
  const [endTime, setEndTime] = useState(() => {
    const now = new Date();
    now.setHours(now.getHours() + 2);
    return now.toTimeString().substring(0, 5);
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const labs = await getFreeLabs(day, startTime, endTime);
      setResults(labs);
    } catch (err) {
      setError('Failed to fetch available labs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lab-availability-search">
      <h3>Check Lab Availability</h3>
      
      <form onSubmit={handleSearch} className="search-form">
        <div className="form-group-search">
          <label>Day:</label>
          <select value={day} onChange={(e) => setDay(e.target.value)}>
            {days.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        
        <div className="form-group-search">
          <label>From:</label>
          <input 
            type="time" 
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>

        <div className="form-group-search">
          <label>To:</label>
          <input 
            type="time" 
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="search-submit-btn" disabled={loading}>
          {loading ? 'Searching...' : 'Find Free Labs'}
        </button>
      </form>

      {searched && !loading && (
        <div className="results-section">
          {error && <div className="error-message">{error}</div>}
          
          <h4 className="results-header">
            {results.length} Lab(s) Available on {day} from {startTime} to {endTime}
          </h4>
          
          {results.length > 0 ? (
            <div className="labs-grid">
              {results.map(lab => (
                <div key={lab.id} className="lab-result-card">
                  <div className="result-lab-name">{lab.name}</div>
                  <div className="result-lab-dept">{lab.department} Department</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-results">No labs are available at this time.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default LabAvailabilitySearch;
