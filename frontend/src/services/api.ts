import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Grammar {
  id: string;
  level: string;
  title: string;
  structure: string;
  usage: string;
  examples: Array<{ ja: string; zh: string }>;
  themes: string[];
  proficiency: number;
}

export interface Exercise {
  id: string;
  type: string;
  question: string;
  options?: string[];
  correct_answer: string;
  explanation: string;
}

export interface ExerciseResult {
  result: 'correct' | 'incorrect';
  explanation: string;
  correct_answer: string;
  suggestion?: string;
}

export interface DialogueMessage {
  role: 'user' | 'assistant';
  text: string;
}

export interface Scenario {
  id: string;
  name: string;
}

export interface Correction {
  corrected: string;
  explanation: string;
  zh: string;
}

export interface MistakeDetail {
  id: number;
  grammarId: string;
  questionId: string;
  user_answer: string;
  correct_answer: string;
  explanation: string;
  timestamp: string;
}

export interface DailyStat {
  date: string;
  grammar: number;
  dialogue: number;
}

export interface WeeklyStats {
  dailyStats: DailyStat[];
  totalGrammar: number;
  totalDialogue: number;
}

export const grammarAPI = {
  list: async (level?: string, theme?: string) => {
    const params = new URLSearchParams();
    if (level) params.append('level', level);
    if (theme) params.append('theme', theme);
    const response = await api.get<Grammar[]>(`/grammar/list?${params}`);
    return response.data;
  },

  getDetail: async (id: string) => {
    const response = await api.get<Grammar>(`/grammar/${id}`);
    return response.data;
  },

  generateExercise: async (grammarId: string, type: string) => {
    const response = await api.post<Exercise[]>('/exercise/generate', {
      grammarId,
      type,
    });
    return response.data;
  },

  submitAnswer: async (grammarId: string, questionId: string, userAnswer: string) => {
    const response = await api.post<ExerciseResult>('/exercise/submit', {
      grammarId,
      questionId,
      userAnswer,
    });
    return response.data;
  },

  getMistakes: async () => {
    const response = await api.get<MistakeDetail[]>('/mistakes');
    return response.data;
  },

  getMistakeDetail: async (id: number) => {
    const response = await api.get<MistakeDetail>(`/mistakes/detail?id=${id}`);
    return response.data;
  },

  getProficiency: async (grammarId: string) => {
    const response = await api.get(`/proficiency/${grammarId}`);
    return response.data;
  },

  getRecommendations: async () => {
    const response = await api.get<string[]>('/recommendations/grammar');
    return response.data;
  },
};

export const dialogueAPI = {
  getScenarios: async () => {
    const response = await api.get<{ scenarios: Scenario[] }>('/scenarios');
    return response.data.scenarios;
  },

  sendMessage: async (scenarioId: string, message: string, sessionId?: string) => {
    const response = await api.post('/dialogue/send', {
      scenarioId,
      message,
      sessionId,
    });
    return response.data;
  },

  correctMessage: async (message: string) => {
    const response = await api.post<Correction>('/dialogue/correct', {
      message,
    });
    return response.data;
  },

  getHistory: async (sessionId: string) => {
    const response = await api.get(`/dialogue/history/${sessionId}`);
    return response.data;
  },
};

export const statsAPI = {
  getWeeklyStats: async () => {
    const response = await api.get<WeeklyStats>('/stats/weekly');
    return response.data;
  },

  exportData: async () => {
    const response = await api.get('/stats/export', {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'manaboo_study_data.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  getSummary: async () => {
    const response = await api.get('/stats/summary');
    return response.data;
  },
};

export default api;