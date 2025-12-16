import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FormInput = ({ label, disabled, ...props }) => (
  <label style={{ display: 'block', marginBottom: '15px' }}>
    <span style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>{label}</span>
    <input
      {...props}
      disabled={disabled}
      style={{
        width: '100%', padding: '12px', border: '1px solid #ddd',
        borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box',
        backgroundColor: disabled ? '#f9f9f9' : '#fff', // Grey out if disabled
        color: disabled ? '#666' : '#000',
        cursor: disabled ? 'not-allowed' : 'text'
      }}
    />
  </label>
);

const FormTextArea = ({ label, disabled, ...props }) => (
  <label style={{ display: 'block', marginBottom: '15px' }}>
    <span style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>{label}</span>
    <textarea
      {...props}
      disabled={disabled}
      style={{
        width: '100%', padding: '12px', border: '1px solid #ddd',
        borderRadius: '8px', fontSize: '1rem', minHeight: '100px',
        fontFamily: 'inherit', boxSizing: 'border-box',
        backgroundColor: disabled ? '#f9f9f9' : '#fff',
        color: disabled ? '#666' : '#000',
        cursor: disabled ? 'not-allowed' : 'text'
      }}
    />
  </label>
);

const WillManager = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    location: '', executorName: '', executorPhone: '',
    lawyerName: '', lawyerContact: '', notes: ''
  });
  
  const [isExistingWill, setIsExistingWill] = useState(false); // Does a will exist?
  const [isEditing, setIsEditing] = useState(true); // Is the form editable? (Default true for new users)
  const [showUnlockModal, setShowUnlockModal] = useState(false); // Controls the modal
  
  // Unlock credentials for updates
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');

  // Password setting for new wills
  const [createPassword, setCreatePassword] = useState('');
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWillData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');
      
      try {
        const config = { headers: { 'x-auth-token': token } };
        const res = await axios.get('http://localhost:5000/api/will', config);
        
        // If data exists:
        setFormData({
          location: res.data.location || '',
          executorName: res.data.executorName || '',
          executorPhone: res.data.executorPhone || '',
          lawyerName: res.data.lawyerName || '',
          lawyerContact: res.data.lawyerContact || '',
          notes: res.data.notes || ''
        });
        setIsExistingWill(true);
        setIsEditing(false); // Lock the form by default if data exists
      } catch (err) {
        if (err.response && err.response.status === 404) {
          // No will exists yet, keep editing enabled for first draft
          setIsExistingWill(false);
          setIsEditing(true);
        } else {
          console.error('Error fetching will data:', err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchWillData();
  }, [navigate]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUnlockRequest = () => {
    setShowUnlockModal(true);
  };

  const confirmUnlock = () => {
    if (!password) {
        alert("Please enter your password to confirm.");
        return;
    }
    // We don't verify password here (server does it), we just unlock UI to allow submission
    // Ideally, we could hit a verify endpoint, but sending it with the final POST is secure enough for MVP.
    setShowUnlockModal(false);
    setIsEditing(true); 
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    // Construct the payload.
    const payload = { ...formData };

    if (isExistingWill) {
        // If it's an update, include password/reason from the modal
        if (!password) {
            alert("Security Check: Password is required to update an existing will.");
            setShowUnlockModal(true);
            return;
        }
        payload.password = password;
        payload.reason = reason;
    } else {
        // If it's a new will, include the creation password
        if (!createPassword) {
            alert("Please set a password for your will to secure it.");
            return;
        }
        payload.password = createPassword; 
    }

    try {
      const config = { headers: { 'Content-Type': 'application/json', 'x-auth-token': token } };
      await axios.post('http://localhost:5000/api/will', JSON.stringify(payload), config);
      
      alert('Will details saved successfully!');
      
      // Reset sensitive fields
      setPassword('');
      setCreatePassword('');
      setReason('');
      
      // Lock form
      setIsExistingWill(true);
      setIsEditing(false); 
      
    } catch (err) {
      console.error('Error saving will data:', err.response.data);
      alert('Error: ' + (err.response.data.msg || 'Server Error'));
      // If password was wrong, keep them in edit mode but maybe clear password field
      if (err.response.status === 401) {
          setShowUnlockModal(true); // Re-open modal for retry
      }
    }
  };

  if (loading) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</h2>;

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '40px', background: '#fff', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', position: 'relative' }}>
      
      {/* Header Section */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
          <h1 style={{ color: '#6f42c1', margin: 0 }}>My Will & Testament</h1>
          {isExistingWill && !isEditing && (
              <span style={{background: '#28a745', color: 'white', padding: '5px 10px', borderRadius: '15px', fontSize: '0.8rem'}}>SECURE & LOCKED</span>
          )}
          {isExistingWill && isEditing && (
              <span style={{background: '#ffc107', color: '#333', padding: '5px 10px', borderRadius: '15px', fontSize: '0.8rem'}}>EDITING MODE</span>
          )}
      </div>

      <p style={{ color: '#666', marginBottom: '30px' }}>
        {isExistingWill 
            ? "Your will details are securely stored. To make changes, you must authenticate again."
            : "Store the essential details about your official will. This information will be made available to your designated Legacy Contact upon activation."
        }
      </p>
      
      <form onSubmit={onSubmit}>
        <FormInput label="Location of Will*" type="text" name="location" value={formData.location} onChange={onChange} required disabled={!isEditing} />
        <FormInput label="Executor Full Name*" type="text" name="executorName" value={formData.executorName} onChange={onChange} required disabled={!isEditing} />
        <FormInput label="Executor Phone" type="tel" name="executorPhone" value={formData.executorPhone} onChange={onChange} disabled={!isEditing} />
        <FormInput label="Lawyer Name" type="text" name="lawyerName" value={formData.lawyerName} onChange={onChange} disabled={!isEditing} />
        <FormInput label="Lawyer Contact" type="text" name="lawyerContact" value={formData.lawyerContact} onChange={onChange} disabled={!isEditing} />
        <FormTextArea label="Important Notes" name="notes" value={formData.notes} onChange={onChange} disabled={!isEditing} />
        
        {/* New Will Password Setup - Only shows when creating for the first time */}
        {!isExistingWill && (
            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#6f42c1' }}>Secure this Document</h4>
                <FormInput 
                    label="Set Will Password*" 
                    type="password" 
                    name="createPassword" 
                    value={createPassword} 
                    onChange={(e) => setCreatePassword(e.target.value)} 
                    placeholder="Enter a password to protect future edits"
                    required
                />
                <p style={{fontSize: '0.85rem', color: '#666', margin: 0}}>
                    <strong>Note:</strong> You will be required to enter this password every time you wish to update these details.
                </p>
            </div>
        )}

        {/* Button Logic */}
        {!isEditing ? (
            <button 
                type="button" 
                onClick={handleUnlockRequest}
                style={{
                    width: '100%', padding: '15px', border: 'none', borderRadius: '8px',
                    cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold',
                    color: 'white', background: '#ffc107', color: '#333', marginTop: '20px'
                }}
            >
                Edit / Update Will Details
            </button>
        ) : (
            <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
                {isExistingWill && (
                    <button 
                        type="button" 
                        onClick={() => {setIsEditing(false); setPassword('');}}
                        style={{
                            padding: '15px', border: '1px solid #ccc', borderRadius: '8px',
                            cursor: 'pointer', fontSize: '1rem', background: '#f8f9fa', flex: 1
                        }}
                    >
                        Cancel
                    </button>
                )}
                <button 
                    type="submit" 
                    style={{
                        padding: '15px', border: 'none', borderRadius: '8px',
                        cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold',
                        color: 'white', background: 'linear-gradient(45deg, #6f42c1, #8f58d0)', flex: 2
                    }}
                >
                    {isExistingWill ? "Save New Version" : "Save Will Details"}
                </button>
            </div>
        )}
      </form>

      {/* Unlock Modal Overlay */}
      {showUnlockModal && (
          <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(2px)', borderRadius: '12px',
              display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10
          }}>
              <div style={{
                  background: 'white', padding: '30px', borderRadius: '12px', 
                  boxShadow: '0 5px 20px rgba(0,0,0,0.2)', width: '80%', border: '1px solid #ddd'
              }}>
                  <h3 style={{marginTop: 0, color: '#d9534f'}}>Security Check</h3>
                  <p>You are attempting to modify a secured legal record. Please verify your identity.</p>
                  
                  <label style={{display: 'block', marginBottom: '10px', fontWeight: 'bold'}}>Password:</label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    style={{width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '6px'}}
                  />

                  <label style={{display: 'block', marginBottom: '10px', fontWeight: 'bold'}}>Reason for Change:</label>
                  <input 
                    type="text" 
                    value={reason} 
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., Changed executor, Moved house..."
                    style={{width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #ccc', borderRadius: '6px'}}
                  />

                  <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                      <button onClick={() => setShowUnlockModal(false)} style={{padding: '10px 20px', background: '#ccc', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>Cancel</button>
                      <button onClick={confirmUnlock} style={{padding: '10px 20px', background: '#d9534f', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>Confirm & Unlock</button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default WillManager;