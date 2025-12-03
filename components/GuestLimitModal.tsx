import React from 'react';
import { Lock, LogIn, Sparkles } from 'lucide-react';

interface GuestLimitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSignIn: () => void;
}

export const GuestLimitModal: React.FC<GuestLimitModalProps> = ({ isOpen, onClose, onSignIn }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="bg-[#1a1a1a] rounded-2xl border border-gray-800 p-8 shadow-2xl max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Background decoration */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-brand-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-purple-500/10 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-brand-500/20 mb-6">
                        <Lock className="w-8 h-8 text-white" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">Free Limit Reached</h2>

                    <p className="text-gray-400 mb-8">
                        You've used your 3 free guest generations. Sign in now to unlock <span className="text-brand-400 font-semibold">20 more free credits</span> and save your masterpieces to the cloud!
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={() => {
                                onClose();
                                onSignIn();
                            }}
                            className="w-full py-3.5 px-4 bg-white hover:bg-gray-100 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 group"
                        >
                            <LogIn className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Sign In to Continue
                        </button>

                        <button
                            onClick={onClose}
                            className="w-full py-3 px-4 text-gray-500 hover:text-gray-300 font-medium transition-colors"
                        >
                            Maybe later
                        </button>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                        <Sparkles className="w-3 h-3 text-brand-500" />
                        <span>Join thousands of creators making viral thumbnails</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
