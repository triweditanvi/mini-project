import { useState } from 'react';
import Navbar from '../components/Navbar';
import { correctGrammar } from '../services/api';

function AutoCorrect() {
  const [text, setText] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCorrect = async () => {
    if (!text.trim()) {
      setError('Please enter some text to correct');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await correctGrammar(text);
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
          <h1>✨ Auto Correct</h1>
          <p>Automatically fix grammar and spelling errors</p>
        </div>

        <div className="feature-content">
          <div className="feature-input-section">
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setResults(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleCorrect();
                }
              }}
              placeholder="Enter or paste your text here to auto-correct..."
              className="feature-textarea"
            />
            
            <button 
              onClick={handleCorrect} 
              disabled={loading || !text.trim()}
              className="btn-feature btn-correct"
            >
              {loading ? (
                <>
                  <span className="btn-spinner"></span>
                  Correcting...
                </>
              ) : (
                'Auto Correct'
              )}
            </button>

            {error && <div className="error-message">{error}</div>}
          </div>

          <div className="feature-results">
            {!results && (
              <div className="empty-state">
                <span className="empty-icon">✨</span>
                <p>Enter text and click "Auto Correct" to fix errors</p>
              </div>
            )}

            {results && (
              <div className="result-card correction-card">
                <h3>Auto Correction Result</h3>
                
                <div className="correction-summary">
                  <span className={`correction-badge ${results.appliedCorrections > 0 ? 'success' : 'no-changes'}`}>
                    {results.appliedCorrections > 0 ? `✅ ${results.appliedCorrections} correction(s) applied` : '✅ No changes needed'}
                  </span>
                </div>

                {results.message && (
                  <div className="correction-message">{results.message}</div>
                )}

                {results.correctedText && (
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
                )}

                {results.appliedCorrections > 0 && (
                  <button 
                    onClick={handleApplyCorrection}
                    className="btn-feature btn-apply"
                  >
                    Apply Correction to Text
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AutoCorrect;