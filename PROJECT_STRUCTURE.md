# Manaboo Project Structure

## Overview
This document outlines the complete directory structure of the Manaboo Japanese Learning Application.

## Directory Tree

```
Manaboo/
├── README.md                    # Project documentation
├── PROJECT_STRUCTURE.md         # This file - project structure documentation
├── .gitignore                   # Git ignore rules
│
├── backend/                     # Backend FastAPI application
│   ├── .gitignore              # Backend-specific git ignore rules
│   ├── .env.example            # Environment variables template
│   ├── requirements.txt        # Python dependencies
│   ├── run.py                  # Application startup script
│   ├── venv/                   # Virtual environment (git-ignored)
│   │
│   ├── app/                    # Main application directory
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI application instance
│   │   ├── database.py        # Database configuration and models
│   │   ├── models.py          # Pydantic models for request/response
│   │   │
│   │   ├── routers/           # API route handlers
│   │   │   ├── __init__.py
│   │   │   ├── grammar.py     # Grammar trainer endpoints (A1-A8)
│   │   │   ├── dialogue.py    # Dialogue coach endpoints (B1-B5)
│   │   │   └── stats.py       # Study tracker endpoints (C1-C4)
│   │   │
│   │   ├── services/          # Business logic and external services
│   │   │   ├── __init__.py
│   │   │   └── openai_service.py  # OpenAI GPT integration
│   │   │
│   │   └── utils/             # Utility functions and helpers
│   │       ├── __init__.py
│   │       └── grammar_data.py    # Initial grammar data for database
│   │
│   └── data/                   # SQLite database storage
│       └── manaboo.db         # Database file (created on first run)
│
└── frontend/                   # Frontend React application
    ├── package.json           # NPM dependencies and scripts
    ├── package-lock.json      # Locked dependency versions
    ├── index.html             # HTML entry point
    ├── vite.config.ts         # Vite bundler configuration
    ├── tsconfig.json          # TypeScript configuration
    ├── tsconfig.app.json      # App-specific TypeScript config
    ├── tsconfig.node.json     # Node.js TypeScript config
    ├── eslint.config.js       # ESLint configuration
    ├── dist/                  # Build output (git-ignored)
    ├── node_modules/          # NPM packages (git-ignored)
    │
    └── src/                   # Source code directory
        ├── App.tsx            # Main application component
        ├── main.tsx           # Application entry point
        ├── index.css          # Global styles
        ├── vite-env.d.ts      # Vite TypeScript definitions
        │
        ├── components/        # React components
        │   ├── Grammar/       # Grammar trainer components
        │   │   ├── Grammar.css
        │   │   ├── GrammarList.tsx      # Grammar points browser
        │   │   ├── GrammarDetail.tsx    # Grammar point details
        │   │   └── GrammarPractice.tsx  # Practice exercises
        │   │
        │   ├── Dialogue/      # Dialogue coach components
        │   │   ├── Dialogue.css
        │   │   ├── DialogueHome.tsx     # Scenario selection
        │   │   └── DialogueChat.tsx     # Chat interface
        │   │
        │   ├── Stats/         # Study tracker components
        │   │   ├── Stats.css
        │   │   ├── StatsHome.tsx        # Statistics dashboard
        │   │   └── MistakeReview.tsx    # Mistake review interface
        │   │
        │   └── Layout/        # Layout components
        │       ├── Layout.css
        │       └── Layout.tsx           # Main app layout with sidebar
        │
        ├── services/          # API integration layer
        │   └── api.ts         # Axios API client and type definitions
        │
        └── styles/            # Additional style files
            └── App.css        # Main application styles
```

## Key Files Description

### Backend

- **main.py**: FastAPI application setup with CORS, routers, and startup events
- **database.py**: SQLAlchemy models for Grammar, Exercise, Mistake, UserProficiency, DialogueSession, StudyStats
- **models.py**: Pydantic models for API request/response validation
- **grammar.py**: Implements grammar browsing, exercise generation, answer checking, proficiency tracking
- **dialogue.py**: Handles conversation scenarios, message exchange, and grammar correction
- **stats.py**: Provides weekly statistics, data export, and study summaries
- **openai_service.py**: Integrates with OpenAI GPT for AI-powered features

### Frontend

- **App.tsx**: Main router setup with all application routes
- **Layout.tsx**: Notion-style sidebar navigation
- **api.ts**: Centralized API client with TypeScript interfaces
- **GrammarList.tsx**: Browse and filter grammar points by level/theme
- **GrammarPractice.tsx**: Interactive exercise interface with AI feedback
- **DialogueChat.tsx**: Real-time chat with grammar corrections
- **StatsHome.tsx**: Charts and progress visualization using Recharts
- **MistakeReview.tsx**: Review and practice mistaken grammar points

## Development Workflow

1. **Backend**: Run from `/backend` directory with `python run.py`
2. **Frontend**: Run from `/frontend` directory with `npm run dev`
3. **Database**: Auto-created in `/backend/data/` on first run
4. **API Docs**: Available at `http://localhost:8000/docs` when backend is running

## Environment Setup

- Backend requires `.env` file with `OPENAI_API_KEY`
- Frontend connects to backend at `http://localhost:8000`
- Database uses SQLite for easy development setup

## File Count Summary

### Backend
- **Total Files**: 11 source files
- **Core Files**: 4 (main.py, database.py, models.py, run.py)
- **API Routes**: 3 (grammar.py, dialogue.py, stats.py)
- **Services**: 1 (openai_service.py)
- **Utils**: 1 (grammar_data.py)
- **Config**: 2 (.env.example, requirements.txt)

### Frontend
- **Total Files**: 16 source files
- **Core Files**: 3 (App.tsx, main.tsx, index.css)
- **Components**: 8 (across 4 modules)
- **Services**: 1 (api.ts)
- **Styles**: 4 (global + component styles)
- **Config**: 5 (package.json, tsconfig files, eslint, vite)

## Code Quality Features

- **TypeScript**: Full type safety in frontend
- **ESLint**: Code quality enforcement
- **Async/Await**: Modern asynchronous patterns
- **Component Architecture**: Modular React design
- **API Validation**: Pydantic models for backend
- **Error Handling**: Comprehensive error management
- **Responsive Design**: Mobile-friendly UI

## Clean Architecture Notes

- **No Template Files**: All Vite/React boilerplate removed
- **Organized by Feature**: Components grouped by functionality
- **Single Responsibility**: Each file has clear purpose
- **Consistent Naming**: Follows established conventions
- **No Dead Code**: All files actively used in application