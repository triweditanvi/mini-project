import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Home() {
  const features = [
    {
      icon: '📊',
      title: 'Text Analysis',
      description: 'Get detailed statistics about your text including word count, characters, sentences, and readability score.',
      path: '/analyze'
    },
    {
      icon: '🚫',
      title: 'Spam Detection',
      description: 'Detect spam content with advanced keyword matching and pattern recognition algorithms.',
      path: '/spam'
    },
    {
      icon: '✅',
      title: 'Grammar Check',
      description: 'Check your text for grammar and spelling errors with AI-powered analysis and suggestions.',
      path: '/grammar'
    }
  ];

  return (
    <div className="home-page">
      <Navbar />
      
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">AI-Powered Text Analysis</div>
          <h1 className="hero-title">
            Analyze Your Text with
            <span className="gradient-text"> Advanced AI</span>
          </h1>
          <p className="hero-subtitle">
            Get instant insights on text statistics, detect spam, check grammar, and auto-correct errors. 
            Powerful AI tools to improve your writing quality.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="btn-hero btn-primary">
              Get Started Free
            </Link>
            <Link to="/signin" className="btn-hero btn-secondary">
              Sign In
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card card-1">
            <span>📊</span>
            <span>98% Accuracy</span>
          </div>
          <div className="floating-card card-2">
            <span>⚡</span>
            <span>Fast Response</span>
          </div>
          <div className="floating-card card-3">
            <span>🔒</span>
            <span>Secure</span>
          </div>
        </div>
      </section>

      <section className="features">
        <h2 className="section-title">Powerful Features</h2>
        <p className="section-subtitle">
          Everything you need to analyze and improve your text
        </p>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <Link to={feature.path} key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <span className="feature-arrow">→</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="cta">
        <div className="cta-content">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of users who improve their writing every day</p>
          <div className="cta-actions">
            <Link to="/signup" className="btn-hero btn-primary">
              Sign Up Now
            </Link>
            <Link to="/signin" className="btn-hero btn-secondary">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>© 2026 Text Analyzer. Built with ❤️</p>
      </footer>
    </div>
  );
}

export default Home;