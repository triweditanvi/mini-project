import { useState } from 'react'

function App() {
  const [text, setText] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sentimentLoading, setSentimentLoading] = useState(false)
  const [grammarLoading, setGrammarLoading] = useState(false)
  const [correctLoading, setCorrectLoading] = useState(false)

  const analyzeText = async () => {
    if (!text.trim()) {
      setError('Please enter some text to analyze')
      return
    }
    setError('')
    setLoading(true)
    setResults(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      const data = await response.json()
      setResults(prev => ({ ...prev, ...data }))
    } catch (err) {
      setError('Failed to analyze text. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const analyzeSentiment = async () => {
    if (!text.trim()) return
    setSentimentLoading(true)
    
    try {
      const puter = window.puter
      if (!puter) {
        const script = document.createElement('script')
        script.src = 'https://js.puter.com/v2/'
        document.body.appendChild(script)
        await new Promise(resolve => script.onload = resolve)
      }
      
      const { puter: p } = window
      if (!p) throw new Error('Puter.js not loaded')
      
      const result = await p.ai.chat('Analyze the sentiment of the following text and respond with just one word: positive, negative, or neutral. Text: ' + text.substring(0, 1000))
      
      const sentiment = result.message.content.toLowerCase()
      let label = 'neutral'
      if (sentiment.includes('positive')) label = 'positive'
      else if (sentiment.includes('negative')) label = 'negative'
      
      setResults(prev => prev ? {
        ...prev,
        sentiment: {
          label,
          confidence: 0.8
        }
      } : null)
    } catch (err) {
      console.error('Sentiment analysis error:', err)
    } finally {
      setSentimentLoading(false)
    }
  }

  const getSentimentIcon = (label) => {
    switch (label) {
      case 'positive': return '😊'
      case 'negative': return '😞'
      default: return '😐'
    }
  }

  const checkGrammar = async () => {
    if (!text.trim()) return
    setGrammarLoading(true)
    
    try {
      const response = await fetch('/api/grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      const data = await response.json()
      setResults(prev => prev ? { ...prev, grammar: data } : { grammar: data })
    } catch (err) {
      setError('Failed to check grammar. Please try again.')
    } finally {
      setGrammarLoading(false)
    }
  }

  const correctGrammar = async () => {
    if (!text.trim()) return
    setCorrectLoading(true)
    
    try {
      const response = await fetch('/api/grammar/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      const data = await response.json()
      setResults(prev => prev ? { ...prev, grammar_corrected: data } : { grammar_corrected: data })
      if (data.corrected_text) setText(data.corrected_text)
    } catch (err) {
      setError('Failed to correct grammar. Please try again.')
    } finally {
      setCorrectLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>📊 Text Analyzer</h1>
        <p>Analyze your text for statistics, spam detection, and sentiment</p>
      </header>

      <div className="container">
        <div className="input-section">
          <h2 className="section-title">📝 Enter Text</h2>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type your text here..."
          />
          <button 
            className="btn" 
            onClick={analyzeText}
            disabled={loading || !text.trim()}
          >
            {loading ? 'Analyzing...' : 'Analyze Text'}
          </button>
          
          <button 
            className="btn" 
            onClick={analyzeSentiment}
            disabled={sentimentLoading || !text.trim()}
            style={{ marginLeft: '0.5rem', background: '#8b5cf6' }}
          >
            {sentimentLoading ? 'Analyzing...' : 'Detect Sentiment'}
          </button>

          <button 
            className="btn" 
            onClick={checkGrammar}
            disabled={grammarLoading || !text.trim()}
            style={{ marginLeft: '0.5rem', background: '#06b6d4' }}
          >
            {grammarLoading ? <><span className="btn-spinner"></span> Checking...</> : 'Check Grammar'}
          </button>

          <button 
            className="btn" 
            onClick={correctGrammar}
            disabled={correctLoading || !text.trim()}
            style={{ marginLeft: '0.5rem', background: '#10b981' }}
          >
            {correctLoading ? <><span className="btn-spinner"></span> Correcting...</> : 'Auto Correct'}
          </button>

          {error && <div className="error">{error}</div>}
        </div>

        <div className="results-section">
          <h2 className="section-title">📈 Results</h2>
          
          {!results && (
            <div className="empty-state">
              Enter text and click "Analyze" to see results
            </div>
          )}

          {results && (
            <div className="results-grid">
              {results.text_analysis && (
                <div className="result-card">
                  <h3>Text Statistics</h3>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-label">Words</span>
                      <span className="stat-value">{results.text_analysis.word_count}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Characters</span>
                      <span className="stat-value">{results.text_analysis.char_count}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Sentences</span>
                      <span className="stat-value">{results.text_analysis.sentence_count}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Paragraphs</span>
                      <span className="stat-value">{results.text_analysis.paragraph_count}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Reading Time</span>
                      <span className="stat-value">{results.text_analysis.reading_time} min</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Readability</span>
                      <span className="stat-value">{results.text_analysis.readability_level}</span>
                    </div>
                  </div>
                </div>
              )}

              {results.spam_detection && (
                <div className="result-card">
                  <h3>Spam Detection</h3>
                  <div className="spam-result">
                    <span className={`spam-badge ${results.spam_detection.is_spam ? 'spam' : 'safe'}`}>
                      {results.spam_detection.is_spam ? '⚠️ Spam' : '✅ Safe'}
                    </span>
                    <div className="spam-score">
                      <div 
                        className={`spam-score-fill ${results.spam_detection.level.toLowerCase()}`}
                        style={{ width: `${results.spam_detection.score}%` }}
                      />
                    </div>
                    <span>{results.spam_detection.score}%</span>
                  </div>
                  {results.spam_detection.reasons.length > 0 && (
                    <div className="reasons">
                      {results.spam_detection.reasons.map((reason, i) => (
                        <span key={i} className="reason">{reason}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {results.sentiment && (
                <div className="result-card">
                  <h3>Sentiment Analysis</h3>
                  <div className="sentiment-result">
                    <span className="sentiment-icon">{getSentimentIcon(results.sentiment.label)}</span>
                    <div>
                      <div className="sentiment-label">{results.sentiment.label}</div>
                      <div className="sentiment-confidence">
                        Confidence: {Math.round(results.sentiment.confidence * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {results.grammar && results.grammar.has_errors !== undefined && (
                <div className="result-card">
                  <h3>Grammar Check</h3>
                  {results.grammar.error ? (
                    <div className="error">{results.grammar.error}</div>
                  ) : (
                    <>
                      <div className="grammar-summary">
                        <span className={`grammar-badge ${results.grammar.has_errors ? 'has-errors' : 'no-errors'}`}>
                          {results.grammar.has_errors ? '⚠️ Issues Found' : '✅ No Errors'}
                        </span>
                        <span className="grammar-count">
                          {results.grammar.error_count || 0} issue{(results.grammar.error_count === 1) ? '' : 's'} found
                        </span>
                      </div>
                      {results.grammar.errors && results.grammar.errors.length > 0 && (
                        <div className="grammar-errors">
                          {results.grammar.errors.map((err, i) => (
                            <div key={i} className="grammar-error-item">
                              <div className="error-original">"{err.original}"</div>
                              <div className="error-suggestion">→ {err.suggestion}</div>
                              {err.explanation && <div className="error-explanation">{err.explanation}</div>}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {results.grammar_corrected && results.grammar_corrected.applied_corrections !== undefined && (
                <div className="result-card">
                  <h3>Grammar Corrected</h3>
                  <div className="grammar-summary">
                    <span className="grammar-badge success">
                      ✅ {results.grammar_corrected.applied_corrections} correction{(results.grammar_corrected.applied_corrections !== 1) ? 's' : ''} applied
                    </span>
                  </div>
                  {results.grammar_corrected.corrected_text && (
                    <div className="corrected-text">
                      <h4>Corrected Text:</h4>
                      <div className="corrected-content">{results.grammar_corrected.corrected_text}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App