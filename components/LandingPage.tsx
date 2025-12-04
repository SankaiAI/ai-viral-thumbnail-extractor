
import React, { useState } from 'react';
import { Link, ArrowRight, Sparkles, Video, PlayCircle, LogIn } from 'lucide-react';

interface LandingPageProps {
  onUrlSubmit: (url: string) => void;
}

const LUCKY_URLS = [
  "https://www.youtube.com/watch?v=0e3GPea1Tyg", // MrBeast
  "https://www.youtube.com/watch?v=9bZkp7q19f0", // Gangnam Style
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Rick Roll
  "https://www.youtube.com/watch?v=jNQXAC9IVRw", // Me at the zoo
];

export const LandingPage: React.FC<LandingPageProps> = ({ onUrlSubmit }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (url.trim()) {
      onUrlSubmit(url);
    }
  };

  const handleLucky = () => {
    const randomUrl = LUCKY_URLS[Math.floor(Math.random() * LUCKY_URLS.length)];
    setUrl(randomUrl);
    onUrlSubmit(randomUrl);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center space-y-12 animate-in fade-in zoom-in-95 duration-500">

        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src="/logo.png" alt="ViralThumb AI Logo" className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            ViralThumb AI
          </h1>
          <p className="text-gray-400 text-lg max-w-lg mx-auto">
            Paste a link, extract the style, and generate viral-worthy thumbnails in seconds.
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full max-w-2xl">
          <form onSubmit={handleSubmit} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-500/20 to-purple-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-center bg-dark-800 border border-gray-700 rounded-2xl shadow-2xl transition-all focus-within:ring-2 focus-within:ring-brand-500/50 focus-within:border-brand-500">
              <div className="pl-5 text-gray-500">
                <Link className="w-5 h-5" />
              </div>
              <input
                type="text"
                className="w-full bg-transparent border-none py-5 pl-4 pr-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-0 text-base"
                placeholder="Paste Youtube URL link here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                autoFocus
              />
              <div className="absolute right-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLucky}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-brand-400 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  I'm feeling lucky
                </button>
                <button
                  type="submit"
                  disabled={!url.trim()}
                  className="p-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-500/20"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Feature Card */}
        <div className="w-full max-w-lg">
          <div className="bg-dark-900/50 backdrop-blur-md border border-gray-800 rounded-2xl p-6 flex items-center justify-between hover:border-brand-500/30 transition-colors cursor-default group">
            <div className="space-y-1.5 text-left">
              <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors">Capture the Vibe</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Don't start from scratch. Use any video as a style reference for your next masterpiece.
              </p>
            </div>
            <div className="ml-4 w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500/20 to-brand-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
              <PlayCircle className="w-8 h-8 text-gray-300 group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-xs text-gray-600">
        Powered by Gemini Nano Banana Pro
      </div>
    </div >
  );
};
