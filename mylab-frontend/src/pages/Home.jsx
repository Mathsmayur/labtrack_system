import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">LabTrack</h1>
        <p className="home-subtitle">Comprehensive Lab Management System</p>
        <p className="home-description">
          Track, manage, and monitor lab equipment efficiently. 
          Report issues, view analytics, and maintain your lab infrastructure.
        </p>
        <button 
          type="button"
          className="home-button"
          onClick={() => navigate('/login')}
        >
          Go to Login Page
        </button>
      </div>
    </div>
  );
}

export default Home;
