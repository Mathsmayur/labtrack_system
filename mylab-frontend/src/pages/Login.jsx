import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/authService';
import { getCurrentUser } from '../services/authService';
import { getByUsername } from '../services/userService';
import './Login.css';

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState('');
  const [showDepartment, setShowDepartment] = useState(false);
  const navigate = useNavigate();

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
    } catch (err) {
      // ignore not found
      setShowDepartment(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">{isRegister ? 'Create Account' : 'LabTrack Login'}</h2>

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
                placeholder="Enter your username"
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
                placeholder="Enter your password"
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
            <button type="submit" className="login-button">Login</button>
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
                placeholder="Choose a username"
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
                placeholder="Choose a password"
              />
            </div>
            <div className="form-group">
              <label htmlFor="role">Role</label>
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
            <button type="submit" className="login-button">Create Account</button>
          </form>
        )}

        <p className="login-hint">
          {isRegister ? (
            <>
              Already have an account?{' '}
              <button type="button" className="link-button" onClick={() => { setIsRegister(false); setError(''); }}>
                Login
              </button>
            </>
          ) : (
            <>
              New to LabTrack?{' '}
              <button type="button" className="link-button" onClick={() => { setIsRegister(true); setError(''); }}>
                Create an account
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default Login;
