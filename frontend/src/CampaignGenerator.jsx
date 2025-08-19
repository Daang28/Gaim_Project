import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function CampaignGenerator() {
    const [productName, setProductName] = useState(localStorage.getItem('lastProductName') || '');
    const [productDescription, setProductDescription] = useState(localStorage.getItem('lastProductDesc') || '');
    const [targetAudience, setTargetAudience] = useState(localStorage.getItem('lastAudience') || '');
    const [tone, setTone] = useState(localStorage.getItem('lastTone') || 'Professional');
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.setItem('lastProductName', productName);
        localStorage.setItem('lastProductDesc', productDescription);
        localStorage.setItem('lastAudience', targetAudience);
        localStorage.setItem('lastTone', tone);
    }, [productName, productDescription, targetAudience, tone]);

    const handleStrategySubmit = async (event) => {
        event.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        
        setIsLoading(true);
        setError('');

        try {
            const response = await axios.post('http://127.0.0.1:8000/generate-strategies', {
                product_name: productName,
                product_description: productDescription,
                target_audience: targetAudience,
                tone: tone,
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            navigate(`/campaign/${response.data.id}`);

        } catch (err) {
            setError('Failed to generate strategies.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="app-container">
            <div className="page-nav">
                <Link to="/dashboard" className="secondary-button">← Back to Dashboard</Link>
            </div>
            <div className="header">
                <h1>Create a New Campaign</h1>
                <p className="subtitle">Start by telling us about your product. We've pre-filled your last entries for you!</p>
            </div>
            <form onSubmit={handleStrategySubmit} className="generator-form">
                <div className="form-group"><label>Product Name</label><input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} required /></div>
                <div className="form-group"><label>Product Description</label><textarea rows="3" value={productDescription} onChange={(e) => setProductDescription(e.target.value)} required /></div>
                <div className="form-group"><label>Target Audience</label><textarea rows="3" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} required /></div>
                <div className="form-group"><label>Tone of Voice</label><select value={tone} onChange={(e) => setTone(e.target.value)}><option>Professional</option><option>Witty</option><option>Inspirational</option><option>Friendly</option><option>Bold</option></select></div>
                <button type="submit" className="generate-button" disabled={isLoading}>{isLoading ? 'Generating...' : 'Generate Strategies'}</button>
                {error && <p className="error-message">{error}</p>}
            </form>
        </div>
    );
}

export default CampaignGenerator;
