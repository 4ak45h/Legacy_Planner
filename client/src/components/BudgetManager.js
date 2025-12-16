import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

// Helper component for styled inputs with labels
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
        boxSizing: 'border-box'
      }}
    />
  </label>
);
FormInput.propTypes = { label: PropTypes.string.isRequired };

const BudgetManager = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null); // Stores the full profile
  const [budget, setBudget] = useState({
    housing: 0,
    utilities: 0,
    food: 0,
    transportation: 0,
    debtPayments: 0, // This replaces "Existing Loans"
    entertainment: 0,
    savingsInvestments: 0,
    other: 0,
  });
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch existing profile data on load
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const config = { headers: { 'x-auth-token': token } };
        const res = await axios.get('http://localhost:5000/api/profile/me', config);
        setProfile(res.data); // Save the full profile
        if (res.data.budget) {
          setBudget(res.data.budget); // Pre-fill budget data if it exists
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          alert("Please complete your main financial profile first.");
          navigate('/profile');
        } else {
          console.error("Error fetching profile:", err);
          alert("Error fetching profile data.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  // Recalculate total whenever budget changes
  useEffect(() => {
    const total = Object.values(budget).reduce((acc, val) => acc + (Number(val) || 0), 0);
    setTotalExpenses(total);
  }, [budget]);

  const handleChange = e => {
    const { name, value } = e.target;
    setBudget(prevBudget => ({
      ...prevBudget,
      [name]: Number(value) >= 0 ? Number(value) : 0, // Ensure non-negative numbers
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!profile) {
      alert("Profile data is not loaded.");
      return;
    }

    // Prepare the full profile object to be saved
    const updatedProfile = {
      ...profile, // Start with existing profile data
      budget: budget, // Add the new budget
    };

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Content-Type': 'application/json', 'x-auth-token': token } };
      
      // Send the entire updated profile object
      // The back-end will recalculate totals and run analysis
      const res = await axios.post('http://localhost:5000/api/profile', updatedProfile, config);

      alert('Budget updated successfully! Analysis is running.');
      setProfile(res.data); // Store the newly saved profile
      navigate('/dashboard'); // Go to dashboard to see results
    } catch (err) {
      console.error("Error saving budget:", err.response ? err.response.data : err.message);
      alert("Error saving budget: " + (err.response ? err.response.data.msg : "Server error"));
    }
  };

  if (loading) {
    return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Loading Budget...</h2>;
  }

  return (
    <div className="form-card-container">
      <h2>My Monthly Budget</h2>
      <p>Enter your expenses. This will update your financial plan.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <FormInput label="Housing (Rent/EMI) (₹)" type="number" name="housing" value={budget.housing} onChange={handleChange} />
          <FormInput label="Utilities (Electric, Water, Gas) (₹)" type="number" name="utilities" value={budget.utilities} onChange={handleChange} />
          <FormInput label="Food (Groceries, Dining Out) (₹)" type="number" name="food" value={budget.food} onChange={handleChange} />
          <FormInput label="Transportation (Car, Public) (₹)" type="number" name="transportation" value={budget.transportation} onChange={handleChange} />
          <FormInput label="Debt Payments (Loans, CCs) (₹)" type="number" name="debtPayments" value={budget.debtPayments} onChange={handleChange} />
          <FormInput label="Entertainment (₹)" type="number" name="entertainment" value={budget.entertainment} onChange={handleChange} />
          <FormInput label="Savings & Investments (₹)" type="number" name="savingsInvestments" value={budget.savingsInvestments} onChange={handleChange} />
          <FormInput label="Other (₹)" type="number" name="other" value={budget.other} onChange={handleChange} />
        </div>

        <div style={{ 
          marginTop: '30px', 
          padding: '20px', 
          background: '#f8f9fa', 
          borderRadius: '8px', 
          textAlign: 'center',
          border: '1px solid #eee'
        }}>
          <h3 style={{ margin: 0, color: '#333' }}>
            Total Monthly Expenses: <span style={{ color: '#6f42c1' }}>₹{totalExpenses.toLocaleString('en-IN')}</span>
          </h3>
        </div>

        <div style={{ gridColumn: '1 / -1', textAlign: 'right', marginTop: '30px' }}>
          <button type="submit" className="next-step-button" style={{ margin: 0, padding: '15px 30px' }}>
            Save Budget & Recalculate Plan
          </button>
        </div>
      </form>
    </div>
  );
};

export default BudgetManager;