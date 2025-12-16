import React, { useState, useEffect } from 'react';
// REMOVED: import PersonalProfileForm from './PersonalProfileForm';
// REMOVED: import PropertyProfileForm from './PropertyProfileForm';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

// Initial state with the NEW budget object structure
const INITIAL_FORM_DATA = {
  fullName: '', age: 30, familySize: 4, employmentType: 'Salaried',
  monthlyIncome: 100000, annualIncome: 1200000, currentSavings: 500000,
  investmentPortfolio: 200000, creditScore: 750,
  property: {
    name: '', type: 'Villa', location: '', targetPrice: 5000000,
    downPaymentPercentage: 20, desiredTimelineYears: 5,
  },
  budget: { // <-- NEW DEFAULT STRUCTURE
    housing: 0, utilities: 0, food: 0, transportation: 0,
    debtPayments: 0, entertainment: 0, savingsInvestments: 0, other: 0,
  }
};

// Helper component for styled inputs with labels
const FormInput = ({ label, ...props }) => (
  <label style={{ display: 'block', marginBottom: '20px' }}>
    <span style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>{label}</span>
    <input
      {...props}
      style={{
        width: '100%', padding: '12px', border: '1px solid #ddd',
        borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box'
      }}
    />
  </label>
);
FormInput.propTypes = { label: PropTypes.string.isRequired };

// Main Form Manager
const FinancialFormManager = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
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
        
        // Merge fetched data with defaults to ensure all fields (like budget) exist
        setFormData(prevData => ({
          ...INITIAL_FORM_DATA, 
          ...res.data, 
          property: { 
            ...INITIAL_FORM_DATA.property,
            ...(res.data.property || {})
          },
          budget: { // Deep merge budget to ensure old data isn't overwritten
            ...INITIAL_FORM_DATA.budget,
            ...(res.data.budget || {})
          }
        }));
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setFormData(INITIAL_FORM_DATA);
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

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  // Universal change handler for all fields
  const handleChange = (input = null) => e => {
    const { name, value } = e.target;
    
    // Handle nested 'property' object
    if (input === 'property') {
      setFormData(prevData => ({
        ...prevData,
        property: { 
          ...prevData.property, 
          [name]: value 
        }
      }));
    } 
    // Handle top-level fields (for PersonalProfileForm)
    else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
    }
  };

  // Final submission function
  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Authentication error. Please log in again.');
        return navigate('/login');
    }

    try {
      const config = { headers: { 'Content-Type': 'application/json', 'x-auth-token': token } };
      // Send the full formData (which now includes the budget object, even if it's defaults)
      const res = await axios.post('http://localhost:5000/api/profile', formData, config);
      
      alert('Financial Profile Saved! Redirecting to Dashboard for Analysis.');
      navigate('/dashboard'); 

    } catch (err) {
      console.error("Error saving profile:", err.response ? err.response.data : err.message);
      alert('Error saving profile: ' + (err.response ? err.response.data.msg : "Server error."));
    }
  };

  if (loading) {
    return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Loading Profile...</h2>;
  }

  // Render the current step
  switch (step) {
    case 1:
      return (
        <PersonalProfileForm
          nextStep={nextStep}
          handleChange={handleChange}
          values={formData}
        />
      );
    case 2:
      return (
        <PropertyProfileForm
          nextStep={handleSubmit} // Submit on the last step
          prevStep={prevStep}
          handleChange={handleChange} // Pass the correct top-level handler
          values={formData} // Pass the full form data
        />
      );
    default:
      return <h1>Form Complete</h1>;
  }
};

// --- Sub-Components (Defined inside this file to avoid the import error) ---

// PersonalProfileForm 
const PersonalProfileForm = ({ nextStep, handleChange, values }) => {
  const continueStep = e => {
    e.preventDefault();
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
        
        <label style={{ display: 'block', marginBottom: '20px' }}>
          <span style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>Employment Type *</span>
          <select 
            name="employmentType" 
            value={values.employmentType} 
            onChange={handleChange()} 
            required
            style={{
              width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px',
              fontSize: '1rem', backgroundColor: '#fff', boxSizing: 'border-box'
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

        <div className="filler-div" style={{gridColumn: '1/2'}}></div>

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

// PropertyProfileForm 
const PropertyProfileForm = ({ nextStep, prevStep, handleChange, values }) => {
  const propertyValues = values.property || INITIAL_FORM_DATA.property; 
  
  const submitForm = e => {
    e.preventDefault();
    if (propertyValues.name && propertyValues.location && propertyValues.targetPrice) {
        nextStep(); 
    } else {
        alert("Please fill out required property fields.");
    }
  };

  return (
    <div className="form-card-container">
      <div className="step-indicator">
        <span className="completed">1</span>
        <span className="active">2</span>
      </div>
      <h2>Your Dream Property</h2>
      <p>Tell us about the property you want to buy</p>
      <form onSubmit={submitForm} className="form-grid">
        <FormInput label="Property Name *" type="text" name="name" placeholder="Dream Villa" value={propertyValues.name} onChange={handleChange('property')} required />
        
        <label style={{ display: 'block', marginBottom: '20px' }}>
          <span style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>Property Type *</span>
          <select 
            name="type" 
            value={propertyValues.type} 
            onChange={handleChange('property')} 
            required
            style={{
              width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px',
              fontSize: '1rem', backgroundColor: '#fff', boxSizing: 'border-box'
            }}
          >
            <option value="Villa">Villa</option>
            <option value="Apartment">Apartment</option>
            <option value="Land">Land</option>
          </select>
        </label>

        <FormInput label="Location *" type="text" name="location" placeholder="Bengaluru, Karnataka" value={propertyValues.location} onChange={handleChange('property')} required />
        <FormInput label="Target Price (₹) *" type="number" name="targetPrice" placeholder="5000000" value={propertyValues.targetPrice} onChange={handleChange('property')} required />
        <FormInput label="Down Payment % *" type="number" name="downPaymentPercentage" placeholder="20" value={propertyValues.downPaymentPercentage} onChange={handleChange('property')} required />
        <FormInput label="Desired Timeline (Years) *" type="number" name="desiredTimelineYears" placeholder="5" value={propertyValues.desiredTimelineYears} onChange={handleChange('property')} required />
        
        <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
          <button type="button" onClick={prevStep} className="back-button">Back</button>
          <button type="submit" className="create-profile-button">Create Profile</button>
        </div>
      </form>
    </div>
  );
};

PropertyProfileForm.propTypes = {
  nextStep: PropTypes.func.isRequired,
  prevStep: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  values: PropTypes.object.isRequired,
};

export default FinancialFormManager;
