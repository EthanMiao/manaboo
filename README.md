# Manaboo - Japanese Learning Application

A comprehensive Japanese learning platform with AI-powered exercises and real-time conversation practice.

## Features

### 📘 Grammar Trainer
- Browse grammar points by JLPT level (N5-N1) and themes
- AI-generated practice exercises (multiple choice, fill-in-the-blank, sentence creation)
- Automatic answer checking with detailed explanations
- Proficiency tracking and personalized recommendations
- Mistake tracking and review system

### 🗣️ Dialogue Coach
- Real-world conversation scenarios (greetings, interviews, shopping, etc.)
- Interactive chat interface with AI responses
- Real-time grammar correction and suggestions
- Context-aware conversations with session memory
- Chinese explanations for better understanding

### 📊 Study Tracker
- Weekly activity charts and statistics
- Progress visualization with proficiency scores
- Mistake review with detailed explanations
- Study data export to Excel format
- Local study reminder settings

## Tech Stack

### Backend
- FastAPI (Python web framework)
- SQLAlchemy with SQLite database
- OpenAI GPT integration for AI features
- Async/await for performance
- Pydantic for data validation

### Frontend
- React 19 with TypeScript
- Vite for fast development
- React Router for navigation
- Recharts for data visualization
- Notion-style UI design

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 18+
- OpenAI API key

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create environment file:
```bash
cp .env.example .env
# Add your OpenAI API key to the .env file:
# OPENAI_API_KEY=your_api_key_here
```

5. Start the development server:
```bash
python run.py
```

The API will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Features & API Endpoints

### Grammar Trainer (A1-A8)
- Browse grammar points by JLPT level (N5-N1) and themes
- AI-generated exercises with detailed explanations
- Proficiency tracking and personalized recommendations
- Mistake review system

### Dialogue Coach (B1-B5)
- 8 conversation scenarios (greetings, interviews, shopping, etc.)
- Real-time AI conversation with context memory
- Grammar correction with Chinese explanations
- Session management and history

### Study Tracker (C1-C4)
- Weekly study statistics and visualizations
- Progress tracking with proficiency scores
- Data export to Excel format
- Mistake review with detailed analysis

## Architecture

### Backend (FastAPI + SQLAlchemy)
- **11 source files** with clean architecture
- **Async/await** patterns for optimal performance
- **OpenAI GPT-3.5-turbo** integration for AI features
- **SQLite database** with auto-initialization
- **Comprehensive API** with automatic documentation

### Frontend (React 19 + TypeScript)
- **16 source files** with full TypeScript coverage
- **Vite** for fast development and building
- **Notion-style UI** with responsive design
- **Recharts** for data visualization
- **Centralized API client** with type safety

## Development Notes

- The backend uses SQLite for easy setup and portability
- Grammar data is automatically initialized on first run
- All API endpoints support CORS for local development
- The frontend uses a responsive design that works on mobile devices
- Study progress is tracked per user (default user: "default_user")

## Future Enhancements

- User authentication and profiles
- Speech recognition for pronunciation practice
- More conversation scenarios
- Claude AI integration option
- Mobile app version
- Social features for competitive learning