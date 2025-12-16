import React from 'react';
import { useNavigate } from 'react-router-dom';

const FeatureCard = ({ title, description, icon }) => (
  <div 
    style={{ 
      padding: '25px', 
      borderRadius: '12px', 
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
      color: 'white',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
    }}
  >
    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{icon}</div>
    <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>{title}</h4>
    <p style={{ fontSize: '0.9rem', opacity: '0.8', margin: 0 }}>{description}</p>
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  return (
    <div 
      style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #6f42c1 0%, #a058d0 100%)', // Purple Gradient
        color: 'white',
        padding: '40px 20px',
        fontFamily: 'Arial, sans-serif' 
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto 80px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700' }}>Legacy Planner</h1>
      </header>

      <main style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        {/* Title Section */}
        <h2 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '20px' }}>
          Plan Your Dream Property
        </h2>
        <p style={{ fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto 60px' }}>
          AI-powered financial advisor to help you plan, save, and achieve your dream of owning a property. Get personalized advice based on your income, lifestyle, and financial history.
        </p>

        {/* Get Started Button */}
        <button 
          onClick={handleGetStarted}
          style={{
            padding: '15px 40px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            borderRadius: '8px',
            border: 'none',
            background: 'white',
            color: '#6f42c1',
            cursor: 'pointer',
            boxShadow: '0 6px 15px rgba(0, 0, 0, 0.3)',
            marginBottom: '80px',
            transition: 'transform 0.2s',
          }}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          Get Started
        </button>

        {/* Feature Cards Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px' }}>
          <FeatureCard 
            title="Smart Analysis" 
            description="Advanced AI analyze your financial situation and provides realistic property buying timelines." 
            icon="📊" // Calculator Icon
          />
          <FeatureCard 
            title="Savings Strategy" 
            description="Get customized savings plans and investment suggestions to reach your property goals faster." 
            icon="📈" // Chart Icon
          />
          <FeatureCard 
            title="Loan Guidance" 
            description="Compare loan options, understand EMI calculations, and get pre-approval insights." 
            icon="🏠" // Building Icon
          />
          <FeatureCard 
            title="24/7 AI Advisor" 
            description="Chat with our financial advisor anytime for personalized property buying guidance." 
            icon="💬" // Chat Icon
          />
        </div>
      </main>
      {/* Made with Emergent (mock label) */}
      <div style={{ position: 'fixed', bottom: '10px', right: '10px', fontSize: '0.8rem', opacity: 0.6 }}>
        Made with Gemini
      </div>
    </div>
  );
};

export default LandingPage;