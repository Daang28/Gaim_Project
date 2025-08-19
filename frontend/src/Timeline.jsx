import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';

function Timeline() {
    const [timeline, setTimeline] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { campaignId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    const { strategy, duration, campaignName } = location.state || {};

    useEffect(() => {
        if (!strategy || !duration) {
            navigate(`/campaign/${campaignId}`);
            return;
        }

        const generateTimeline = async () => {
            const token = localStorage.getItem('token');
            if (!token) { 
                navigate('/login'); 
                return; 
            }
            try {
                const response = await axios.post('http://127.0.0.1:8000/generate-socials-timeline', {
                    campaign_id: parseInt(campaignId),
                    selected_strategy: strategy,
                    duration: duration
                }, { headers: { Authorization: `Bearer ${token}` } });
                
                if (response.data.social_media_timeline) {
                    setTimeline(response.data.social_media_timeline);
                } else {
                    setError(response.data.error || 'An unexpected error occurred.');
                }
            } catch (error) {
                setError('Failed to generate timeline. Please check the backend server.');
            } finally {
                setIsLoading(false);
            }
        };
        generateTimeline();
    }, [campaignId, strategy, duration, navigate]);

    // This function now cleans the output and formats it into daily cards
    const formatTimeline = (timelineText) => {
        if(!timelineText) return null;
        
        let cleanedText = timelineText.replace(/\*/g, ''); // Remove asterisks

        // --- THIS IS THE FIX ---
        // Find the start of the actual timeline content ("Day 1:")
        const startIndex = cleanedText.search(/Day 1:/i); // Use case-insensitive search
        if (startIndex !== -1) {
            // If "Day 1:" is found, slice the string from that point to remove any intro
            cleanedText = cleanedText.substring(startIndex);
        }
        // --- END OF FIX ---

        const days = cleanedText.split(/Day \d+:/).filter(text => text.trim() !== '');
        
        return days.map((dayContent, index) => (
            <div key={index} className="timeline-day-card">
                <h3>Day {index + 1}</h3>
                <pre>{dayContent.trim()}</pre>
            </div>
        ));
    };

    return (
        <div className="app-container">
            <div className="page-nav">
                <Link to={`/campaign/${campaignId}`} className="secondary-button">← Back to Strategies</Link>
                <Link to="/dashboard" className="secondary-button">🏠 Home</Link>
            </div>
             <div className="header">
                <h1>Your {duration}-Day Campaign for {campaignName}</h1>
                <p className="subtitle">Here is your ready-to-use social media plan.</p>
            </div>
            {isLoading && <p style={{textAlign: 'center', fontSize: '1.2rem'}}>Your timeline is being crafted by our AI... please wait.</p>}
            {error && <p className="error-message">{error}</p>}
            {timeline && (
                <div className="timeline-container">
                    {formatTimeline(timeline)}
                </div>
            )}
        </div>
    );
}

export default Timeline;
