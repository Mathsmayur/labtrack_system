import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, register } from '../services/authService';
import { getByUsername } from '../services/userService';
import { useTheme } from '../context/ThemeContext';
import './Login.css';

function Login() {
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(location.state?.register || false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState('');
  const [showDepartment, setShowDepartment] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await login(username, password, department || null);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.userId,
        username: response.username,
        name: response.name,
        role: response.role,
        department: response.department
      }));
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 400) {
        setError(err.response?.data?.message || 'Invalid credentials or department required');
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await register(username, password, name, role, department || null);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.userId,
        username: response.username,
        name: response.name,
        role: response.role,
        department: response.department
      }));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const handleUsernameBlur = async () => {
    if (!username) return;
    try {
      const user = await getByUsername(username);
      if (user && (user.role === 'STUDENT' || user.role === 'PROFESSOR')) {
        setShowDepartment(true);
      } else {
        setShowDepartment(false);
      }
    } catch {
      setShowDepartment(false);
    }
  };

  return (
    <div className="login-container" data-theme={theme}>
      <button onClick={toggleTheme} className="theme-toggle-floating">
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      <div className="login-card glass-panel">
        <div className="login-header">
          <div className="login-logo">
            <span className="neon-text-purple">Lab</span>Track
          </div>
          <h2 className="login-title">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="login-subtitle">
            {isRegister ? 'Join the lab tracking network' : 'Secure access to your account'}
          </p>
        </div>

        {!isRegister ? (
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={handleUsernameBlur}
                required
                placeholder="Enter username"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter password"
              />
            </div>
            {showDepartment && (
              <div className="form-group">
                <label htmlFor="department">Department</label>
                <select
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="CE">CE</option>
                  <option value="IT">IT</option>
                </select>
              </div>
            )}
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="login-button primary-btn">
              Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="login-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your full name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Choose username"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Choose password"
              />
            </div>
            <div className="form-group">
              <label htmlFor="role">User Role</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="STUDENT">Student</option>
                <option value="PROFESSOR">Professor</option>
                <option value="TECHNICIAN">Technician</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            {(role === 'STUDENT' || role === 'PROFESSOR') && (
              <div className="form-group">
                <label htmlFor="department">Department</label>
                <select
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="CE">CE</option>
                  <option value="IT">IT</option>
                </select>
              </div>
            )}
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="login-button primary-btn">
              Create Account
            </button>
          </form>
        )}

        <div className="login-footer">
          <p className="login-hint">
            {isRegister ? (
              <>
                Already authorized?{' '}
                <button type="button" className="link-button" onClick={() => { setIsRegister(false); setError(''); }}>
                  Sign In
                </button>
              </>
            ) : (
              <>
                Need new access?{' '}
                <button type="button" className="link-button" onClick={() => { setIsRegister(true); setError(''); }}>
                  Register
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
