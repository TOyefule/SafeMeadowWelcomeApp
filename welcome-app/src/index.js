import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import Register from './components/Register';
import IntakeForm from './components/IntakeForm';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route 
          path="/intake-form" 
          element={token ? <IntakeForm token={token} /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;

// API Configuration
const API = axios.create({ baseURL: 'https://your-backend-api.com' });

// Login Component
function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('/login', { email, password });
      onLogin(response.data.token);
    } catch (error) {
      alert('Login failed');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

// Register Component
function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/register', { name, email, password });
      alert('Registration successful');
    } catch (error) {
      alert('Registration failed');
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

// Intake Form Component
function IntakeForm({ token }) {
  const [formData, setFormData] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/submit_forms', { forms: formData }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Form submitted successfully');
    } catch (error) {
      alert('Submission failed');
    }
  };

  return (
    <div>
      <h2>Intake Form</h2>
      <form onSubmit={handleSubmit}>
        <textarea placeholder="Enter patient details..." onChange={(e) => setFormData({ ...formData, details: e.target.value })} required />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
