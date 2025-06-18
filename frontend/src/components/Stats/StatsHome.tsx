import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { statsAPI, type WeeklyStats } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp, BookOpen, MessageSquare, AlertCircle } from 'lucide-react';
import './Stats.css';

interface Summary {
  total_grammar_practiced: number;
  mastered_grammar: number;
  total_mistakes: number;
  total_dialogue_sessions: number;
  mastery_rate: number;
}

const StatsHome: React.FC = () => {
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [weeklyData, summaryData] = await Promise.all([
        statsAPI.getWeeklyStats(),
        statsAPI.getSummary()
      ]);
      setWeeklyStats(weeklyData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await statsAPI.exportData();
    } catch (error) {
      console.error('Failed to export data:', error);
    } finally {
      setExporting(false);
    }
  };

  const setStudyReminder = () => {
    const time = prompt('Set daily reminder time (e.g., 19:00):');
    if (time) {
      localStorage.setItem('reminderTime', time);
      alert(`Study reminder set for ${time} daily`);
    }
  };

  if (loading) {
    return <div className="loading">Loading statistics...</div>;
  }

  return (
    <div className="stats-home">
      <div className="page-header">
        <h2>Study Tracker</h2>
        <div className="header-actions">
          <button onClick={setStudyReminder} className="reminder-button">
            Set Reminder
          </button>
          <button 
            onClick={handleExport} 
            className="export-button"
            disabled={exporting}
          >
            <Download size={20} />
            {exporting ? 'Exporting...' : 'Export Data'}
          </button>
        </div>
      </div>

      {summary && (
        <div className="stats-summary">
          <div className="stat-card">
            <div className="stat-icon">
              <BookOpen size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{summary.total_grammar_practiced}</div>
              <div className="stat-label">Grammar Points Studied</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon success">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{summary.mastered_grammar}</div>
              <div className="stat-label">Mastered (80%+)</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <MessageSquare size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{summary.total_dialogue_sessions}</div>
              <div className="stat-label">Dialogue Sessions</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon warning">
              <AlertCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{summary.total_mistakes}</div>
              <div className="stat-label">
                <Link to="/mistakes">Review Mistakes</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {weeklyStats && (
        <div className="weekly-chart">
          <h3>Weekly Activity</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyStats.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="grammar" fill="#2d5bff" name="Grammar Practice" />
                <Bar dataKey="dialogue" fill="#10b981" name="Dialogue Practice" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="weekly-summary">
            <div className="summary-item">
              <span>Total Grammar:</span>
              <strong>{weeklyStats.totalGrammar}</strong>
            </div>
            <div className="summary-item">
              <span>Total Dialogue:</span>
              <strong>{weeklyStats.totalDialogue}</strong>
            </div>
            <div className="summary-item">
              <span>Daily Average:</span>
              <strong>
                {Math.round((weeklyStats.totalGrammar + weeklyStats.totalDialogue) / 7)}
              </strong>
            </div>
          </div>
        </div>
      )}

      {summary && summary.mastery_rate > 0 && (
        <div className="mastery-section">
          <h3>Overall Mastery</h3>
          <div className="mastery-bar">
            <div 
              className="mastery-fill" 
              style={{ width: `${summary.mastery_rate}%` }}
            />
          </div>
          <p className="mastery-text">
            You've mastered {Math.round(summary.mastery_rate)}% of studied grammar points
          </p>
        </div>
      )}
    </div>
  );
};

export default StatsHome;