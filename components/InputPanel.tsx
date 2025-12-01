
import React, { useRef, useState } from 'react';
import { Upload, Youtube, Image as ImageIcon, X, Search, Link } from 'lucide-react';
import { getYoutubeVideoId, imageUrlToBase64, fileToBase64 } from '../utils';
import { YouTuberSearch } from './YouTuberSearch';

interface InputPanelProps {
  onYoutubeThumbnailChange: (base64: string | null) => void;
  onProfileImageChange: (base64: string | null) => void;
  youtubeThumbnail: string | null;
  profileImage: string | null;
}

type SourceTab = 'url' | 'search';

export const InputPanel: React.FC<InputPanelProps> = ({
  onYoutubeThumbnailChange,
  onProfileImageChange,
  youtubeThumbnail,
  profileImage
}) => {
  const [activeTab, setActiveTab] = useState<SourceTab>('url');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [loadingYt, setLoadingYt] = useState(false);
  const [ytError, setYtError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleYoutubeExtract = async () => {
    setYtError(null);
    const videoId = getYoutubeVideoId(youtubeLink);
    if (!videoId) {
      setYtError("Invalid YouTube URL");
      return;
    }

    setLoadingYt(true);
    // Try max resolution first, fallbacks handled by logic if needed, but for simplicity
    // we assume maxresdefault exists for viral videos.
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    
    try {
      // We need to fetch it to get base64 for Gemini
      // Note: YouTube images usually allow CORS.
      const base64 = await imageUrlToBase64(thumbnailUrl);
      onYoutubeThumbnailChange(base64);
    } catch (err) {
      console.error(err);
      // Fallback: If fetch fails due to strict CORS or other issues,
      // we might just show an error or ask user to upload manually.
      // Trying hqdefault as backup
       try {
        const hqUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        const base64 = await imageUrlToBase64(hqUrl);
        onYoutubeThumbnailChange(base64);
       } catch (e) {
         setYtError("Could not download thumbnail (CORS restricted). Please save and upload manually.");
       }
    } finally {
      setLoadingYt(false);
    }
  };

  const handleVideoSelect = (base64: string, videoId: string) => {
    onYoutubeThumbnailChange(base64);
    setYoutubeLink(`https://www.youtube.com/watch?v=${videoId}`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const base64 = await fileToBase64(file);
        onProfileImageChange(base64);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-dark-800 rounded-xl border border-gray-800 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-brand-500" />
        Source Materials
      </h2>

      {/* YouTube Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
           <label className="text-sm font-medium text-gray-400">1. Extract Style (YouTube)</label>
           
           {/* Tab Switcher */}
           <div className="flex bg-dark-900 rounded-lg p-0.5 border border-gray-700">
             <button
               onClick={() => setActiveTab('url')}
               className={`px-3 py-1 text-xs rounded-md transition-all ${activeTab === 'url' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
             >
               Paste URL
             </button>
             <button
               onClick={() => setActiveTab('search')}
               className={`px-3 py-1 text-xs rounded-md transition-all ${activeTab === 'search' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
             >
               Search Creator
             </button>
           </div>
        </div>

        {activeTab === 'url' ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Link className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-9 pr-3 py-2 border border-gray-700 rounded-lg leading-5 bg-dark-900 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-sm"
                  placeholder="Paste YouTube URL..."
                  value={youtubeLink}
                  onChange={(e) => setYoutubeLink(e.target.value)}
                />
              </div>
              <button
                onClick={handleYoutubeExtract}
                disabled={loadingYt || !youtubeLink}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {loadingYt ? '...' : 'Extract'}
              </button>
            </div>
            {ytError && <p className="text-xs text-red-400">{ytError}</p>}
          </div>
        ) : (
          <YouTuberSearch onSelectVideo={handleVideoSelect} />
        )}
        
        {youtubeThumbnail && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-700 group mt-2">
             <img 
               src={`data:image/jpeg;base64,${youtubeThumbnail}`} 
               alt="Extracted Thumbnail" 
               className="w-full h-full object-cover"
             />
             <button 
                onClick={() => {
                   onYoutubeThumbnailChange(null);
                   setYoutubeLink('');
                }}
                className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-red-500 rounded-full text-white transition-colors"
             >
               <X className="w-4 h-4" />
             </button>
             <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 text-xs text-center text-gray-200">
                Style Reference
             </div>
          </div>
        )}
      </div>

      <div className="h-px bg-gray-800 my-2"></div>

      {/* Profile Image Section */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-400">2. Upload Your Photo</label>
        
        {!profileImage ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 hover:bg-dark-900 transition-colors group"
          >
            <Upload className="w-8 h-8 text-gray-500 group-hover:text-brand-500 mb-2 transition-colors" />
            <p className="text-xs text-gray-400 text-center">Click to upload your profile image</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileUpload}
            />
          </div>
        ) : (
           <div className="relative w-full aspect-square md:aspect-[4/3] rounded-lg overflow-hidden border border-gray-700">
             <img 
               src={`data:image/jpeg;base64,${profileImage}`} 
               alt="User Profile" 
               className="w-full h-full object-cover"
             />
             <button 
                onClick={() => onProfileImageChange(null)}
                className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-red-500 rounded-full text-white transition-colors"
             >
               <X className="w-4 h-4" />
             </button>
             <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 text-xs text-center text-gray-200">
                Subject Reference
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
