export enum AppFeature {
  DASHBOARD = 'DASHBOARD',
  CHAT = 'CHAT',
  API_HUB = 'API_HUB',
  IMAGE_EDITOR = 'IMAGE_EDITOR',
  KNOWLEDGE_BASE = 'KNOWLEDGE_BASE',
  LYRIC_ANIMATION = 'LYRIC_ANIMATION',
  PROJECT_HUB = 'PROJECT_HUB',
  SYSTEM_MONITOR = 'SYSTEM_MONITOR',
  WORD_EDITOR = 'WORD_EDITOR',
  SETTINGS = 'SETTINGS',
  GREY_MATTER = 'GREY_MATTER',
  ACADEMY = 'ACADEMY',
  AGENT_WORKBENCH = 'AGENT_WORKBENCH'
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: string;
  agentName?: string;
  schoolName?: string;
  collegeName?: string;
  idCardURL?: string;
  isTeacher?: boolean;
  teacherSubject?: string;
  teacherFee?: number;
  isOnline?: boolean;
  lastSeen?: any;
  createdAt?: any;
  updatedAt?: any;
  preferences?: {
    theme: 'light' | 'dark';
    speedMode: boolean;
    apiKey?: string;
  };
}

export interface ChatMessage {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  timestamp: any;
  roomId: string;
  hasAiResponded?: boolean;
  grounding?: any;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'archived' | 'completed';
  ownerId: string;
  createdAt: any;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  authorId: string;
  category: string;
  updatedAt: any;
}

export interface APIEndpoint {
  id: string;
  name: string;
  url: string;
  method: string;
  headers?: string;
  body?: string;
  ownerId: string;
}

export interface StudentNode {
  uid: string;
  name: string;
  expertise: string[];
  location: string;
  rank: 'PRODIGY' | 'SYNAPSE' | 'ELITE';
  projects: number;
  doubtsCleared: number;
}

export interface GreyMatterProject {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  description: string;
  tags: string[];
  likes: number;
  comments: number;
  featured: boolean;
  category?: string;
}

export interface NeuralDoubt {
  id: string;
  authorId: string;
  authorName: string;
  question: string;
  context: string;
  status: 'PENDING' | 'RESOLVED' | 'RESEARCH';
  timestamp: string;
}
