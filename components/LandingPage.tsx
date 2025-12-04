

import React, { useState, useEffect } from 'react';
import { Link, ArrowRight, Sparkles, Video, PlayCircle, LogIn, Wand2, Zap, Github } from 'lucide-react';

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
              <div className="absolute right-2">
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
        {/* Feature Carousel */}
        <div className="w-full max-w-lg relative overflow-hidden">
          <FeatureCarousel />
        </div>

      </div>

      {/* Footer */}
      <div className="absolute bottom-6 flex items-center gap-4 text-xs text-gray-600">
        <span>Powered by Gemini Nano Banana Pro</span>
        <a
          href="https://github.com/SankaiAI/ai-viral-thumbnail-extractor"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-gray-500 hover:text-brand-400 transition-colors group"
          title="View source on GitHub"
        >
          <Github className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Open Source</span>
        </a>
      </div>
    </div >
  );
};

// Feature Carousel Component
const FeatureCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const features = [
    {
      title: "Capture the Vibe",
      description: "Don't start from scratch. Use any video as a style reference for your next masterpiece.",
      icon: PlayCircle,
      gradient: "from-purple-500/20 to-brand-500/20"
    },
    {
      title: "AI-Powered Magic",
      description: "Let AI understand your vision and generate stunning thumbnails that capture attention.",
      icon: Wand2,
      gradient: "from-brand-500/20 to-cyan-500/20"
    },
    {
      title: "Instant Results",
      description: "Generate professional-quality thumbnails in seconds. No design skills required.",
      icon: Zap,
      gradient: "from-yellow-500/20 to-orange-500/20"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length);
    }, 3000); // Auto-rotate every 3 seconds

    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="relative w-full h-32">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        const isActive = index === currentIndex;
        const isPrev = index === (currentIndex - 1 + features.length) % features.length;
        const isNext = index === (currentIndex + 1) % features.length;

        return (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-500 ease-in-out ${isActive
              ? 'opacity-100 translate-x-0 z-10'
              : isPrev
                ? 'opacity-0 -translate-x-full z-0'
                : isNext
                  ? 'opacity-0 translate-x-full z-0'
                  : 'opacity-0 translate-x-full z-0'
              }`}
          >
            <div className="bg-dark-900/50 backdrop-blur-md border border-gray-800 rounded-2xl p-6 flex items-center justify-between hover:border-brand-500/30 transition-colors cursor-default group h-full">
              <div className="space-y-1.5 text-left flex-1">
                <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
              <div className={`ml-4 w-16 h-16 rounded-full bg-gradient-to-tr ${feature.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500`}>
                <Icon className="w-8 h-8 text-gray-300 group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>
        );
      })}

      {/* Dots Indicator */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
        {features.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
              ? 'bg-brand-500 w-6'
              : 'bg-gray-700 hover:bg-gray-600'
              }`}
          />
        ))}
      </div>
    </div>
  );
};
