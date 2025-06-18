import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { grammarAPI, type Grammar } from '../../services/api';
import { ArrowLeft, Play } from 'lucide-react';
import './Grammar.css';

const GrammarDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [grammar, setGrammar] = useState<Grammar | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadGrammar();
    }
  }, [id]);

  const loadGrammar = async () => {
    setLoading(true);
    try {
      const data = await grammarAPI.getDetail(id!);
      setGrammar(data);
    } catch (error) {
      console.error('Failed to load grammar:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!grammar) {
    return <div className="error">Grammar not found</div>;
  }

  return (
    <div className="grammar-detail">
      <Link to="/grammar" className="back-link">
        <ArrowLeft size={20} />
        Back to list
      </Link>

      <div className="detail-header">
        <div>
          <span className="grammar-level-badge">{grammar.level}</span>
          <h1>{grammar.title}</h1>
        </div>
        <Link to={`/grammar/${id}/practice`} className="practice-btn">
          <Play size={20} />
          Start Practice
        </Link>
      </div>

      <div className="detail-content">
        <section className="detail-section">
          <h3>Structure</h3>
          <div className="structure-box">
            {grammar.structure}
          </div>
        </section>

        <section className="detail-section">
          <h3>Usage</h3>
          <p className="usage-text">{grammar.usage}</p>
        </section>

        <section className="detail-section">
          <h3>Examples</h3>
          <div className="examples-list">
            {grammar.examples.map((example, index) => (
              <div key={index} className="example-item">
                <p className="example-ja">{example.ja}</p>
                <p className="example-zh">{example.zh}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="detail-section">
          <h3>Themes</h3>
          <div className="theme-tags">
            {grammar.themes.map(theme => (
              <span key={theme} className="theme-tag">{theme}</span>
            ))}
          </div>
        </section>

        <section className="detail-section">
          <h3>Your Progress</h3>
          <div className="progress-info">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${grammar.proficiency}%` }}
              />
            </div>
            <span className="progress-text">
              Proficiency: {Math.round(grammar.proficiency)}%
            </span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default GrammarDetail;