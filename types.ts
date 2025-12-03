
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

export interface SearchedVideo {
  id: string;
  title: string;
  views: string;
  publishedTime: string;
  thumbnailUrl: string;
}

export type YouTubeSortOption = 'relevance' | 'date' | 'viewCount' | 'rating';

export interface YouTubeSearchResponse {
  videos: SearchedVideo[];
  nextPageToken?: string;
}


export interface ImageCache {
  [AspectRatio.Landscape]?: string; // base64
  [AspectRatio.Portrait]?: string; // base64
  [AspectRatio.Square]?: string; // base64
}


export interface UserProfile {
  id: string;
  email?: string;
  credits: number;
  referral_code: string;
  referred_by?: string;
}

export interface AppState {
  youtubeUrl: string;
  youtubeThumbnail: string | null; // base64
  profileImage: string | null; // base64
  generatedImages: ImageCache; // Changed from single image to cache
  settings: GenerationSettings;
  isGenerating: boolean;
  messages: ChatMessage[];
  error: string | null;
  history: HistoryItem[];
  user?: UserProfile | null; // Added user to state
}

