import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dialogueAPI, type Scenario } from '../../services/api';
import { MessageSquare, Users, ShoppingBag, Utensils, Building, Phone, MapPin, Briefcase } from 'lucide-react';
import './Dialogue.css';

const scenarioIcons: Record<string, React.ReactNode> = {
  greeting: <Users size={24} />,
  interview: <Briefcase size={24} />,
  shopping: <ShoppingBag size={24} />,
  restaurant: <Utensils size={24} />,
  hospital: <Building size={24} />,
  hotel: <Building size={24} />,
  direction: <MapPin size={24} />,
  phone: <Phone size={24} />,
};

const scenarioDescriptions: Record<string, string> = {
  greeting: 'Practice daily greetings and introductions',
  interview: 'Prepare for job interviews in Japanese',
  shopping: 'Learn shopping conversations and bargaining',
  restaurant: 'Order food and interact with staff',
  hospital: 'Communicate medical needs and symptoms',
  hotel: 'Book rooms and request services',
  direction: 'Ask for and give directions',
  phone: 'Make phone calls and appointments',
};

const DialogueHome: React.FC = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    setLoading(true);
    try {
      const data = await dialogueAPI.getScenarios();
      setScenarios(data);
    } catch (error) {
      console.error('Failed to load scenarios:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dialogue-home">
      <div className="page-header">
        <h2>Dialogue Coach</h2>
        <p>Practice real-world Japanese conversations with AI</p>
      </div>

      <div className="features-section">
        <div className="feature-item">
          <MessageSquare size={20} />
          <div>
            <h4>Interactive Conversations</h4>
            <p>Chat naturally with AI in various scenarios</p>
          </div>
        </div>
        <div className="feature-item">
          <Users size={20} />
          <div>
            <h4>Grammar Correction</h4>
            <p>Get instant feedback on your Japanese</p>
          </div>
        </div>
        <div className="feature-item">
          <Building size={20} />
          <div>
            <h4>Real-world Scenarios</h4>
            <p>Practice situations you'll actually encounter</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading scenarios...</div>
      ) : (
        <div className="scenarios-grid">
          {scenarios.map(scenario => (
            <Link
              key={scenario.id}
              to={`/dialogue/chat/${scenario.id}`}
              className="scenario-card"
            >
              <div className="scenario-icon">
                {scenarioIcons[scenario.id] || <MessageSquare size={24} />}
              </div>
              <h3>{scenario.name}</h3>
              <p>{scenarioDescriptions[scenario.id] || 'Practice conversation skills'}</p>
              <div className="start-chat">
                Start Conversation →
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default DialogueHome;