import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Component Imports
import NavBar from './components/NavBar';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import FinancialFormManager from './components/FinancialFormManager';
import LandingPage from './components/LandingPage'; 
import LegacyContactManager from './components/LegacyContactManager';
import DataRetrieval from './components/DataRetrieval';
import WillManager from './components/WillManager';
import BudgetManager from './components/BudgetManager'; // <-- ADD THIS IMPORT
import Ledger from './components/Ledger';
import './App.css';

const App = () => {
  return (
    <Router>
      <NavBar /> 
      <div className="App">
        <Routes>
          {/* Main Entry Points */}
          <Route path="/" element={<Login />} /> 
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Core App Functionality */}
          <Route path="/start" element={<LandingPage />} /> 
          <Route path="/profile" element={<FinancialFormManager />} /> 
          <Route path="/budget" element={<BudgetManager />} /> {/* <-- ADD THIS ROUTE */}
          <Route path="/dashboard" element={<Dashboard />} /> 
          <Route path="/will" element={<WillManager />} />
          <Route path="/contacts" element={<LegacyContactManager />} />
          <Route path="/ledger" element={<Ledger />} />
          {/* Public Retrieval Route */}
          <Route path="/retrieve" element={<DataRetrieval />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
