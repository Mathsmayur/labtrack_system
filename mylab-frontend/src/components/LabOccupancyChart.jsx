import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getAllSchedules } from '../services/labScheduleService';
import api from '../services/api';

import './LabOccupancyChart.css';

const LabOccupancyChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOccupancyData();
  }, []);

  const fetchOccupancyData = async () => {
    try {
      setLoading(true);
      const [schedules, labs] = await Promise.all([
        getAllSchedules(),
        api.get('/labs').then(res => res.data)
      ]);

      const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
      const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

      const chartData = hours.map(hour => {
        const timeStr = `${hour.toString().padStart(2, '0')}:00`;
        const occupiedCount = labs.filter(lab => {
          return schedules.some(s => 
            s.labId === lab.id && 
            s.dayOfWeek === currentDay && 
            timeStr >= s.startTime.substring(0, 5) && 
            timeStr < s.endTime.substring(0, 5)
          );
        }).length;

        return {
          time: `${hour}:00`,
          occupied: occupiedCount,
          free: labs.length - occupiedCount
        };
      });

      setData(chartData);
    } catch (err) {
      setError('Failed to load occupancy data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="lab-occupancy-chart glass-panel" style={{ padding: '20px', height: '400px', display: 'flex', flexDirection: 'column' }}>
        <div className="skeleton" style={{ width: '200px', height: '30px', marginBottom: '20px' }}></div>
        <div className="skeleton" style={{ flex: 1, width: '100%' }}></div>
      </div>
    );
  }
  if (error) return <div className="analytics-error">{error}</div>;

  return (
    <div className="lab-occupancy-chart">
      <div className="chart-header">
        <h3>Lab Occupancy Today</h3>
        <button onClick={fetchOccupancyData} className="refresh-btn">
          Refresh
        </button>
      </div>
      
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <defs>
              <linearGradient id="colorOccupied" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00C6FF" stopOpacity={1}/>
                <stop offset="95%" stopColor="#6C5CE7" stopOpacity={0.9}/>
              </linearGradient>
              <linearGradient id="colorFree" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgba(255, 255, 255, 0.25)" stopOpacity={1}/>
                <stop offset="95%" stopColor="rgba(255, 255, 255, 0.05)" stopOpacity={0.5}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.15)" />
            <XAxis dataKey="time" stroke="#B8C0FF" tick={{ fill: '#FFFFFF', fontWeight: 600 }} axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} />
            <YAxis stroke="#B8C0FF" tick={{ fill: '#FFFFFF', fontWeight: 600 }} axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(10, 10, 25, 0.95)', border: '1px solid #6C5CE7', borderRadius: '12px', backdropFilter: 'blur(12px)', color: 'white', boxShadow: '0 8px 32px rgba(108, 92, 231, 0.3)' }}
              itemStyle={{ color: 'white', fontWeight: 'bold' }}
              labelStyle={{ color: '#00C6FF', marginBottom: '5px', fontWeight: 'bold' }}
              formatter={(value, name) => [value, name === 'occupied' ? 'Occupied Labs' : 'Available Labs']}
              cursor={{ fill: 'rgba(108, 92, 231, 0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="occupied" name="Occupied" fill="url(#colorOccupied)" stackId="a" animationDuration={1500} />
            <Bar dataKey="free" name="Available" fill="url(#colorFree)" stackId="a" radius={[6, 6, 0, 0]} animationDuration={1500} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="chart-footer">
        Showing number of occupied labs vs available labs from 8 AM to 8 PM today.
      </p>
    </div>
  );
};

export default LabOccupancyChart;
