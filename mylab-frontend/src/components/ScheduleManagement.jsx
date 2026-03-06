import { useState, useEffect } from 'react';
import { getSchedulesByLab, createSchedule, deleteSchedule } from '../services/labScheduleService';
import './ScheduleManagement.css';

function ScheduleManagement({ labId, labName }) {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Form state
    const [dayOfWeek, setDayOfWeek] = useState('MONDAY');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [subject, setSubject] = useState('');
    const [professorName, setProfessorName] = useState('');

    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

    useEffect(() => {
        if (labId) {
            loadSchedules();
        }
    }, [labId]);

    const loadSchedules = async () => {
        setLoading(true);
        try {
            const data = await getSchedulesByLab(labId);
            setSchedules(data);
        } catch (err) {
            setError('Failed to load schedules');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await createSchedule({
                labId,
                dayOfWeek,
                startTime,
                endTime,
                subject,
                professorName
            });
            setStartTime('');
            setEndTime('');
            setSubject('');
            setProfessorName('');
            loadSchedules();
        } catch (err) {
            setError('Failed to save schedule');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this schedule entry?')) {
            try {
                await deleteSchedule(id);
                loadSchedules();
            } catch (err) {
                setError('Failed to delete schedule');
            }
        }
    };

    if (!labId) return <div className="no-lab-selected">Please select a lab to manage its schedule.</div>;

    return (
        <div className="schedule-management">
            <div className="schedule-header">
                <h3>Weekly Schedule: {labName}</h3>
            </div>

            <div className="schedule-content">
                <div className="schedule-grid-container">
                    <div className="schedule-grid">
                        {days.map(day => (
                            <div key={day} className="day-column">
                                <div className="day-header">{day.charAt(0) + day.slice(1).toLowerCase()}</div>
                                <div className="day-slots">
                                    {schedules
                                        .filter(s => s.dayOfWeek === day)
                                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                                        .map(s => (
                                            <div key={s.id} className="schedule-slot">
                                                <div className="slot-time">{s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)}</div>
                                                <div className="slot-subject">{s.subject}</div>
                                                <div className="slot-prof">{s.professorName}</div>
                                                <button className="delete-slot-btn" onClick={() => handleDelete(s.id)}>×</button>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="add-schedule-form">
                    <h4>Add New Session</h4>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Day</label>
                            <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)}>
                                {days.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Start Time</label>
                            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>End Time</label>
                            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Subject</label>
                            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required placeholder="e.g. Computer Networks" />
                        </div>
                        <div className="form-group">
                            <label>Professor</label>
                            <input type="text" value={professorName} onChange={(e) => setProfessorName(e.target.value)} placeholder="e.g. Dr. Smith" />
                        </div>
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button type="submit" className="submit-button">Add to Schedule</button>
                </form>
            </div>
        </div>
    );
}

export default ScheduleManagement;
