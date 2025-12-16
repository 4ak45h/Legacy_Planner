    import React, { useState } from 'react';
    import axios from 'axios';
    import ReactMarkdown from 'react-markdown'; 
    import { Link } from 'react-router-dom'; // For linking back to login

    const DataRetrieval = () => {
        const [token, setToken] = useState('');
        const [data, setData] = useState(null);
        const [message, setMessage] = useState('Enter the unique retrieval token provided to you by the Legacy Planner system.');

        const handleRetrieve = async (e) => {
            e.preventDefault();
            setData(null);
            setMessage('Retrieving data...');

            try {
                // Public route, no authentication needed beyond the token
                const res = await axios.get(`http://localhost:5000/api/contacts/retrieve/${token}`);
                
                setData(res.data);
                setMessage(`Success! Data for ${res.data.userProfile} retrieved. Status: ${res.data.status}`);

            } catch (err) {
                const errMsg = err.response?.data?.msg || 'Error: Could not connect to the server or token is invalid.';
                setMessage(errMsg);
                console.error(err);
            }
        };

        return (
            <div style={{ maxWidth: '800px', margin: '80px auto', padding: '40px', background: '#fff', borderRadius: '12px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                <h1 style={{ color: '#6f42c1', marginBottom: '10px' }}>Legacy Data Retrieval</h1>
                <p style={{ color: '#666', marginBottom: '30px' }}>{message}</p>

                <form onSubmit={handleRetrieve} style={{ display: 'flex', gap: '15px' }}>
                    <input
                        type="text"
                        placeholder="Paste Verification Token Here"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        required
                        style={{ flexGrow: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }}
                    />
                    <button type="submit" style={{ padding: '12px 25px', border: 'none', borderRadius: '6px', background: '#6f42c1', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                        Access Data
                    </button>
                </form>

                {data && (
                    <div style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '30px' }}>
                        <h3 style={{ color: '#333' }}>Financial Goal Details for {data.userProfile}</h3>
                        
                        {/* Displaying Key Property Data */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                            <div style={{ padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
                                <strong>Property Name:</strong> {data.retrievedData.name}
                            </div>
                            <div style={{ padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
                                <strong>Location:</strong> {data.retrievedData.location}
                            </div>
                            <div style={{ padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
                                <strong>Target Price:</strong> ₹{data.retrievedData.targetPrice.toLocaleString('en-IN')}
                            </div>
                            <div style={{ padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
                                <strong>Down Payment %:</strong> {data.retrievedData.downPaymentPercentage}%
                            </div>
                        </div>

                        {/* Displaying the AI Analysis */}
                        <h4 style={{ marginTop: '20px', color: '#6f42c1' }}>Full Financial Analysis Summary</h4>
                        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
                            <ReactMarkdown>{data.fullAnalysis.aiAnalysisMarkdown}</ReactMarkdown>
                        </div>
                    </div>
                )}
                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                    <Link to="/login" style={{ color: '#6f42c1', textDecoration: 'none' }}>Back to User Login</Link>
                </div>
            </div>
        );
    };

    export default DataRetrieval;
    
