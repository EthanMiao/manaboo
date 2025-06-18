import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import GrammarList from './components/Grammar/GrammarList';
import GrammarDetail from './components/Grammar/GrammarDetail';
import GrammarPractice from './components/Grammar/GrammarPractice';
import DialogueHome from './components/Dialogue/DialogueHome';
import DialogueChat from './components/Dialogue/DialogueChat';
import StatsHome from './components/Stats/StatsHome';
import MistakeReview from './components/Stats/MistakeReview';
import './styles/App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<GrammarList />} />
          <Route path="/grammar" element={<GrammarList />} />
          <Route path="/grammar/:id" element={<GrammarDetail />} />
          <Route path="/grammar/:id/practice" element={<GrammarPractice />} />
          <Route path="/dialogue" element={<DialogueHome />} />
          <Route path="/dialogue/chat/:scenario" element={<DialogueChat />} />
          <Route path="/stats" element={<StatsHome />} />
          <Route path="/mistakes" element={<MistakeReview />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;