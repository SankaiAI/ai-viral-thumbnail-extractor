
import React, { useRef, useState, useEffect } from 'react';
import { Upload, Youtube, Image as ImageIcon, X, Search, Link, CheckCircle2 } from 'lucide-react';
import { getYoutubeVideoId, imageUrlToBase64, fileToBase64 } from '../utils';
import { YouTuberSearch } from './YouTuberSearch';

interface InputPanelProps {
  onYoutubeThumbnailChange: (base64: string | null) => void;
  onProfileImageChange: (base64: string | null) => void;
  youtubeThumbnail: string | null;
  profileImage: string | null;
  initialUrl?: string;
  autoTrigger?: boolean;
}

type SourceTab = 'url' | 'search';

export const InputPanel: React.FC<InputPanelProps> = ({
  onYoutubeThumbnailChange,
  onProfileImageChange,
  youtubeThumbnail,
  profileImage,
  initialUrl,
  autoTrigger
}) => {
  const [activeTab, setActiveTab] = useState<SourceTab>('url');
  const [youtubeLink, setYoutubeLink] = useState(initialUrl || '');
  const [loadingYt, setLoadingYt] = useState(false);
  const [ytError, setYtError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleYoutubeExtract = async (urlOverride?: string) => {
    const urlToUse = urlOverride || youtubeLink;
    setYtError(null);
    const videoId = getYoutubeVideoId(urlToUse);
    if (!videoId) {
      setYtError("Invalid YouTube URL");
      return;
    }

    setLoadingYt(true);
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    
    try {
      const base64 = await imageUrlToBase64(thumbnailUrl);
      onYoutubeThumbnailChange(base64);
    } catch (err) {
      console.error(err);
       try {
        const hqUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        const base64 = await imageUrlToBase64(hqUrl);
        onYoutubeThumbnailChange(base64);
       } catch (e) {
         setYtError("Could not download thumbnail (CORS). Try another video.");
       }
    } finally {
      setLoadingYt(false);
    }
  };

  useEffect(() => {
    if (initialUrl && autoTrigger) {
      setYoutubeLink(initialUrl);
      handleYoutubeExtract(initialUrl);
    }
  }, []);

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
    <div className="flex flex-col gap-6 p-5 bg-dark-800/50 backdrop-blur-sm rounded-2xl border border-gray-800/60 shadow-xl">
      
      {/* Section 1: Style Source */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
           <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
             <Youtube className="w-4 h-4 text-red-500" />
             Style Reference
           </h3>
           {/* Segmented Control */}
           <div className="flex bg-dark-900/80 rounded-lg p-1 border border-gray-800">
             <button
               onClick={() => setActiveTab('url')}
               className={`px-3 py-1 text-[11px] font-medium rounded-md transition-all ${activeTab === 'url' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-300'}`}
             >
               Paste URL
             </button>
             <button
               onClick={() => setActiveTab('search')}
               className={`px-3 py-1 text-[11px] font-medium rounded-md transition-all ${activeTab === 'search' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-300'}`}
             >
               Search Channel
             </button>
           </div>
        </div>

        {/* Input Area */}
        <div className="min-h-[120px]">
          {activeTab === 'url' ? (
            <div className="space-y-3 pt-1">
              <div className="flex gap-2">
                <div className="relative flex-1 group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Link className="h-4 w-4 text-gray-500 group-focus-within:text-brand-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-9 pr-3 py-2.5 border border-gray-700 rounded-xl bg-dark-900/50 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 text-sm transition-all"
                    placeholder="https://youtube.com/watch?v=..."
                    value={youtubeLink}
                    onChange={(e) => setYoutubeLink(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => handleYoutubeExtract()}
                  disabled={loadingYt || !youtubeLink}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  {loadingYt ? '...' : 'Get'}
                </button>
              </div>
              {ytError && <p className="text-xs text-red-400 flex items-center gap-1"><X className="w-3 h-3"/> {ytError}</p>}
              <p className="text-[10px] text-gray-500 ml-1">Paste a video URL to extract its thumbnail style.</p>
            </div>
          ) : (
            <YouTuberSearch onSelectVideo={handleVideoSelect} />
          )}
        </div>
        
        {/* Selected Thumbnail Card */}
        {youtubeThumbnail && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-700/50 shadow-lg group animate-in fade-in slide-in-from-bottom-2 duration-300">
             <img 
               src={`data:image/jpeg;base64,${youtubeThumbnail}`} 
               alt="Extracted Thumbnail" 
               className="w-full h-full object-cover"
             />
             <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
             <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md border border-white/10 flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-green-400" />
                <span className="text-[10px] font-medium text-white">Style Active</span>
             </div>
             <button 
                onClick={() => {
                   onYoutubeThumbnailChange(null);
                   setYoutubeLink('');
                }}
                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500/90 backdrop-blur-md rounded-full text-white transition-all opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100"
             >
               <X className="w-3.5 h-3.5" />
             </button>
          </div>
        )}
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent"></div>

      {/* Section 2: User Subject */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-brand-400" />
          Subject Reference
        </h3>
        
        {!profileImage ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative border border-dashed border-gray-700 bg-dark-900/30 hover:bg-dark-900/60 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300"
          >
            <div className="w-10 h-10 bg-gray-800/50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-brand-500/10 transition-all">
                <Upload className="w-5 h-5 text-gray-400 group-hover:text-brand-500 transition-colors" />
            </div>
            <p className="text-xs font-medium text-gray-300">Upload your photo</p>
            <p className="text-[10px] text-gray-500 mt-1">PNG, JPG up to 5MB</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileUpload}
            />
          </div>
        ) : (
           <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-gray-700/50 shadow-lg group animate-in fade-in slide-in-from-bottom-2 duration-300">
             <img 
               src={`data:image/jpeg;base64,${profileImage}`} 
               alt="User Profile" 
               className="w-full h-full object-cover"
             />
             <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
             <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md border border-white/10 flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-brand-400" />
                <span className="text-[10px] font-medium text-white">Subject Active</span>
             </div>
             <button 
                onClick={() => onProfileImageChange(null)}
                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500/90 backdrop-blur-md rounded-full text-white transition-all opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100"
             >
               <X className="w-3.5 h-3.5" />
             </button>
          </div>
        )}
      </div>
    </div>
  );
};
