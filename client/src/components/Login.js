import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Import Link

// We can re-use the FormInput component style from PersonalProfileForm
const FormInput = ({ label, ...props }) => (
  <label style={{ display: 'block', marginBottom: '20px' }}>
    <span style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>{label}</span>
    <input
      {...props}
      style={{
        width: '100%',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '1rem',
        boxSizing: 'border-box' // Ensures padding doesn't affect width
      }}
    />
  </label>
);

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const { email, password } = formData;

  const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const userCredentials = { email, password };
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      const body = JSON.stringify(userCredentials);
      
      const res = await axios.post('http://localhost:5000/api/auth/login', body, config);
      
      // SUCCESS: Store the JWT token securely
      localStorage.setItem('token', res.data.token);
      
      // Redirect the user to the landing page after login
      navigate('/start'); 

    } catch (err) {
      console.error(err.response ? err.response.data : err.message);
      alert(err.response ? err.response.data.msg : 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 style={{ color: '#6f42c1', textAlign: 'center' }}>Welcome Back</h1>
        <p style={{ color: '#666', textAlign: 'center', marginBottom: '30px' }}>
          Log in to access your Legacy Planner.
        </p>
        
        <form onSubmit={onSubmit}>
          <FormInput
            label="Email Address"
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            placeholder="you@example.com"
            required
          />
          <FormInput
            label="Password"
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            required
          />
          
          <button 
            type="submit" 
            className="auth-button"
          >
            Login
          </button>
        </form>
        
        <p style={{ color: '#666', textAlign: 'center', marginTop: '20px' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#6f42c1', fontWeight: 'bold', textDecoration: 'none' }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
