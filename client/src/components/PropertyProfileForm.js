import React from 'react';
import '../App.css'; 

// Custom Input Field Component (copied from PersonalProfileForm for local use)
const FormInput = ({ label, name, type, value, onChange, required, children, isSelect = false }) => (
    <div className="form-group">
        <label htmlFor={name}>
            {label} {required && <span className="required-star">*</span>}
        </label>
        {isSelect ? (
            <select id={name} name={name} value={value} onChange={onChange} required={required}>
                {children}
            </select>
        ) : (
            <input 
                id={name} 
                type={type} 
                name={name} 
                value={value} 
                onChange={onChange} 
                required={required} 
            />
        )}
    </div>
);

const PropertyProfileForm = ({ nextStep, prevStep, handleChange, values }) => {
  const propertyValues = values.property;
  
  const submitForm = e => {
    e.preventDefault();
    if (propertyValues.name && propertyValues.location && propertyValues.targetPrice) {
        nextStep(); // This calls the handleSubmit function from the manager
    } else {
        alert("Please fill out required property fields.");
    }
  };

  // The handleChange function from the manager expects 'property' as the first argument, 
  // so we call it specifically for each input.
  const propertyHandleChange = handleChange('property');

  return (
    <div className="form-card-container">
      <div className="step-indicator">
        <span className="completed">1</span>
        <span className="active">2</span>
      </div>
      <h2>Your Dream Property</h2>
      <p>Tell us about the property you want to buy</p>
      <form onSubmit={submitForm} className="form-grid">
        
        {/* Row 1: Property Name and Property Type */}
        <FormInput label="Property Name" name="name" type="text" value={propertyValues.name} onChange={propertyHandleChange} required />
        <FormInput label="Property Type" name="type" value={propertyValues.type} onChange={propertyHandleChange} required isSelect>
          <option value="Villa">Villa</option>
          <option value="Apartment">Apartment</option>
          <option value="Land">Land</option>
        </FormInput>

        {/* Row 2: Location and Target Price */}
        <FormInput label="Location" name="location" type="text" value={propertyValues.location} onChange={propertyHandleChange} required />
        <FormInput label="Target Price (₹)" name="targetPrice" type="number" value={propertyValues.targetPrice} onChange={propertyHandleChange} required />

        {/* Row 3: Down Payment % and Desired Timeline (Years) */}
        <FormInput label="Down Payment %" name="downPaymentPercentage" type="number" value={propertyValues.downPaymentPercentage} onChange={propertyHandleChange} required />
        <FormInput label="Desired Timeline (Years)" name="desiredTimelineYears" type="number" value={propertyValues.desiredTimelineYears} onChange={propertyHandleChange} required />
        
        <div className="form-actions">
          <button type="button" onClick={prevStep} className="back-button">Back</button>
          <button type="submit" className="create-profile-button">Create Profile</button>
        </div>
      </form>
    </div>
  );
};

export default PropertyProfileForm;
