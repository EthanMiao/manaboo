import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dialogueAPI, type DialogueMessage, type Correction } from '../../services/api';
import { ArrowLeft, Send, AlertCircle, CheckCircle } from 'lucide-react';
import './Dialogue.css';

interface Message extends DialogueMessage {
  correction?: Correction;
}

const DialogueChat: React.FC = () => {
  const { scenario } = useParams<{ scenario: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sessionId, setSessionId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showCorrections, setShowCorrections] = useState(true);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      text: inputText,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await dialogueAPI.sendMessage(scenario!, inputText, sessionId);
      
      if (!sessionId) {
        setSessionId(response.sessionId);
      }

      const updatedMessages = [...messages, userMessage];
      
      if (response.correction && showCorrections) {
        updatedMessages[updatedMessages.length - 1].correction = response.correction;
      }

      const aiMessage: Message = {
        role: 'assistant',
        text: response.reply,
      };
      
      setMessages([...updatedMessages, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scenarioNames: Record<string, string> = {
    greeting: '打招呼',
    interview: '面试',
    shopping: '购物',
    restaurant: '餐厅',
    hospital: '看病',
    hotel: '酒店',
    direction: '问路',
    phone: '电话',
  };

  return (
    <div className="dialogue-chat">
      <div className="chat-header">
        <button onClick={() => navigate('/dialogue')} className="back-button">
          <ArrowLeft size={20} />
          Back to scenarios
        </button>
        <h2>{scenarioNames[scenario!] || 'Conversation'}</h2>
        <label className="correction-toggle">
          <input
            type="checkbox"
            checked={showCorrections}
            onChange={(e) => setShowCorrections(e.target.checked)}
          />
          Show corrections
        </label>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-welcome">
            <p>Start your conversation! Try greeting in Japanese.</p>
            <p className="hint">For example: こんにちは</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-content">
              {message.text}
            </div>
            
            {message.correction && showCorrections && (
              <div className="correction-box">
                <div className="correction-header">
                  {message.correction.corrected === message.text ? (
                    <>
                      <CheckCircle size={16} />
                      <span>Great! Your Japanese is natural.</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={16} />
                      <span>Suggestion</span>
                    </>
                  )}
                </div>
                
                {message.correction.corrected !== message.text && (
                  <>
                    <div className="correction-item">
                      <strong>Better:</strong> {message.correction.corrected}
                    </div>
                    <div className="correction-item">
                      <strong>Why:</strong> {message.correction.explanation}
                    </div>
                  </>
                )}
                
                <div className="correction-item">
                  <strong>Meaning:</strong> {message.correction.zh}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="message assistant">
            <div className="message-content typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <textarea
          className="chat-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message in Japanese..."
          disabled={loading}
          rows={1}
        />
        <button 
          onClick={sendMessage} 
          className="send-button"
          disabled={!inputText.trim() || loading}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default DialogueChat;