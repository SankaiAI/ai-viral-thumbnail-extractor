export enum AspectRatio {
  Landscape = '16:9',
  Portrait = '9:16',
  Square = '1:1'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // base64
  isError?: boolean;
}

export interface GenerationSettings {
  aspectRatio: AspectRatio;
  resolution: '1K' | '2K' | '4K';
}

export interface HistoryItem {
  id: string;
  image: string; // base64
  prompt: string;
  timestamp: number;
  settings: GenerationSettings;
}

export interface AppState {
  youtubeUrl: string;
  youtubeThumbnail: string | null; // base64
  profileImage: string | null; // base64
  generatedImage: string | null; // base64
  settings: GenerationSettings;
  isGenerating: boolean;
  messages: ChatMessage[];
  error: string | null;
  history: HistoryItem[];
}