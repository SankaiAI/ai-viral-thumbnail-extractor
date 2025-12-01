
import React, { useState } from 'react';
import { Search, Loader2, PlayCircle, Eye, Calendar, TrendingUp } from 'lucide-react';
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
        setError("No videos found. Try a different channel name.");
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
      // Fetch high res for the actual usage
      const maxResUrl = `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`;
      
      let base64 = '';
      try {
         base64 = await imageUrlToBase64(maxResUrl);
      } catch (e) {
         // Fallback to lower res if maxres doesn't exist (common on older videos)
         const hqUrl = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
         base64 = await imageUrlToBase64(hqUrl);
      }
      
      onSelectVideo(base64, video.id);
    } catch (err) {
      console.error("Failed to load thumbnail image", err);
      setError("Could not load image data. Security restrictions may apply.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 border border-gray-700 rounded-lg leading-5 bg-dark-900 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-sm"
              placeholder="Enter YouTuber name (e.g. MrBeast)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
        </div>
        <button
          type="submit"
          disabled={loading || !query}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Find'}
        </button>
      </form>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {results.length > 0 && (
        <div className="grid grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-700">
          {results.map((video) => (
            <div 
              key={video.id}
              onClick={() => handleSelect(video)}
              className="group relative aspect-video rounded-lg overflow-hidden cursor-pointer border border-gray-800 hover:border-brand-500 transition-all"
            >
              {/* Thumbnail Image */}
              <img 
                src={video.thumbnailUrl} 
                alt={video.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Processing Spinner Overlay */}
              {processingId === video.id && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                  <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
                </div>
              )}

              {/* Hover Analytics Overlay */}
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-center items-center p-2 text-center z-10 backdrop-blur-sm">
                 <h4 className="text-xs text-white font-semibold line-clamp-2 mb-2">{video.title}</h4>
                 
                 <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] text-gray-300">
                    <div className="flex flex-col items-center">
                       <Eye className="w-3 h-3 text-brand-400 mb-0.5" />
                       <span>{video.views}</span>
                    </div>
                    <div className="flex flex-col items-center">
                       <Calendar className="w-3 h-3 text-brand-400 mb-0.5" />
                       <span>{video.publishedTime}</span>
                    </div>
                 </div>

                 <div className="mt-2 flex items-center gap-1 text-[10px] text-green-400 font-medium">
                    <TrendingUp className="w-3 h-3" />
                    <span>Viral Potential</span>
                 </div>
              </div>
              
              {/* Default Title bar (visible when not hovering) */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/70 to-transparent p-2 pt-6 group-hover:opacity-0 transition-opacity">
                <p className="text-[10px] text-white truncate">{video.title}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
