import React from 'react';
import { Link } from 'react-router-dom';

function Landing() {
    return (
        <div className="landing-container">
            <div className="landing-content">
                <div className="logo">
                    <span>🔥</span>
                </div>
                <h1>Welcome to MarketSpark AI</h1>
                <p className="subtitle">The smartest, fastest way to build marketing campaigns that get results. Go from a simple idea to a full social media timeline in minutes.</p>
                <div className="landing-buttons">
                    <Link to="/signup" className="generate-button">Get Started for Free</Link>
                    <Link to="/login" className="secondary-button">Login</Link>
                </div>
            </div>
        </div>
    );
}

export default Landing;
