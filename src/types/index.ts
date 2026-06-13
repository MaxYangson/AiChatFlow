export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface Settings {
  apiKey: string;
  apiBaseUrl: string;
  model: string;
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
}

export interface ChatRequest {
  messages: Array<{ role: string; content: string }>;
  model: string;
  stream: boolean;
}
