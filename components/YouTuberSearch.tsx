
import React, { useState } from 'react';
import { Search, Loader2, Eye, Calendar, Sparkles } from 'lucide-react';
import { searchYouTuberVideos } from '../services/geminiService';
import { SearchedVideo } from '../types';
import { imageUrlToBase64 } from '../utils';

interface YouTuberSearchProps {
  onSelectVideo: (base64: string, videoId: string) => void;
}

export const YouTuberSearch: React.FC<YouTuberSearchProps> = ({ onSelectVideo }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchedVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const videos = await searchYouTuberVideos(query);
      if (videos.length === 0) {
        setError("No videos found.");
      } else {
        setResults(videos);
      }
    } catch (err: any) {
      setError(err.message || "Failed to search.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (video: SearchedVideo) => {
    setProcessingId(video.id);
    try {
      const maxResUrl = `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`;
      let base64 = '';
      try {
         base64 = await imageUrlToBase64(maxResUrl);
      } catch (e) {
         const hqUrl = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
         base64 = await imageUrlToBase64(hqUrl);
      }
      onSelectVideo(base64, video.id);
    } catch (err) {
      setError("Could not load image. Security restrictions.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 text-gray-500 group-focus-within:text-brand-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2.5 border border-gray-700 rounded-xl bg-dark-900/50 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 text-sm transition-all"
              placeholder="Enter channel name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
        </div>
        <button
          type="submit"
          disabled={loading || !query}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Find'}
        </button>
      </form>

      {error && <div className="text-xs text-red-400 px-1">{error}</div>}

      {results.length > 0 && (
        <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent pb-2">
          {results.map((video) => (
            <div 
              key={video.id}
              onClick={() => handleSelect(video)}
              className="group relative aspect-video rounded-lg overflow-hidden cursor-pointer border border-gray-800/50 hover:border-brand-500/50 transition-all bg-black"
            >
              <img 
                src={video.thumbnailUrl} 
                alt={video.title} 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500"
              />
              
              {processingId === video.id && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 backdrop-blur-sm">
                  <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
                </div>
              )}

              {/* Hover Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                 <div className="bg-black/80 backdrop-blur-md rounded-md p-2 border border-white/10 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                     <p className="text-[10px] text-white font-medium line-clamp-1 mb-1.5">{video.title}</p>
                     <div className="flex items-center justify-between text-[9px] text-gray-400">
                        <span className="flex items-center gap-1"><Eye className="w-2.5 h-2.5" /> {video.views}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> {video.publishedTime}</span>
                     </div>
                 </div>
              </div>
              
              {/* Select Indicator */}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="bg-brand-500 rounded-full p-1 text-white shadow-lg shadow-brand-500/50">
                   <Sparkles className="w-3 h-3" />
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
