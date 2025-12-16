import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = localStorage.getItem('token');

  if (!isAuthenticated || ['/', '/login', '/register', '/start'].includes(location.pathname)) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    alert('You have been logged out.');
  };

  if (isAuthenticated) {
    return (
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '15px 50px', 
        background: 'linear-gradient(90deg, #6f42c1 0%, #8f58d0 100%)', 
        color: 'white',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
          Legacy Planner
        </Link>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <NavLink to="/dashboard" text="Dashboard" currentPath={location.pathname} />
          <NavLink to="/profile" text="Financial Profile" currentPath={location.pathname} />
          <NavLink to="/budget" text="My Budget" currentPath={location.pathname} />
          <NavLink to="/will" text="My Will" currentPath={location.pathname} />

          {/* ✅ Properly added Ledger link */}
          <NavLink to="/ledger" text="Ledger" currentPath={location.pathname} />

          {/* Legacy Contacts link removed */}
          
          <button 
            onClick={handleLogout}
            style={{
              padding: '8px 15px',
              borderRadius: '6px',
              border: '1px solid white',
              background: 'transparent',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Logout
          </button>
        </div>
      </nav>
    );
  }
  
  return null;
};

const NavLink = ({ to, text, currentPath }) => (
    <Link 
        to={to} 
        style={{ 
            textDecoration: 'none', 
            color: 'white', 
            fontWeight: '500', 
            padding: '5px 10px',
            borderRadius: '4px',
            background: currentPath === to ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
            transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => { if (currentPath !== to) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; }}
        onMouseOut={(e) => { if (currentPath !== to) e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
        {text}
    </Link>
);

NavLink.propTypes = {
  to: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  currentPath: PropTypes.string.isRequired
};

export default NavBar;