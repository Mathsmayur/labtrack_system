import React, { useState, useEffect } from 'react';
import { getAllSchedules } from '../services/labScheduleService';
import './MasterSchedule.css';

const MasterSchedule = ({ labs }) => {
  const [activeDay, setActiveDay] = useState('MONDAY');
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const data = await getAllSchedules();
        setSchedules(data);
      } catch (error) {
        console.error('Failed to fetch schedules', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  const calculatePosition = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    const totalMinutesFrom8AM = (h - 8) * 60 + m;
    const totalPossibleMinutes = 12 * 60; // 8 AM to 8 PM
    return Math.max(0, Math.min(100, (totalMinutesFrom8AM / totalPossibleMinutes) * 100));
  };

  const getSchedulesForLabAndDay = (labId) => {
    return schedules.filter(s => s.labId === labId && s.dayOfWeek === activeDay);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading master schedule...</div>;

  return (
    <div className="master-schedule">
      <div className="master-schedule-header">
        <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>All Labs Schedule</h3>
        <div className="day-selector">
          {days.map(day => (
            <button 
              key={day} 
              className={`day-btn ${activeDay === day ? 'active' : ''}`}
              onClick={() => setActiveDay(day)}
            >
              {day.charAt(0) + day.slice(1, 3).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="master-grid-container">
        <div className="master-grid">
          <div className="grid-header-row">
            <div className="lab-column-header">Lab Name</div>
            <div className="time-slots-header">
              {hours.map(hour => (
                <div key={hour} className="time-slot-label">
                  {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                </div>
              ))}
            </div>
          </div>

          {labs.map(lab => (
            <div key={lab.id} className="lab-row">
              <div className="lab-name-cell">{lab.name}</div>
              <div className="timeline-cell">
                {getSchedulesForLabAndDay(lab.id).map(s => {
                  const left = calculatePosition(s.startTime);
                  const right = calculatePosition(s.endTime);
                  const width = right - left;
                  
                  return (
                    <div 
                      key={s.id} 
                      className="schedule-block" 
                      style={{ 
                        left: `${left}%`, 
                        width: `${width}%`,
                        title: `${s.subject} (${s.startTime} - ${s.endTime})` 
                      }}
                    >
                      <span className="block-subject">{s.subject}</span>
                      <span className="block-prof">{s.professorName}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MasterSchedule;
