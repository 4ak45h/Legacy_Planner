import React from 'react';
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
        boxSizing: 'border-box' // Ensures padding doesn't affect width
      }}
    />
  </label>
);
FormInput.propTypes = { label: PropTypes.string.isRequired };


const PersonalProfileForm = ({ nextStep, handleChange, values }) => {
  const continueStep = e => {
    e.preventDefault();
    // Basic validation check
    if (values.fullName && values.monthlyIncome) {
        nextStep();
    } else {
        alert("Please fill out required fields: Full Name and Monthly Income.");
    }
  };

  return (
    <div className="form-card-container">
      <div className="step-indicator">
        <span className="active">1</span>
        <span>2</span>
      </div>
      <h2>Your Financial Profile</h2>
      <p>Let's understand your current financial situation</p>
      
      <form onSubmit={continueStep} className="form-grid">
        
        <FormInput label="Full Name *" type="text" name="fullName" placeholder="John Doe" value={values.fullName} onChange={handleChange()} required />
        <FormInput label="Age *" type="number" name="age" placeholder="30" value={values.age} onChange={handleChange()} required />
        
        <FormInput label="Family Size *" type="number" name="familySize" placeholder="4" value={values.familySize} onChange={handleChange()} required />
        
        {/* Employment Type Dropdown */}
        <label style={{ display: 'block', marginBottom: '20px' }}>
          <span style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>Employment Type *</span>
          <select 
            name="employmentType" 
            value={values.employmentType} 
            onChange={handleChange()} 
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem',
              backgroundColor: '#fff', // Ensure select has a background
              boxSizing: 'border-box'
            }}
          >
            <option value="Salaried">Salaried</option>
            <option value="Self-Employed">Self-Employed</option>
            <option value="Business">Business</option>
          </select>
        </label>
        
        <FormInput label="Monthly Income (₹) *" type="number" name="monthlyIncome" placeholder="100000" value={values.monthlyIncome} onChange={handleChange()} required />
        <FormInput label="Annual Income (₹) *" type="number" name="annualIncome" placeholder="1200000" value={values.annualIncome} onChange={handleChange()} required />
        <FormInput label="Current Savings (₹) *" type="number" name="currentSavings" placeholder="500000" value={values.currentSavings} onChange={handleChange()} required />
        <FormInput label="Investment Portfolio (₹)" type="number" name="investmentPortfolio" placeholder="200000" value={values.investmentPortfolio} onChange={handleChange()} />
        <FormInput label="Credit Score" type="number" name="creditScore" placeholder="750" value={values.creditScore} onChange={handleChange()} />

        {/* The 'Existing Loans' and 'Monthly Expenses' inputs are now removed. */}
        {/* We add a filler to keep the button aligned to the right. */}
        <div className="filler-div" style={{gridColumn: '1S/2'}}></div>

        <div style={{gridColumn: '2 / 3', textAlign: 'right', alignSelf: 'flex-end'}}>
            <button type="submit" className="next-step-button">Next Step</button>
        </div>
      </form>
    </div>
  );
};

PersonalProfileForm.propTypes = {
  nextStep: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  values: PropTypes.object.isRequired,
};

export default PersonalProfileForm;

