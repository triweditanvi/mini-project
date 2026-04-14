import { useState } from 'react';
import Navbar from '../components/Navbar';
import { analyzeText } from '../services/api';

function TextAnalysis() {
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

  const stats = [
    { label: 'Words', value: results?.textAnalysis?.wordCount, icon: '📝' },
    { label: 'Characters', value: results?.textAnalysis?.charCount, icon: '🔤' },
    { label: 'Sentences', value: results?.textAnalysis?.sentenceCount, icon: '📖' },
    { label: 'Paragraphs', value: results?.textAnalysis?.paragraphCount, icon: '📄' },
    { label: 'Reading Time', value: `${results?.textAnalysis?.readingTime} min`, icon: '⏱️' },
    { label: 'Readability', value: results?.textAnalysis?.readabilityLevel, icon: '📊', highlight: true }
  ];

  return (
    <div className="feature-page">
      <Navbar />
      
      <div className="feature-container">
        <div className="feature-header">
          <h1>📊 Text Analysis</h1>
          <p>Get detailed statistics about your text</p>
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
              placeholder="Enter or paste your text here to analyze..."
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
                'Analyze Text'
              )}
            </button>

            {error && <div className="error-message">{error}</div>}
          </div>

          <div className="feature-results">
            {!results && (
              <div className="empty-state">
                <span className="empty-icon">📊</span>
                <p>Enter text and click "Analyze" to see results</p>
              </div>
            )}

            {results && (
              <>
                <div className="result-card result-main">
                  <h3>Text Statistics</h3>
                  <div className="stats-grid">
                    {stats.map((stat, index) => (
                      <div key={index} className={`stat-item ${stat.highlight ? 'highlight' : ''}`}>
                        <span className="stat-icon">{stat.icon}</span>
                        <span className="stat-label">{stat.label}</span>
                        <span className="stat-value">{stat.value || '-'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {results.sentiment && (
                  <div className="sentiment-mini">
                    <span>Sentiment: </span>
                    <span className={`sentiment-badge-mini ${results.sentiment.label.toLowerCase()}`}>
                      {results.sentiment.label === 'Positive' ? '😊 Positive' : 
                       results.sentiment.label === 'Negative' ? '😞 Negative' : '😐 Neutral'}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TextAnalysis;