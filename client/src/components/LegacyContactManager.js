 import React, { useState, useEffect } from 'react';
    import axios from 'axios';
    import { useNavigate } from 'react-router-dom';

    const ContactForm = ({ onAdd }) => {
        const [name, setName] = useState('');
        const [email, setEmail] = useState('');

        const handleSubmit = (e) => {
            e.preventDefault();
            if (name && email) {
                onAdd(name, email);
                setName('');
                setEmail('');
            } else {
                alert('Please enter both name and email.');
            }
        };

        return (
            <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff', marginBottom: '30px' }}>
                <h4 style={{ color: '#6f42c1', marginBottom: '15px' }}>Designate a New Legacy Contact</h4>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '15px', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Contact Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                    />
                    <input
                        type="email"
                        placeholder="Contact Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                    />
                    <button type="submit" style={{ padding: '10px 20px', border: 'none', borderRadius: '6px', background: '#6f42c1', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                        Designate
                    </button>
                </form>
            </div>
        );
    };

    const LegacyContactManager = () => {
        const navigate = useNavigate();
        const [contacts, setContacts] = useState([]);
        const [loading, setLoading] = useState(true);

        const fetchContacts = async (token) => {
            try {
                const config = { headers: { 'x-auth-token': token } };
                const res = await axios.get('http://localhost:5000/api/contacts', config);
                setContacts(res.data);
            } catch (err) {
                console.error('Error fetching contacts:', err.response?.data?.msg || err.message);
                // If fetching fails due to invalid token, redirect to login
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        useEffect(() => {
            const token = localStorage.getItem('token');
            if (!token) return navigate('/login');
            fetchContacts(token);
        }, [navigate]);

        const handleAddContact = async (name, email) => {
            const token = localStorage.getItem('token');
            try {
                const config = { headers: { 'Content-Type': 'application/json', 'x-auth-token': token } };
                const body = JSON.stringify({ contactName: name, contactEmail: email });
                
                const res = await axios.post('http://localhost:5000/api/contacts', body, config);
                
                // Add the newly created contact to the list
                setContacts(prev => [...prev, res.data]);

                alert(`${name} has been designated! Token is logged in console.`);
            } catch (err) {
                console.error('Error adding contact:', err.response?.data?.msg || err.message);
                alert(err.response?.data?.msg || 'Failed to designate contact.');
            }
        };

        if (loading) return <h2 style={{textAlign: 'center', marginTop: '50px'}}>Loading Contacts...</h2>;

        return (
            <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', background: '#f8f9fa', borderRadius: '12px' }}>
                <h1 style={{ color: '#6f42c1', marginBottom: '20px' }}>Legacy Contact Management</h1>
                
                <ContactForm onAdd={handleAddContact} />

                <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '15px' }}>Designated Contacts ({contacts.length})</h3>

                {contacts.length === 0 ? (
                    <p>You have not designated any legacy contacts yet. Use the form above.</p>
                ) : (
                    contacts.map(contact => (
                        <div key={contact._id} style={{ 
                            padding: '15px', 
                            border: '1px solid #eee', 
                            borderRadius: '8px', 
                            background: '#fff', 
                            marginBottom: '10px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <h4 style={{ margin: '0 0 5px 0' }}>{contact.contactName}</h4>
                                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{contact.contactEmail}</p>
                            </div>
                            <span style={{ 
                                padding: '5px 10px', 
                                borderRadius: '4px', 
                                background: contact.status === 'Pending' ? '#ffc107' : '#28a945', 
                                color: contact.status === 'Pending' ? '#333' : 'white', 
                                fontSize: '0.8rem', 
                                fontWeight: 'bold'
                            }}>
                                {contact.status}
                            </span>
                        </div>
                    ))
                )}
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        style={{ padding: '10px 20px', border: 'none', borderRadius: '6px', background: '#ccc', color: '#333', cursor: 'pointer' }}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    };

    export default LegacyContactManager;
    
