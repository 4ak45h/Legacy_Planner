import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const AdvisorChat = ({ profileData, onClose }) => {
  const [messages, setMessages] = useState([
    { 
      sender: 'ai', 
      text: `Hi ${profileData.fullName.split(' ')[0]}! I'm your AI financial advisor. Ask me anything about your plan.` 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null); // Ref to auto-scroll

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);


  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };
      const body = JSON.stringify({ question: input });

      // Call the new back-end route
      const res = await axios.post('http://localhost:5000/api/profile/chat', body, config);

      const aiMessage = { sender: 'ai', text: res.data.answer };
      setMessages(prev => [...prev, aiMessage]);

    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = { sender: 'ai', text: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Modal Overlay
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0, 0, 0, 0.5)', zIndex: 100,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      {/* Chat Window */}
      <div style={{
        width: '90%', maxWidth: '600px', height: '70vh',
        background: 'white', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '15px 20px', borderBottom: '1px solid #eee',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, color: '#6f42c1' }}>AI Financial Advisor</h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: '1.5rem',
            cursor: 'pointer', color: '#666'
          }}>&times;</button>
        </div>

        {/* Message List */}
        <div style={{ flexGrow: 1, padding: '20px', overflowY: 'auto', background: '#f9f9f9' }}>
          {messages.map((msg, index) => (
            <div key={index} style={{
              marginBottom: '15px',
              display: 'flex',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
            }}>
              <div style={{
                padding: '10px 15px',
                borderRadius: '10px',
                maxWidth: '80%',
                background: msg.sender === 'user' ? '#6f42c1' : '#eee',
                color: msg.sender === 'user' ? 'white' : '#333'
              }}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && <div style={{ textAlign: 'center', color: '#666' }}><i>Advisor is typing...</i></div>}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} style={{ display: 'flex', padding: '20px', borderTop: '1px solid #eee' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            style={{ flexGrow: 1, padding: '12px', border: '1px solid #ccc', borderRadius: '6px' }}
            disabled={isLoading}
          />
          <button type="submit" style={{
            padding: '12px 20px', border: 'none', borderRadius: '6px',
            background: '#6f42c1', color: 'white', marginLeft: '10px', cursor: 'pointer'
          }} disabled={isLoading}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

AdvisorChat.propTypes = {
  profileData: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AdvisorChat;