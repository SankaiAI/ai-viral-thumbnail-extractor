import React, { useState, useEffect } from 'react';
import { InputPanel } from './components/InputPanel';
import { ChatPanel } from './components/ChatPanel';
import { generateViralCover } from './services/geminiService';
import { AppState, AspectRatio, ChatMessage, HistoryItem } from './types';
import { Download, Monitor, Smartphone, Maximize2, Image as ImageIcon, Key, Loader2, Clock } from 'lucide-react';
import { cleanBase64 } from './utils';

const DEFAULT_PROMPT = "Create a viral YouTube thumbnail based on the provided style and subject.";

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}

export default function App() {
  const [hasKey, setHasKey] = useState(false);
  const [checkingKey, setCheckingKey] = useState(true);

  const [state, setState] = useState<AppState>({
    youtubeUrl: '',
    youtubeThumbnail: null,
    profileImage: null,
    generatedImage: null,
    settings: {
      aspectRatio: AspectRatio.Landscape,
      resolution: '1K',
    },
    isGenerating: false,
    messages: [],
    error: null,
    history: [],
  });

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio) {
        const has = await window.aistudio.hasSelectedApiKey();
        setHasKey(has);
      }
      setCheckingKey(false);
    };
    checkApiKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Race condition mitigation: assume success after the dialog interaction
      setHasKey(true);
    }
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
      generatedImage: item.image,
      settings: item.settings
    }));
  };

  const handleSendMessage = async (text: string) => {
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
      // Re-instantiate service logic here is handled by the service creating a new GoogleGenAI instance each call
      // which picks up the latest process.env.API_KEY injected by the platform.
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
        generatedImage: generatedBase64,
        messages: [...prev.messages, aiMsg],
        history: [newHistoryItem, ...prev.history]
      }));
    } catch (error: any) {
      console.error("Generation Error:", error);
      
      const errorMessage = error.message || JSON.stringify(error);
      
      // Handle Permission Denied or Entity Not Found by forcing re-selection
      if (
        errorMessage.includes("403") || 
        errorMessage.includes("PERMISSION_DENIED") || 
        errorMessage.includes("Requested entity was not found")
      ) {
        setHasKey(false);
        setState(prev => ({
          ...prev,
          isGenerating: false,
          error: "Authentication failed. Please select a valid API Key.",
          messages: [] // Optional: clear messages or leave them
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
    handleSendMessage(DEFAULT_PROMPT);
  };

  const handleDownload = () => {
    if (!state.generatedImage) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${state.generatedImage}`;
    link.download = `viral-cover-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (checkingKey) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!hasKey) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-dark-800 rounded-2xl border border-gray-800 p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-brand-500/20">
             <Maximize2 className="w-8 h-8 text-white" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Welcome to ViralThumb AI</h1>
            <p className="text-gray-400 text-sm">
              Generate viral-worthy YouTube thumbnails using Gemini Nano Banana Pro. 
            </p>
          </div>

          <div className="bg-dark-900/50 p-4 rounded-lg border border-gray-700 text-left text-sm text-gray-300 space-y-2">
             <p className="flex items-start gap-2">
               <span className="text-brand-500 font-bold">•</span>
               <span>Extract styles from any YouTube video</span>
             </p>
             <p className="flex items-start gap-2">
               <span className="text-brand-500 font-bold">•</span>
               <span>Clone yourself into the thumbnail</span>
             </p>
             <p className="flex items-start gap-2">
               <span className="text-brand-500 font-bold">•</span>
               <span>High-quality generation (Nano Banana Pro)</span>
             </p>
          </div>

          <div className="space-y-4 pt-2">
            <button 
              onClick={handleSelectKey}
              className="w-full py-3 px-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4" />
              Connect Google Cloud Project
            </button>
            <p className="text-xs text-gray-500">
              A paid project is required for the Pro model. <br/>
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-brand-500">View Billing Documentation</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-brand-500 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Maximize2 className="w-5 h-5 text-white" />
             </div>
             <h1 className="text-xl font-bold tracking-tight">ViralThumb AI</h1>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
             <span className="hidden sm:inline">Powered by Gemini Nano Banana Pro</span>
             <button onClick={() => setHasKey(false)} className="hover:text-red-400 transition-colors">
               Switch Key
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-4rem)]">
        
        {/* Left Column: Inputs & Chat (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-y-auto pb-20 lg:pb-0">
          <InputPanel 
            onYoutubeThumbnailChange={handleYoutubeChange}
            onProfileImageChange={handleProfileChange}
            youtubeThumbnail={state.youtubeThumbnail}
            profileImage={state.profileImage}
          />
          
          <div className="flex-1 min-h-[400px]">
            <ChatPanel 
              messages={state.messages} 
              onSendMessage={handleSendMessage}
              isGenerating={state.isGenerating}
            />
          </div>
        </div>

        {/* Right Column: Preview & Settings (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6 h-full min-h-0">
          
          {/* Toolbar */}
          <div className="bg-dark-800 p-4 rounded-xl border border-gray-800 flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
             <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-400">Aspect Ratio:</span>
                <div className="flex bg-dark-900 rounded-lg p-1 border border-gray-700">
                   <button 
                     onClick={() => handleSettingsChange('aspectRatio', AspectRatio.Landscape)}
                     className={`p-2 rounded flex items-center gap-2 text-sm transition-all ${state.settings.aspectRatio === AspectRatio.Landscape ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                     title="Landscape (16:9)"
                   >
                     <Monitor className="w-4 h-4" />
                     <span className="hidden sm:inline">16:9</span>
                   </button>
                   <button 
                     onClick={() => handleSettingsChange('aspectRatio', AspectRatio.Portrait)}
                     className={`p-2 rounded flex items-center gap-2 text-sm transition-all ${state.settings.aspectRatio === AspectRatio.Portrait ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                     title="Portrait (9:16)"
                   >
                     <Smartphone className="w-4 h-4" />
                     <span className="hidden sm:inline">9:16</span>
                   </button>
                   <button 
                     onClick={() => handleSettingsChange('aspectRatio', AspectRatio.Square)}
                     className={`p-2 rounded flex items-center gap-2 text-sm transition-all ${state.settings.aspectRatio === AspectRatio.Square ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                     title="Square (1:1)"
                   >
                     <ImageIcon className="w-4 h-4" />
                     <span className="hidden sm:inline">1:1</span>
                   </button>
                </div>
             </div>

             <div className="flex items-center gap-3">
               {!state.generatedImage && !state.isGenerating && (state.youtubeThumbnail || state.profileImage) && (
                 <button 
                    onClick={handleInitialGenerate}
                    className="px-6 py-2 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white rounded-lg font-medium shadow-lg shadow-brand-900/20 transition-all animate-pulse"
                 >
                   Generate Cover
                 </button>
               )}
               {state.generatedImage && (
                 <button 
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                 >
                   <Download className="w-4 h-4" />
                   Download
                 </button>
               )}
             </div>
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 bg-dark-900/50 rounded-xl border border-dashed border-gray-800 flex items-center justify-center p-8 relative overflow-hidden group min-h-[300px]">
            
            {!state.generatedImage && !state.isGenerating && (
              <div className="text-center space-y-4 max-w-md">
                <div className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mx-auto border border-gray-700">
                  <ImageIcon className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-xl font-medium text-gray-300">Ready to Create</h3>
                <p className="text-gray-500">
                  Upload your assets on the left and click "Generate" to create your viral thumbnail.
                </p>
              </div>
            )}

            {state.isGenerating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-10">
                <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-brand-400 font-medium animate-pulse">Generating viral magic...</p>
              </div>
            )}

            {state.generatedImage && (
              <div className={`relative shadow-2xl rounded-lg overflow-hidden transition-all duration-500 ${state.isGenerating ? 'opacity-50 blur-sm scale-95' : 'opacity-100 scale-100'}`}
                   style={{
                     aspectRatio: state.settings.aspectRatio === AspectRatio.Landscape ? '16/9' : state.settings.aspectRatio === AspectRatio.Portrait ? '9/16' : '1/1',
                     maxHeight: '100%',
                     maxWidth: '100%'
                   }}
              >
                <img 
                  src={`data:image/png;base64,${state.generatedImage}`} 
                  alt="Generated Viral Cover" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* History Section */}
          {state.history.length > 0 && (
            <div className="bg-dark-800 p-4 rounded-xl border border-gray-800 flex-shrink-0">
              <div className="flex items-center gap-2 mb-3">
                 <Clock className="w-4 h-4 text-brand-500" />
                 <h3 className="text-sm font-medium text-gray-300">History</h3>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700">
                {state.history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleHistorySelect(item)}
                    className={`relative flex-shrink-0 w-32 aspect-video rounded-lg overflow-hidden border-2 transition-all group ${
                      state.generatedImage === item.image 
                        ? 'border-brand-500 ring-2 ring-brand-500/20' 
                        : 'border-transparent hover:border-gray-600 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={`data:image/png;base64,${item.image}`} 
                      alt="History item" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                       <p className="text-[10px] text-white truncate w-full">{item.prompt}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}