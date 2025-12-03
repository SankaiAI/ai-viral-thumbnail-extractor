
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Copy, Check, Gift, X } from 'lucide-react';

interface ReferralModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({ isOpen, onClose }) => {
    const { profile } = useAuth();
    const [copied, setCopied] = useState(false);

    if (!isOpen || !profile) return null;

    const referralLink = `${window.location.origin}?ref=${profile.referral_code}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-dark-800 rounded-2xl border border-gray-800 p-6 shadow-2xl max-w-md w-full relative animate-in fade-in zoom-in-95 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center space-y-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20">
                        <Gift className="w-8 h-8 text-white" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white">Get More Credits</h2>
                        <p className="text-gray-400">
                            Share your referral link with friends. You'll get <span className="text-brand-400 font-bold">+10 credits</span> for every friend who signs up!
                        </p>
                    </div>

                    <div className="bg-dark-900 p-4 rounded-lg border border-gray-700 flex items-center gap-3">
                        <code className="flex-1 text-sm text-gray-300 truncate font-mono">
                            {referralLink}
                        </code>
                        <button
                            onClick={handleCopy}
                            className={`p-2 rounded-md transition-all ${copied ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>

                    <div className="pt-2">
                        <p className="text-sm text-gray-500">
                            Current Credits: <span className="text-white font-bold">{profile.credits}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
