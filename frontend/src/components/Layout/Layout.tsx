import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, MessageSquare, BarChart3, AlertCircle } from 'lucide-react';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo">
          <h1>Manaboo</h1>
          <span className="tagline">Japanese Learning</span>
        </div>

        <nav className="nav">
          <Link 
            to="/grammar" 
            className={`nav-item ${isActive('/grammar') || location.pathname === '/' ? 'active' : ''}`}
          >
            <BookOpen size={20} />
            <span>Grammar Trainer</span>
          </Link>

          <Link 
            to="/dialogue" 
            className={`nav-item ${isActive('/dialogue') ? 'active' : ''}`}
          >
            <MessageSquare size={20} />
            <span>Dialogue Coach</span>
          </Link>

          <Link 
            to="/stats" 
            className={`nav-item ${isActive('/stats') ? 'active' : ''}`}
          >
            <BarChart3 size={20} />
            <span>Study Tracker</span>
          </Link>

          <Link 
            to="/mistakes" 
            className={`nav-item ${isActive('/mistakes') ? 'active' : ''}`}
          >
            <AlertCircle size={20} />
            <span>Mistake Review</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="study-reminder">
            <button className="reminder-btn">Set Study Reminder</button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;