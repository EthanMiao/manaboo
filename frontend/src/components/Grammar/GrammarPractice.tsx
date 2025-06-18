import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { grammarAPI, type Grammar, type Exercise, type ExerciseResult } from '../../services/api';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import './Grammar.css';

const GrammarPractice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [grammar, setGrammar] = useState<Grammar | null>(null);
  const [exerciseType, setExerciseType] = useState<string>('choice');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const exerciseTypes = [
    { value: 'choice', label: 'Multiple Choice' },
    { value: 'fill_in_the_blank', label: 'Fill in the Blank' },
    { value: 'sentence', label: 'Make a Sentence' }
  ];

  useEffect(() => {
    if (id) {
      loadGrammar();
    }
  }, [id]);

  const loadGrammar = async () => {
    try {
      const data = await grammarAPI.getDetail(id!);
      setGrammar(data);
    } catch (error) {
      console.error('Failed to load grammar:', error);
    }
  };

  const generateExercises = async () => {
    setLoading(true);
    try {
      const data = await grammarAPI.generateExercise(id!, exerciseType);
      setExercises(data);
      setCurrentIndex(0);
      setUserAnswer('');
      setResult(null);
      setShowResult(false);
    } catch (error) {
      console.error('Failed to generate exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) return;

    const currentExercise = exercises[currentIndex];
    try {
      const data = await grammarAPI.submitAnswer(id!, currentExercise.id, userAnswer);
      setResult(data);
      setShowResult(true);
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
      setResult(null);
      setShowResult(false);
    } else {
      navigate(`/grammar/${id}`);
    }
  };

  const currentExercise = exercises[currentIndex];

  return (
    <div className="grammar-practice">
      <div className="practice-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <ArrowLeft size={20} />
          Back
        </button>
        <h2>{grammar?.title} Practice</h2>
      </div>

      {exercises.length === 0 ? (
        <div className="practice-setup">
          <h3>Choose Exercise Type</h3>
          <div className="exercise-type-options">
            {exerciseTypes.map(type => (
              <label key={type.value} className="radio-option">
                <input
                  type="radio"
                  value={type.value}
                  checked={exerciseType === type.value}
                  onChange={(e) => setExerciseType(e.target.value)}
                />
                <span>{type.label}</span>
              </label>
            ))}
          </div>
          <button 
            onClick={generateExercises} 
            className="start-button"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Start Practice'}
          </button>
        </div>
      ) : (
        <div className="practice-content">
          <div className="progress-indicator">
            Question {currentIndex + 1} of {exercises.length}
          </div>

          <div className="question-section">
            <p className="question-text">{currentExercise.question}</p>

            {exerciseType === 'choice' && currentExercise.options && (
              <div className="options-list">
                {currentExercise.options.map((option, index) => (
                  <label key={index} className="option-item">
                    <input
                      type="radio"
                      name="answer"
                      value={option}
                      checked={userAnswer === option}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      disabled={showResult}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}

            {exerciseType !== 'choice' && (
              <textarea
                className="answer-input"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer here..."
                disabled={showResult}
                rows={4}
              />
            )}
          </div>

          {!showResult && (
            <button 
              onClick={submitAnswer} 
              className="submit-button"
              disabled={!userAnswer.trim()}
            >
              Submit Answer
            </button>
          )}

          {showResult && result && (
            <div className={`result-section ${result.result}`}>
              <div className="result-header">
                {result.result === 'correct' ? (
                  <>
                    <CheckCircle size={24} />
                    <span>Correct!</span>
                  </>
                ) : (
                  <>
                    <XCircle size={24} />
                    <span>Incorrect</span>
                  </>
                )}
              </div>
              
              <div className="result-content">
                <p className="explanation">{result.explanation}</p>
                {result.suggestion && (
                  <div className="suggestion">
                    <strong>Correct answer:</strong> {result.suggestion}
                  </div>
                )}
              </div>

              <button onClick={nextQuestion} className="next-button">
                {currentIndex < exercises.length - 1 ? 'Next Question' : 'Finish Practice'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GrammarPractice;