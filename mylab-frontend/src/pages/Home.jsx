import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import monitorIcon from '../assets/monitor-icon.png';
import toolsIcon from '../assets/tools-icon.png';
import insightsIcon from '../assets/insights-icon.png';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="home-container" data-theme={theme}>
      <nav className="home-nav glass-panel">
        <div className="nav-logo">
          <span className="neon-text-purple">Lab</span>Track
        </div>
        <div className="nav-actions">
          <button onClick={toggleTheme} className="theme-toggle-btn">
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
          <button onClick={() => navigate('/login')} className="nav-login-btn">
            Sign In
          </button>
        </div>
      </nav>

      <main className="home-hero">
        <div className="hero-badge">Scientific Lab Management</div>
        <h1 className="hero-title">
          Streamlined <br />
          <span className="neon-text-blue">Lab Tracking System</span>
        </h1>
        <p className="hero-subtitle">
          Efficiently manage your laboratory computers, track maintenance issues, 
          and monitor lab occupancy in real-time across your institution.
        </p>
        
        <div className="hero-cta">
          <button 
            className="primary-cta-btn"
            onClick={() => navigate('/login', { state: { register: false } })}
          >
            Access Portal
          </button>
          <button 
            className="secondary-cta-btn" 
            onClick={() => navigate('/login', { state: { register: true } })}
          >
            Join System
          </button>
        </div>

        <div className="feature-grid">
          <div className="feature-card glass-panel">
            <div className="feature-icon">
              <img src={monitorIcon} alt="Monitor" style={{ width: '48px', height: '48px' }} />
            </div>
            <h3>PC Monitoring</h3>
            <p>Real-time status tracking for all computers across CE and IT departments.</p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon">
              <img src={toolsIcon} alt="Maintenance" style={{ width: '48px', height: '48px' }} />
            </div>
            <h3>Maintenance Logs</h3>
            <p>Easily report hardware issues and track the progress of technical repairs.</p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon">
              <img src={insightsIcon} alt="Occupancy" style={{ width: '48px', height: '48px' }} />
            </div>
            <h3>Occupancy Insights</h3>
            <p>View detailed lab usage charts and schedule sessions based on availability.</p>
          </div>
        </div>
      </main>

      <footer className="home-footer">
        <p>&copy; 2026 LabTrack Systems.</p>
      </footer>
    </div>
  );
}

export default Home;
