import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const quotes = [
    { text: "The best marketing doesn't feel like marketing.", author: "Tom Fishburne" },
    { text: "Creativity is intelligence having fun.", author: "Albert Einstein" },
    { text: "Make your marketing so useful people would pay for it.", author: "Jay Baer" }
];

function Dashboard() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState('');
    const [quote, setQuote] = useState({ text: '', author: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const email = localStorage.getItem('userEmail');
        setUserEmail(email || 'User');
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

        const fetchCampaigns = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://127.0.0.1:8000/campaigns', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCampaigns(response.data);
            } catch (error) {
                console.error("Failed to fetch campaigns", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCampaigns();
    }, []);

    const handleSignOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="welcome-message">
                    <h1>Welcome, {userEmail.split('@')[0]}!</h1>
                    <p>Ready to spark some new ideas?</p>
                </div>
                <div className="header-actions">
                    <Link to="/generate" className="generate-button">Create New Campaign</Link>
                    <button onClick={handleSignOut} className="secondary-button">Sign Out</button>
                </div>
            </div>
            {loading ? <p>Loading campaigns...</p> : (
                <div className="campaign-list">
                    {campaigns.length > 0 ? campaigns.map(c => (
                        <Link to={`/campaign/${c.id}`} key={c.id} className="campaign-card-link">
                            <div className="campaign-card">
                                <h3>{c.product_name}</h3>
                                <p>Tone: {c.tone}</p>
                            </div>
                        </Link>
                    )) : <p>You haven't created any campaigns yet. Click "Create New Campaign" to get started!</p>}
                </div>
            )}
            <footer className="quote-footer">
                <p>"{quote.text}"</p>
                <cite>- {quote.author}</cite>
            </footer>
        </div>
    );
}

export default Dashboard;
