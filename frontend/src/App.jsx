import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './Landing';
import Login from './Login';
import Signup from './Signup';
import Dashboard from './Dashboard';
import CampaignGenerator from './CampaignGenerator';
import CampaignDetail from './CampaignDetail';
import Timeline from './Timeline'; // <-- 1. IMPORT THE NEW COMPONENT
import './App.css';

// This component protects routes that require a user to be logged in
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Private Routes (User must be logged in) */}
                <Route 
                    path="/dashboard" 
                    element={<PrivateRoute><Dashboard /></PrivateRoute>} 
                />
                <Route 
                    path="/generate" 
                    element={<PrivateRoute><CampaignGenerator /></PrivateRoute>} 
                />
                <Route 
                    path="/campaign/:campaignId" 
                    element={<PrivateRoute><CampaignDetail /></PrivateRoute>} 
                />
                <Route 
                    path="/campaign/:campaignId/timeline" 
                    element={<PrivateRoute><Timeline /></PrivateRoute>} // <-- 2. ADD THE NEW ROUTE
                />
            </Routes>
        </Router>
    );
}

export default App;
