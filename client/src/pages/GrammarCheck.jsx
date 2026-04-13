import { useState } from 'react';
import Navbar from '../components/Navbar';
import { checkGrammar } from '../services/api';

function GrammarCheck() {
  const [text, setText] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async () => {
    if (!text.trim()) {
      setError('Please enter some text to check');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await checkGrammar(text);
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCorrection = () => {
    if (results?.correctedText) {
      setText(results.correctedText);
      setResults(null);
    }
  };

  return (
    <div className="feature-page">
      <Navbar />
      
      <div className="feature-container">
        <div className="feature-header">
          <h1>✅ Grammar Check</h1>
          <p>Check your text for grammar and spelling errors</p>
        </div>

        <div className="feature-content">
          <div className="feature-input-section">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleCheck();
                }
              }}
              placeholder="Enter or paste your text here to check grammar..."
              className="feature-textarea"
            />
            
            <button 
              onClick={handleCheck} 
              disabled={loading || !text.trim()}
              className="btn-feature"
            >
              {loading ? (
                <>
                  <span className="btn-spinner"></span>
                  Checking...
                </>
              ) : (
                'Check Grammar'
              )}
            </button>

            {error && <div className="error-message">{error}</div>}
          </div>

          <div className="feature-results">
            {!results && (
              <div className="empty-state">
                <span className="empty-icon">✅</span>
                <p>Enter text and click "Check Grammar" to see errors</p>
              </div>
            )}

            {results && (
              <div className="result-card grammar-card">
                <h3>Grammar Check Result</h3>
                
                <div className="grammar-summary">
                  <span className={`grammar-badge ${results.hasErrors ? 'has-errors' : 'no-errors'}`}>
                    {results.hasErrors ? '⚠️ Issues Found' : '✅ No Errors'}
                  </span>
                  <span className="grammar-count">
                    {results.errorCount || 0} issue{(results.errorCount === 1) ? '' : 's'} found
                  </span>
                </div>

                {results.message && (
                  <div className="grammar-message">{results.message}</div>
                )}

                {results.errors && results.errors.length > 0 && (
                  <div className="grammar-errors">
                    <h4>Errors Found:</h4>
                    {results.errors.map((err, index) => (
                      <div key={index} className="grammar-error-item">
                        <div className="error-content">
                          <div className="error-original">
                            <span className="error-label">Original:</span>
                            <span className="error-text">"{err.original}"</span>
                          </div>
                          <div className="error-suggestion">
                            <span className="error-label">Suggestion:</span>
                            <span className="suggestion-text">→ {err.suggestion}</span>
                          </div>
                          {err.explanation && (
                            <div className="error-explanation">
                              <span className="error-label">Why:</span>
                              <span>{err.explanation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {results.correctedText && (
                  <>
                    <div className="correction-comparison">
                      <div className="correction-original">
                        <h4>Original Text:</h4>
                        <div className="text-box original">{text}</div>
                      </div>
                      
                      <div className="correction-arrow">↓</div>
                      
                      <div className="correction-new">
                        <h4>Corrected Text:</h4>
                        <div className="text-box corrected">{results.correctedText}</div>
                      </div>
                    </div>
                    
                    {results.hasErrors && (
                      <button 
                        onClick={handleApplyCorrection}
                        className="btn-feature btn-apply"
                      >
                        Apply Correction to Text
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GrammarCheck;