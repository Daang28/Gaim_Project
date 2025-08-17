import { useState } from 'react';
import axios from 'axios';
import './App.css';

//  Social Media Icons
const InstagramIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
const FacebookIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;
const LinkedInIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>;


function App() {
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [tone, setTone] = useState('Professional');
  
  const [strategies, setStrategies] = useState([]);
  const [selectedStrategyIndex, setSelectedStrategyIndex] = useState(null);
  const [socialPosts, setSocialPosts] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialsLoading, setIsSocialsLoading] = useState(false);
  const [error, setError] = useState('');

  // Improved function
  const handleStrategySubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setStrategies([]);
    setSocialPosts('');
    setSelectedStrategyIndex(null);

    try {
      // Vercel URL, 
      // local server address
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/generate-strategies`;
      
      const response = await axios.post(apiUrl, {
        product_name: productName,
        product_description: productDescription,
        target_audience: targetAudience,
        tone: tone,
      });
      
      if (response.data.strategies) {
        setStrategies(response.data.strategies);
      } else {
        setError(response.data.error || 'An unexpected error occurred.');
      }
    } catch (err) {
      setError('Failed to connect to the backend. Is it running?');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialsSubmit = async (strategyText, index) => {
    setSelectedStrategyIndex(index);
    setIsSocialsLoading(true);
    setSocialPosts('');
    setError('');
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/generate-socials`;
      
      const response = await axios.post(apiUrl, {
        product_name: productName,
        product_description: productDescription,
        target_audience: targetAudience,
        tone: tone,
        core_narrative: strategyText
      });
      
      if (response.data.social_media_posts) {
        setSocialPosts(response.data.social_media_posts);
      } else {
        setError(response.data.error || 'Failed to generate social posts.');
      }
    } catch (err) {
      setError('Failed to generate social media posts.');
      console.error(err);
    } finally {
      setIsSocialsLoading(false);
    }
  }

  const cleanText = (text) => {
    if (!text) return '';
    let cleanedText = text.replace(/^(Concept Name:|Core Narrative:)\s*/gim, '');
    cleanedText = cleanedText.replace(/#{1,3}\s/g, '');
    cleanedText = cleanedText.replace(/\*/g, '');
    return cleanedText.trim();
  };

  const renderSocialPosts = (postsText) => {
    if (!postsText) return null;
    const sections = {'Instagram Post': { icon: <InstagramIcon />, content: '' },'Facebook Post': { icon: <FacebookIcon />, content: '' },'LinkedIn Post': { icon: <LinkedInIcon />, content: '' }};
    const postSections = postsText.split(/(?=Instagram Post|Facebook Post|LinkedIn Post)/g);
    
    postSections.forEach(section => {
      if (section.startsWith('Instagram Post')) sections['Instagram Post'].content = cleanText(section.replace('Instagram Post', '').trim());
      else if (section.startsWith('Facebook Post')) sections['Facebook Post'].content = cleanText(section.replace('Facebook Post', '').trim());
      else if (section.startsWith('LinkedIn Post')) sections['LinkedIn Post'].content = cleanText(section.replace('LinkedIn Post', '').trim());
    });

    return (
      <div className="social-grid">
        {Object.entries(sections).map(([title, data]) => data.content && (<div key={title} className="social-card"><div className="social-card-header">{data.icon}<h3>{title}</h3></div><pre className="social-card-content">{data.content}</pre></div>))}
      </div>
    );
  };

  return (
    <div className="app-container">
      <div className="header">
        <div className="logo"><span>🔥</span></div>
        <h1>MarketSpark AI</h1>
        <p className="subtitle">Ignite Your Brand Story with AI-Powered Narratives.</p>
      </div>
      <form onSubmit={handleStrategySubmit} className="generator-form">
        <div className="form-group"><label htmlFor="productName">Product Name</label><input type="text" id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g., Artisan Coffee Beans" required /></div>
        <div className="form-group"><label htmlFor="productDescription">Product Description</label><textarea id="productDescription" rows="3" value={productDescription} onChange={(e) => setProductDescription(e.target.value)} placeholder="e.g., Single-origin, ethically sourced coffee..." required /></div>
        <div className="form-group"><label htmlFor="targetAudience">Target Audience</label><textarea id="targetAudience" rows="3" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="e.g., Urban professionals who appreciate quality..." required /></div>
        <div className="form-group"><label htmlFor="tone">Tone of Voice</label><select id="tone" value={tone} onChange={(e) => setTone(e.target.value)}><option>Professional</option><option>Witty</option><option>Inspirational</option><option>Friendly</option><option>Bold</option></select></div>
        <button type="submit" className="generate-button" disabled={isLoading}>{isLoading ? 'Generating Strategies...' : 'Generate 3 Strategies'}</button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {strategies.length > 0 && (
        <div className="results-container">
          <h2 className="results-title">Choose Your Strategic Direction</h2>
          <div className="strategy-grid">
            {strategies.map((strategy, index) => (
              <div key={index} className="strategy-card">
                <pre className="narrative-content">{cleanText(strategy)}</pre>
                <button 
                  onClick={() => handleSocialsSubmit(strategy, index)} 
                  className="generate-socials-button"
                  disabled={isSocialsLoading}
                >
                  {isSocialsLoading && selectedStrategyIndex === index ? 'Generating Posts...' : 'Generate Social Posts for this Strategy'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {socialPosts && (
        <div className="social-posts-section">
            <h2 className="results-title">Platform-Specific Social Media Posts</h2>
            {renderSocialPosts(socialPosts)}
        </div>
      )}
    </div>
  );
}

export default App;