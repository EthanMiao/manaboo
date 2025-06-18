import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { grammarAPI, type MistakeDetail } from '../../services/api';
import { ArrowLeft, Calendar, BookOpen, RefreshCw } from 'lucide-react';
import './Stats.css';

const MistakeReview: React.FC = () => {
  const [mistakes, setMistakes] = useState<MistakeDetail[]>([]);
  const [selectedMistake, setSelectedMistake] = useState<MistakeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMistakes();
  }, []);

  const loadMistakes = async () => {
    setLoading(true);
    try {
      const data = await grammarAPI.getMistakes();
      setMistakes(data);
    } catch (error) {
      console.error('Failed to load mistakes:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const groupMistakesByGrammar = () => {
    const grouped: Record<string, MistakeDetail[]> = {};
    mistakes.forEach(mistake => {
      if (!grouped[mistake.grammarId]) {
        grouped[mistake.grammarId] = [];
      }
      grouped[mistake.grammarId].push(mistake);
    });
    return grouped;
  };

  if (loading) {
    return <div className="loading">Loading mistakes...</div>;
  }

  const groupedMistakes = groupMistakesByGrammar();

  return (
    <div className="mistake-review">
      <div className="page-header">
        <Link to="/stats" className="back-link">
          <ArrowLeft size={20} />
          Back to Stats
        </Link>
        <h2>Mistake Review</h2>
      </div>

      {mistakes.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={48} />
          <h3>No mistakes yet!</h3>
          <p>Keep practicing and any mistakes will appear here for review.</p>
          <Link to="/grammar" className="practice-link">
            Start Practicing
          </Link>
        </div>
      ) : (
        <div className="mistakes-container">
          <div className="mistakes-sidebar">
            <h3>Grammar Points ({Object.keys(groupedMistakes).length})</h3>
            {Object.entries(groupedMistakes).map(([grammarId, grammarMistakes]) => (
              <div key={grammarId} className="grammar-group">
                <div className="grammar-group-header">
                  <span className="grammar-id">{grammarId}</span>
                  <span className="mistake-count">{grammarMistakes.length} mistakes</span>
                </div>
                <Link 
                  to={`/grammar/${grammarId}/practice`} 
                  className="review-button"
                >
                  <RefreshCw size={16} />
                  Practice Again
                </Link>
              </div>
            ))}
          </div>

          <div className="mistakes-detail">
            <h3>Recent Mistakes</h3>
            <div className="mistakes-list">
              {mistakes.map(mistake => (
                <div 
                  key={mistake.id} 
                  className={`mistake-item ${selectedMistake?.id === mistake.id ? 'selected' : ''}`}
                  onClick={() => setSelectedMistake(mistake)}
                >
                  <div className="mistake-header">
                    <span className="mistake-grammar">{mistake.grammarId}</span>
                    <span className="mistake-date">
                      <Calendar size={14} />
                      {formatDate(mistake.timestamp)}
                    </span>
                  </div>
                  
                  <div className="mistake-content">
                    <div className="answer-comparison">
                      <div className="your-answer">
                        <span className="label">Your answer:</span>
                        <span className="text incorrect">{mistake.user_answer}</span>
                      </div>
                      <div className="correct-answer">
                        <span className="label">Correct:</span>
                        <span className="text correct">{mistake.correct_answer}</span>
                      </div>
                    </div>
                  </div>

                  {selectedMistake?.id === mistake.id && (
                    <div className="mistake-explanation">
                      <p>{mistake.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MistakeReview;