import { useState } from 'react';
import Navbar from '../components/Navbar';
import { analyzeText } from '../services/api';

function SpamDetection() {
  const [text, setText] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError('Please enter some text to analyze');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await analyzeText(text);
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (level) => {
    switch (level) {
      case 'Low': return 'safe';
      case 'Medium': return 'medium';
      case 'High': return 'high';
      default: return 'safe';
    }
  };

  return (
    <div className="feature-page">
      <Navbar />
      
      <div className="feature-container">
        <div className="feature-header">
          <h1>🚫 Spam Detection</h1>
          <p>Detect spam content in your text</p>
        </div>

        <div className="feature-content">
          <div className="feature-input-section">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAnalyze();
                }
              }}
              placeholder="Enter or paste your text here to check for spam..."
              className="feature-textarea"
            />
            
            <button 
              onClick={handleAnalyze} 
              disabled={loading || !text.trim()}
              className="btn-feature"
            >
              {loading ? (
                <>
                  <span className="btn-spinner"></span>
                  Analyzing...
                </>
              ) : (
                'Detect Spam'
              )}
            </button>

            {error && <div className="error-message">{error}</div>}
          </div>

          <div className="feature-results">
            {!results && (
              <div className="empty-state">
                <span className="empty-icon">🚫</span>
                <p>Enter text and click "Detect Spam" to see results</p>
              </div>
            )}

            {results && results.spamDetection && (
              <div className="result-card spam-card">
                <h3>Spam Detection Result</h3>
                
                <div className="spam-result-main">
                  <div className={`spam-badge ${results.spamDetection.isSpam ? 'spam' : 'safe'}`}>
                    {results.spamDetection.isSpam ? '⚠️ Spam Detected' : '✅ Safe'}
                  </div>
                  
                  <div className="spam-score-display">
                    <div className="spam-score-label">Spam Probability</div>
                    <div className="spam-score-bar">
                      <div 
                        className={`spam-score-fill ${getScoreColor(results.spamDetection.level)}`}
                        style={{ width: `${results.spamDetection.score}%` }}
                      ></div>
                    </div>
                    <div className="spam-score-value">
                      {results.spamDetection.score}%
                      <span className="spam-level">({results.spamDetection.level} Risk)</span>
                    </div>
                  </div>
                </div>

                {results.spamDetection.reasons && results.spamDetection.reasons.length > 0 && (
                  <div className="spam-reasons">
                    <h4>Detection Reasons:</h4>
                    <div className="reasons-list">
                      {results.spamDetection.reasons.map((reason, index) => (
                        <div key={index} className="reason-item">
                          <span className="reason-icon">⚠️</span>
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpamDetection;