import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

// Reusable input component
const FormInput = ({ label, ...props }) => (
  <label style={{ display: 'block', marginBottom: '20px' }}>
    <span style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>
      {label}
    </span>
    <input
      {...props}
      style={{
        width: '100%',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '1rem',
        boxSizing: 'border-box'
      }}
    />
  </label>
);

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password2: ''
  });

  const { email, password, password2 } = formData;

  const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();

    // 🔐 FRONTEND VALIDATION (UX ONLY)

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    if (!passwordRegex.test(password)) {
      alert(
        'Password must be at least 8 characters long and include:\n• One uppercase letter\n• One lowercase letter\n• One number'
      );
      return;
    }

    if (password !== password2) {
      alert('Passwords do not match');
      return;
    }

    // ✅ API CALL (ONLY AFTER VALIDATION PASSES)
    try {
      const newUser = { email, password };

      const res = await axios.post(
        'http://localhost:5000/api/auth/register',
        newUser,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      localStorage.setItem('token', res.data.token);

      alert('Registration successful! Welcome to Legacy Planner.');

      navigate('/profile');

    } catch (err) {
      console.error(err.response ? err.response.data : err.message);
      alert(err.response?.data?.msg || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 style={{ color: '#6f42c1', textAlign: 'center' }}>
          Create Your Account
        </h1>

        <p style={{ color: '#666', textAlign: 'center', marginBottom: '30px' }}>
          Get started with your financial plan today.
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
            placeholder="Strong password"
            required
          />

          <FormInput
            label="Confirm Password"
            type="password"
            name="password2"
            value={password2}
            onChange={onChange}
            placeholder="Re-enter password"
            required
          />

          <button type="submit" className="auth-button">
            Register
          </button>
        </form>

        <p style={{ color: '#666', textAlign: 'center', marginTop: '20px' }}>
          Already have an account?{' '}
          <Link
            to="/login"
            style={{
              color: '#6f42c1',
              fontWeight: 'bold',
              textDecoration: 'none'
            }}
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
