import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { grammarAPI, type Grammar } from '../../services/api';
import { ChevronRight, TrendingUp } from 'lucide-react';
import './Grammar.css';

const GrammarList: React.FC = () => {
  const [grammars, setGrammars] = useState<Grammar[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
  const themes = ['基础', '判断', '助词', '愿望', '列举', '条件', '目的', '因果', '转折', '时态'];

  useEffect(() => {
    loadGrammars();
    loadRecommendations();
  }, [selectedLevel, selectedTheme]);

  const loadGrammars = async () => {
    setLoading(true);
    try {
      const data = await grammarAPI.list(selectedLevel, selectedTheme);
      setGrammars(data);
    } catch (error) {
      console.error('Failed to load grammars:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      const data = await grammarAPI.getRecommendations();
      setRecommendations(data);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  };

  const getProficiencyClass = (score: number) => {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  };

  return (
    <div className="grammar-list">
      <div className="page-header">
        <h2>Grammar Trainer</h2>
        <p>Master Japanese grammar points step by step</p>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Level</label>
          <select 
            value={selectedLevel} 
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="filter-select"
          >
            <option value="">All Levels</option>
            {levels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Theme</label>
          <select 
            value={selectedTheme} 
            onChange={(e) => setSelectedTheme(e.target.value)}
            className="filter-select"
          >
            <option value="">All Themes</option>
            {themes.map(theme => (
              <option key={theme} value={theme}>{theme}</option>
            ))}
          </select>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="recommendations">
          <h3>
            <TrendingUp size={20} />
            Recommended for Review
          </h3>
          <div className="recommendation-tags">
            {recommendations.slice(0, 3).map(id => {
              const grammar = grammars.find(g => g.id === id);
              return grammar ? (
                <Link 
                  key={id} 
                  to={`/grammar/${id}`} 
                  className="recommendation-tag"
                >
                  {grammar.title}
                </Link>
              ) : null;
            })}
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="grammar-grid">
          {grammars.map(grammar => (
            <Link 
              key={grammar.id} 
              to={`/grammar/${grammar.id}`} 
              className="grammar-card"
            >
              <div className="grammar-card-header">
                <span className="grammar-level">{grammar.level}</span>
                <div className={`proficiency-badge ${getProficiencyClass(grammar.proficiency)}`}>
                  {Math.round(grammar.proficiency)}%
                </div>
              </div>
              
              <h3 className="grammar-title">{grammar.title}</h3>
              <p className="grammar-structure">{grammar.structure}</p>
              <p className="grammar-usage">{grammar.usage}</p>
              
              <div className="grammar-themes">
                {grammar.themes.map(theme => (
                  <span key={theme} className="theme-tag">{theme}</span>
                ))}
              </div>

              <ChevronRight className="card-arrow" size={20} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default GrammarList;