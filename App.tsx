import React, { useState, useEffect } from 'react';
import { InputPanel } from './components/InputPanel';
import { ChatPanel } from './components/ChatPanel';
import { LandingPage } from './components/LandingPage';
import { generateViralCover } from './services/geminiService';
import { AppState, AspectRatio, ChatMessage, HistoryItem } from './types';
import { Download, Monitor, Smartphone, Maximize2, Image as ImageIcon, Key, Loader2, Clock, Sparkles, Zap, Gift, LogOut, User as UserIcon, AlertCircle } from 'lucide-react';
import { cleanBase64 } from './utils';
import { useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { ReferralModal } from './components/ReferralModal';
import { GuestLimitModal } from './components/GuestLimitModal';

const DEFAULT_PROMPT = "Create a viral YouTube thumbnail based on the provided style and subject.";

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [landingUrl, setLandingUrl] = useState(() => {
    // Restore URL from localStorage if it exists
    return localStorage.getItem('landingUrl') || '';
  });
  const [guestUsageCount, setGuestUsageCount] = useState(() => {
    return parseInt(localStorage.getItem('guestUsageCount') || '0');
  });
  const [showGuestLimitModal, setShowGuestLimitModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const { user, profile, loading: authLoading, signOut, consumeCredit } = useAuth();

  const [state, setState] = useState<AppState>({
    youtubeUrl: '',
    youtubeThumbnail: null,
    profileImage: null,
    generatedImages: {},
    settings: {
      aspectRatio: AspectRatio.Landscape,
      resolution: '1K',
    },
    isGenerating: false,
    messages: [],
    error: null,
    history: [],
  });



  // Capture referral code from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      localStorage.setItem('referralCode', refCode);
    }
  }, []);

  // Auto-hide landing page if URL exists (after OAuth redirect)
  React.useEffect(() => {
    const savedUrl = localStorage.getItem('landingUrl');
    if (savedUrl && user) {
      setShowLanding(false);
    }
  }, [user]);



  const handleLandingSubmit = (url: string) => {
    setLandingUrl(url);
    localStorage.setItem('landingUrl', url); // Persist URL
    setShowLanding(false);
  };

  const handleYoutubeChange = (base64: string | null) => {
    setState(prev => ({ ...prev, youtubeThumbnail: base64 }));
  };

  const handleProfileChange = (base64: string | null) => {
    setState(prev => ({ ...prev, profileImage: base64 }));
  };

  const handleSettingsChange = (key: keyof AppState['settings'], value: any) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, [key]: value }
    }));
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setState(prev => ({
      ...prev,
      generatedImages: {
        ...prev.generatedImages,
        [item.settings.aspectRatio]: item.image
      },
      settings: item.settings
    }));
  };

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Immediately add user message to UI for instant feedback
    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newUserMsg],
      isGenerating: true,
      error: null,
    }));

    // Check guest limits or consume credits
    if (!user) {
      if (guestUsageCount >= 3) {
        setState(prev => ({ ...prev, isGenerating: false }));
        setShowGuestLimitModal(true);
        return;
      }
      const newCount = guestUsageCount + 1;
      setGuestUsageCount(newCount);
      localStorage.setItem('guestUsageCount', newCount.toString());
    } else {
      if (profile && profile.credits <= 0) {
        setState(prev => ({ ...prev, isGenerating: false }));
        setShowReferralModal(true);
        return;
      }

      // Deduct credit
      const success = await consumeCredit();
      if (!success) {
        setState(prev => ({ ...prev, isGenerating: false }));
        setShowReferralModal(true);
        return;
      }
    }

    const referenceImages = [];
    if (state.youtubeThumbnail) {
      referenceImages.push({
        data: cleanBase64(state.youtubeThumbnail),
        mimeType: 'image/jpeg'
      });
    }
    if (state.profileImage) {
      referenceImages.push({
        data: cleanBase64(state.profileImage),
        mimeType: 'image/jpeg'
      });
    }

    try {
      const generatedBase64 = await generateViralCover(
        text,
        referenceImages,
        state.settings.aspectRatio,
        state.settings.resolution
      );

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Here is your new viral cover design!",
      };

      const newHistoryItem: HistoryItem = {
        id: Date.now().toString() + Math.random().toString(),
        image: generatedBase64,
        prompt: text,
        timestamp: Date.now(),
        settings: { ...state.settings }
      };

      setState(prev => ({
        ...prev,
        isGenerating: false,
        generatedImages: {
          ...prev.generatedImages,
          [prev.settings.aspectRatio]: generatedBase64
        },
        messages: [...prev.messages, aiMsg],
        history: [newHistoryItem, ...prev.history]
      }));
    } catch (error: any) {
      console.error("Generation Error:", error);

      const errorMessage = error.message || JSON.stringify(error);

      if (
        errorMessage.includes("403") ||
        errorMessage.includes("PERMISSION_DENIED") ||
        errorMessage.includes("Requested entity was not found")
      ) {

        setState(prev => ({
          ...prev,
          isGenerating: false,
          error: "Authentication failed. Please select a valid API Key.",
          messages: []
        }));
        return;
      }

      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: `Error: ${errorMessage}`,
        isError: true,
      };
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: errorMessage,
        messages: [...prev.messages, errorMsg]
      }));
    }
  };

  const handleInitialGenerate = () => {
    if (!state.youtubeThumbnail && !state.profileImage) return;
    // if (!user) {
    //   setShowAuthModal(true);
    //   return;
    // }
    handleSendMessage(DEFAULT_PROMPT);
  };

  const handleDownload = () => {
    const currentImage = state.generatedImages[state.settings.aspectRatio];
    if (!currentImage) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${currentImage}`;
    link.download = `viral-cover-${state.settings.aspectRatio}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  if (showLanding) {
    return (
      <>
        <LandingPage onUrlSubmit={handleLandingSubmit} />
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
        <ReferralModal isOpen={showReferralModal} onClose={() => setShowReferralModal(false)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-brand-500/30 selection:text-brand-200">
      {/* Guest Limit Banner */}
      {!user && (
        <div className="bg-gradient-to-r from-purple-900/50 to-brand-900/50 border-b border-white/5 px-4 py-2 text-center text-xs font-medium text-gray-300">
          <div className="flex items-center justify-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-brand-400" />
            <span>
              Free Guest Mode: <span className="text-white">{3 - guestUsageCount} generations remaining</span>.
              <button onClick={() => setShowAuthModal(true)} className="ml-2 text-brand-400 hover:text-brand-300 underline">Sign in</button> to save images & get 20 free credits!
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src="/logo.png" alt="ViralThumb AI Logo" className="w-8 h-8" />
            <h1 className="hidden sm:block text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">ViralThumb AI</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 text-xs font-medium text-gray-500">
            {user ? (
              <>
                <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 bg-brand-500/10 rounded-full border border-brand-500/20 text-brand-400">
                  <Zap className="w-3.5 h-3.5" />
                  <span className="font-bold text-xs sm:text-sm">{profile?.credits ?? 0} Credits</span>
                </div>
                <button
                  onClick={() => setShowReferralModal(true)}
                  className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full hover:shadow-lg hover:shadow-orange-500/20 transition-all"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span className="text-xs sm:text-sm">Get Credits</span>
                </button>
                <div className="hidden sm:block h-4 w-px bg-gray-800" />

                {/* Desktop: Show both profile and logout */}
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile: Profile icon with dropdown */}
                <div className="sm:hidden relative">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700 hover:border-brand-500 transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-gray-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {showProfileDropdown && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowProfileDropdown(false)}
                      />

                      {/* Menu */}
                      <div className="absolute right-0 top-full mt-2 w-72 bg-dark-800 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                        {/* History Section */}
                        {state.history.length > 0 && (
                          <div className="p-3 border-b border-gray-700">
                            <h3 className="text-xs font-semibold text-gray-400 mb-2">Recent Images</h3>
                            <div className="grid grid-cols-3 gap-2">
                              {state.history.slice(0, 6).map((item) => (
                                <button
                                  key={item.id}
                                  onClick={() => {
                                    handleHistorySelect(item);
                                    setShowProfileDropdown(false);
                                  }}
                                  className="aspect-video rounded-lg overflow-hidden border border-gray-700 hover:border-brand-500 transition-colors"
                                >
                                  <img
                                    src={`data:image/png;base64,${item.image}`}
                                    alt="History"
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Logout Button */}
                        <button
                          onClick={() => {
                            signOut();
                            setShowProfileDropdown(false);
                          }}
                          className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-700/50 transition-colors text-gray-300"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm font-medium">Sign Out</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-1.5 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-colors text-sm"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main 3-Column Layout */}
      <main className="max-w-[1920px] mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:h-[calc(100vh-3.5rem)]">

        {/* Left Column: Inputs (3 cols) */}
        <div className="lg:col-span-3 flex flex-col lg:h-full overflow-y-auto scrollbar-none gap-4">
          <InputPanel
            onYoutubeThumbnailChange={handleYoutubeChange}
            onProfileImageChange={handleProfileChange}
            youtubeThumbnail={state.youtubeThumbnail}
            profileImage={state.profileImage}
            initialUrl={landingUrl}
            autoTrigger={!!landingUrl}
          />
        </div>

        {/* Center Column: Preview & History (6 cols) */}
        <div className="lg:col-span-6 flex flex-col min-h-[500px] lg:h-full lg:min-h-0 bg-dark-800/30 rounded-2xl border border-gray-800/50 relative overflow-hidden shadow-2xl">

          {/* Top Toolbar */}
          <div className="relative lg:absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent lg:pointer-events-none">
            {/* Aspect Ratio Controls - Re-enable pointer events */}
            <div className="lg:pointer-events-auto bg-black/60 backdrop-blur-md rounded-lg p-1 border border-white/10 flex gap-1">
              {[
                { r: AspectRatio.Landscape, icon: Monitor, label: '16:9' },
                { r: AspectRatio.Portrait, icon: Smartphone, label: '9:16' },
                { r: AspectRatio.Square, icon: ImageIcon, label: '1:1' }
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => handleSettingsChange('aspectRatio', opt.r)}
                  className={`p-1.5 px-3 rounded-md flex items-center gap-2 text-xs font-medium transition-all ${state.settings.aspectRatio === opt.r ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <opt.icon className="w-3.5 h-3.5" />
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="lg:pointer-events-auto flex items-center gap-3">
              {state.generatedImage && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-1.5 bg-gray-800/80 hover:bg-gray-700 backdrop-blur-md border border-white/10 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Save
                </button>
              )}

              {!state.isGenerating && (
                <button
                  onClick={handleInitialGenerate}
                  disabled={(!state.youtubeThumbnail && !state.profileImage)}
                  className="flex items-center gap-2 px-5 py-1.5 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate
                </button>
              )}
            </div>
          </div>

          {/* Main Canvas */}
          <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden min-h-[300px]">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:16px_16px] opacity-50 pointer-events-none"></div>

            {!state.generatedImages[state.settings.aspectRatio] && !state.isGenerating && (
              <div className="text-center space-y-4 max-w-sm relative z-10 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-dark-900/50 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto border border-white/5 shadow-2xl">
                  <ImageIcon className="w-10 h-10 text-gray-700" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-200">Canvas Ready</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Select your source material on the left and hit generate to create stunning visuals.
                  </p>
                </div>
              </div>
            )}

            {state.isGenerating && (
              <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-brand-500 animate-pulse" />
                  </div>
                </div>
                <p className="mt-6 text-brand-400 font-medium animate-pulse tracking-wide text-sm">DESIGNING...</p>
              </div>
            )}

            {state.generatedImages[state.settings.aspectRatio] && (
              <div className={`relative shadow-2xl shadow-black/50 rounded-lg overflow-hidden transition-all duration-700 ease-out z-10 border border-gray-800 ${state.isGenerating ? 'opacity-50 blur-sm scale-95' : 'opacity-100 scale-100'}`}
                style={{
                  aspectRatio: state.settings.aspectRatio === AspectRatio.Landscape ? '16/9' : state.settings.aspectRatio === AspectRatio.Portrait ? '9/16' : '1/1',
                  maxHeight: '85%',
                  maxWidth: '100%'
                }}
              >
                <img
                  src={`data:image/png;base64,${state.generatedImages[state.settings.aspectRatio]}`}
                  alt="Generated Viral Cover"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* History Strip */}
          {state.history.length > 0 && (
            <div className="h-28 bg-[#0F0F0F] border-t border-gray-800 flex flex-col justify-center px-4 relative z-20">
              <div className="flex gap-3 overflow-x-auto pb-2 pt-2 scrollbar-thin scrollbar-thumb-gray-800 items-center">
                {state.history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleHistorySelect(item)}
                    className={`relative flex-shrink-0 h-16 aspect-video rounded-md overflow-hidden border transition-all group ${state.generatedImage === item.image
                      ? 'border-brand-500 ring-2 ring-brand-500/20 scale-105'
                      : 'border-gray-800 hover:border-gray-600 opacity-60 hover:opacity-100'
                      }`}
                  >
                    <img
                      src={`data:image/png;base64,${item.image}`}
                      alt="History item"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Chat (3 cols) */}
        <div className="lg:col-span-3 flex flex-col min-h-[400px] lg:h-full lg:min-h-0">
          <ChatPanel
            messages={state.messages}
            onSendMessage={handleSendMessage}
            isGenerating={state.isGenerating}
          />
        </div>
      </main>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      <ReferralModal isOpen={showReferralModal} onClose={() => setShowReferralModal(false)} />
      <GuestLimitModal
        isOpen={showGuestLimitModal}
        onClose={() => setShowGuestLimitModal(false)}
        onSignIn={() => {
          setShowGuestLimitModal(false);
          setShowAuthModal(true);
        }}
      />
    </div>
  );
}
