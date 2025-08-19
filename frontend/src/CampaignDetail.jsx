import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';

function CampaignDetail() {
    const [campaign, setCampaign] = useState(null);
    const [error, setError] = useState('');
    const { campaignId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCampaign = async () => {
            const token = localStorage.getItem('token');
            if (!token) { navigate('/login'); return; }
            try {
                const response = await axios.get(`http://127.0.0.1:8000/campaigns/${campaignId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCampaign(response.data);
            } catch (error) {
                setError('Could not fetch campaign details.');
            }
        };
        fetchCampaign();
    }, [campaignId, navigate]);

    const handleGenerateTimeline = (strategy, duration) => {
        navigate(`/campaign/${campaignId}/timeline`, { state: { strategy, duration, campaignName: campaign.product_name } });
    };

    const cleanAndFormatStrategy = (strategyText) => {
        const cleaned = strategyText.replace(/^(Concept Name:|Core Narrative:)\s*/gim, '').replace(/\*/g, '').trim();
        const parts = cleaned.split('\n');
        const conceptName = parts[0];
        const narrative = parts.slice(1).join('\n');
        return (
            <>
                <p className="strategy-concept">{conceptName}</p>
                <pre className="narrative-content">{narrative}</pre>
            </>
        );
    };

    if (error) return <div className="app-container"><p className="error-message">{error}</p></div>
    if (!campaign) return <div className="app-container"><p>Loading campaign...</p></div>

    const strategies = campaign.strategies.split('---').map(s => s.trim());

    return (
        <div className="app-container">
            <div className="page-nav">
                <Link to="/dashboard" className="secondary-button">← Back to Dashboard</Link>
            </div>
            <div className="header">
                <h1>Campaign: {campaign.product_name}</h1>
                <p className="subtitle">Review your generated strategies and create a social media timeline.</p>
            </div>

            <div className="results-container">
                <h2 className="results-title">Choose Your Strategic Direction</h2>
                <div className="strategy-grid">
                    {strategies.map((strategy, index) => (
                        <div key={index} className="strategy-card">
                            {cleanAndFormatStrategy(strategy)}
                            <div className="timeline-options">
                                <p>Generate Timeline:</p>
                                <button onClick={() => handleGenerateTimeline(strategy, 7)}>7 Days</button>
                                <button onClick={() => handleGenerateTimeline(strategy, 15)}>15 Days</button>
                                <button onClick={() => handleGenerateTimeline(strategy, 30)}>30 Days</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CampaignDetail;
