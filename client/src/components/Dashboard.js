import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import PropTypes from 'prop-types';
import AdvisorChat from './AdvisorChat';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// Chart Colors (A palette of purple/warm tones for your theme)
const COLORS = ['#6f42c1', '#8f58d0', '#ffc107', '#dc3545', '#28a745', '#17a2b8', '#007bff', '#6c757d'];
const PRIMARY_COLOR = '#6f42c1';
const BORDER_RADIUS = '10px';
const CARD_SHADOW = '0 4px 12px rgba(0, 0, 0, 0.08)';
const GOLD_WARNING = '#ffc107';
// --- Budget Pie Chart Component (for visualization) ---
const BudgetPieChart = ({ budget }) => {
    // Filter out zero values and format data for Recharts
    const data = Object.keys(budget)
        .filter(key => budget[key] > 0)
        .map((key, index) => ({
            // Format key to readable title case (e.g., debtPayments -> Debt Payments)
            name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
            value: budget[key],
            formattedValue: `₹${budget[key].toLocaleString('en-IN')}`,
            color: COLORS[index % COLORS.length]
        }));
    
    // Tooltip Renderer
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload;
            return (
                <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{dataPoint.name}</p>
                    <p style={{ margin: 0 }}>{dataPoint.formattedValue}</p>
                </div>
            );
        }
        return null;
    };

    if (data.length === 0) {
        return <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
            <p>No budget data recorded yet.</p>
        </div>;
    }

    return (
        <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={50} // Make it a donut chart
                        paddingAngle={5}
                        fill="#8884d8"
                        labelLine={false}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ paddingLeft: '20px' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
BudgetPieChart.propTypes = { budget: PropTypes.object.isRequired };


// --- MAIN DASHBOARD COMPONENT ---
const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [will, setWill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [landAppreciationRate, setLandAppreciationRate] = useState(7);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        navigate('/login');
        return;
      }
      
      try {
        const config = { headers: { 'x-auth-token': token } };
        
        // 1. Fetch Financial Profile
        const profileRes = await axios.get('http://localhost:5000/api/profile/me', config);
        setProfile(profileRes.data);

        // 2. Fetch Will Data
        try {
            const willRes = await axios.get('http://localhost:5000/api/will', config);
            setWill(willRes.data);
        } catch (willErr) {
            console.log("Will data not found (optional feature).");
        }

      } catch (err) {
        console.error("Dashboard Fetch Error:", err.response?.data);
        
        if (err.response?.status === 404) {
            alert("Please complete your financial profile to continue.");
            navigate('/profile'); 
        } else if (err.response?.status === 401) {
            alert('Your session has expired. Please log in again.');
            localStorage.removeItem('token');
            navigate('/login');
        } else {
             alert('An error occurred while fetching your data.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  if (loading) return <h2 style={{textAlign: 'center', marginTop: '50px'}}>Loading Profile...</h2>;
  
  if (!profile) return null; 

  const { monthlyIncome, currentSavings, fullName, budget } = profile;
  const { name, location, targetPrice, desiredTimelineYears } = profile.property || {};
  const { 
    monthlySavingsPotential, 
    affordabilityScore, 
    estimatedEMI, 
    monthlySavingsRequired, 
    aiAnalysisMarkdown 
  } = profile.analysis || {};

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px'}}>
        <div></div> 
        <button 
          onClick={() => setIsChatOpen(true)}
          style={{padding: '10px 20px', background: '#6f42c1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold'}}
        >
          Chat with Advisor
        </button>
      </header>

      <h2>Welcome back, {fullName ? fullName.split(' ')[0] : 'User'}!</h2>
      <p>Here's your financial overview</p>

      {/* Metrics Cards (Affordability and Financials) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <MetricCard title="Monthly Income" value={`₹${monthlyIncome?.toLocaleString('en-IN') || 'N/A'}`} />
        <MetricCard title="Current Savings" value={`₹${currentSavings?.toLocaleString('en-IN') || 'N/A'}`} />
        <MetricCard title="Monthly Savings Potential" value={`₹${monthlySavingsPotential?.toLocaleString('en-IN') || 'N/A'}`} />
        
        {/* NEW CARD: AI Success Prediction Score */}
        <div style={{ padding: '20px', border: `1px solid ${PRIMARY_COLOR}`, borderRadius: BORDER_RADIUS, background: '#f0f4ff', boxShadow: CARD_SHADOW, textAlign: 'center' }}>
            <p style={{ color: PRIMARY_COLOR, marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}>Affordability Score</p>
            <h4 style={{ color: PRIMARY_COLOR, margin: '0', fontSize: '2.5rem', fontWeight: 800 }}>
                {affordabilityScore || 0}%
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                Overall Hybrid Score (Rules + AI)
            </p>
        </div>
      </div>
      
      {/* --- BUDGET VISUALIZATION --- */}
      <div style={{ marginBottom: '40px' }}>
          <h3 style={{ marginBottom: '20px' }}>Monthly Expense Breakdown</h3>
          <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
             <BudgetPieChart budget={profile.budget} />
          </div>
          <p style={{marginTop: '15px', textAlign: 'right', fontSize: '0.9rem'}}>
              <button 
                  onClick={() => navigate('/budget')}
                  style={{ background: 'none', border: 'none', color: '#6f42c1', cursor: 'pointer', fontWeight: 'bold' }}
              >
                  Edit Budget Categories
              </button>
          </p>
      </div>
      {/* ------------------------------------- */}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
          {/* Left Column: Property Card */}
          <div>
            <h3>Your Properties</h3>
            {profile.property ? (
                <PropertyCard 
                name={name} 
                location={location} 
                targetPrice={targetPrice} 
                timeline={desiredTimelineYears}
                onAnalyzeClick={() => {
                    const el = document.getElementById('analysis-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                />
            ) : (
                <p>You have not added a property to your plan yet.</p>
            )}
          </div>

          {/* Right Column: Will Summary */}
          <div>
            <h3>Legacy Documents</h3>
            {will ? (
                <div style={{ 
                    padding: '20px', 
                    border: '1px solid #ffc107', 
                    borderRadius: '8px', 
                    background: '#fff9e6', 
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)' 
                }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>📜 My Will</h4>
                    <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Location:</strong> {will.location}</p>
                    <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Executor:</strong> {will.executorName}</p>
                    <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#666' }}>Last Updated: {new Date(will.lastUpdated).toLocaleDateString()}</p>
                    <button 
                        onClick={() => navigate('/will')}
                        style={{ marginTop: '10px', padding: '8px 15px', border: 'none', borderRadius: '4px', background: '#ffc107', color: '#333', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
                    >
                        Edit Details
                    </button>
                </div>
            ) : (
                <div style={{ padding: '20px', border: '1px dashed #ccc', borderRadius: '8px', background: '#f9f9f9', textAlign: 'center' }}>
                    <p style={{ color: '#666' }}>You haven't recorded your will details yet.</p>
                    <button 
                        onClick={() => navigate('/will')}
                        style={{ marginTop: '10px', padding: '8px 15px', border: 'none', borderRadius: '4px', background: '#6f42c1', color: 'white', cursor: 'pointer' }}
                    >
                        Add Will Details
                    </button>
                </div>
            )}
          </div>
      </div>
      
      {/* ---- Land Price Variation Analysis (ADD ONLY) ---- */}
<div style={{ marginTop: '40px' }}>
  <h3>📈 Land Price Variation Analysis</h3>

  <p>
    Expected annual land appreciation:
    <strong> {landAppreciationRate}%</strong>
  </p>

  <input
    type="range"
    min="3"
    max="12"
    step="0.5"
    value={landAppreciationRate}
    onChange={(e) => setLandAppreciationRate(Number(e.target.value))}
    style={{ width: '100%' }}
  />

  <div style={{ marginTop: '20px' }}>
    <LandPriceChart
      currentPrice={targetPrice}
      years={desiredTimelineYears}
      rate={landAppreciationRate}
    />
  </div>
</div>

      {/* Detailed Financial Plan */}
      {profile.analysis ? (
        <div id="analysis-section" style={{marginTop: '50px', borderTop: '1px solid #eee', paddingTop: '30px'}}>
          <h3 style={{marginBottom: '20px'}}>Financial Plan Analysis</h3>
          <AnalysisResults 
            name={name} 
            location={location} 
            affordabilityScore={affordabilityScore} 
            targetPrice={targetPrice} 
            monthlySavingsRequired={monthlySavingsRequired} 
            timeline={desiredTimelineYears}
            estimatedEMI={estimatedEMI}
          />
          <div style={{background: '#f8f9fa', padding: '30px', borderRadius: '12px', marginTop: '40px'}}>
            <h3 style={{color: '#6f42c1'}}>AI Financial Advisor Analysis</h3>
            <ReactMarkdown>
                {aiAnalysisMarkdown || "No analysis available."}
            </ReactMarkdown>
          </div>
        </div>
      ) : (
        <p style={{marginTop: '30px', textAlign: 'center'}}>No analysis has been run yet. Please complete your profile.</p>
      )}
      
      {isChatOpen && (
        <AdvisorChat 
          profileData={profile} 
          onClose={() => setIsChatOpen(false)} 
        />
      )}
    </div>
  );
};

// --- Helper Card Components (Keep existing helpers) ---

const MetricCard = ({ title, value }) => (
  <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
    <p style={{ color: '#666', marginBottom: '5px', fontSize: '0.9rem' }}>{title}</p>
    <h4 style={{ color: '#333', margin: '0', fontSize: '1.5rem' }}>{value}</h4>
  </div>
);
MetricCard.propTypes = { title: PropTypes.string.isRequired, value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) };


const PropertyCard = ({ name, location, targetPrice, timeline, onAnalyzeClick }) => (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: 'white', width: '100%', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', boxSizing: 'border-box' }}>
        <h4 style={{ margin: '0 0 10px 0' }}>{name || "N/A"} <span style={{fontSize: '0.8rem', padding: '3px 8px', borderRadius: '4px', background: '#eee', color: '#555'}}>planning</span></h4>
        <p style={{margin: '5px 0'}}>Type: villa</p>
        <p style={{margin: '5px 0'}}>Location: {location || "N/A"}</p>
        <p style={{margin: '5px 0'}}>Target Price: ₹{targetPrice?.toLocaleString('en-IN') || 'N/A'}</p>
        <p style={{margin: '5px 0'}}>Timeline: {timeline || "N/A"} years</p>
        <button onClick={onAnalyzeClick} style={{width: '100%', padding: '12px', marginTop: '15px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'linear-gradient(45deg, #6f42c1, #8f58d0)', color: 'white', fontWeight: 'bold'}}>View AI Analysis</button>
    </div>
);
PropertyCard.propTypes = {
  name: PropTypes.string,
  location: PropTypes.string,
  targetPrice: PropTypes.number,
  timeline: PropTypes.number,
  onAnalyzeClick: PropTypes.func
};

const AnalysisResults = ({ name, location, affordabilityScore, targetPrice, monthlySavingsRequired, timeline, estimatedEMI }) => (
    <div style={{marginBottom: '40px'}}>
        <h3 style={{fontSize: '2rem', margin: '0'}}>{name || "N/A"}</h3>
        <p style={{color: '#666', margin: '0 0 20px 0'}}>{location || "N/A"}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
            <MetricCard title="Target Price" value={`₹${targetPrice?.toLocaleString('en-IN') || 'N/A'}`} />
            <MetricCard title="Monthly Savings Required" value={`₹${monthlySavingsRequired?.toLocaleString('en-IN') || 'N/A'}`} />
            <MetricCard title="Estimated Timeline" value={`${timeline || "N/A"} years`} />
            <MetricCard title="Affordability Score" value={affordabilityScore || 0} />
            <MetricCard title="Estimated EMI" value={`₹${estimatedEMI?.toLocaleString('en-IN') || 'N/A'}`} />
        </div>
    </div>
);
AnalysisResults.propTypes = {
  name: PropTypes.string,
  location: PropTypes.string,
  affordabilityScore: PropTypes.number,
  targetPrice: PropTypes.number,
  monthlySavingsRequired: PropTypes.number,
  timeline: PropTypes.number,
  estimatedEMI: PropTypes.number
};

// -------- Land Price Projection (ADD ONLY) --------
const LandPriceChart = ({ currentPrice, years, rate }) => {
  if (!currentPrice || !years) return null;

  const futurePrice = Math.round(
    currentPrice * Math.pow(1 + rate / 100, years)
  );

  const data = [
    { name: 'Current Value', value: currentPrice },
    { name: `After ${years} Years`, value: futurePrice }
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
        <Bar dataKey="value" fill="#6f42c1" />
      </BarChart>
    </ResponsiveContainer>
  );
};


export default Dashboard;