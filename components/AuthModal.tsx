
import React from 'react';
import { SignIn } from '@clerk/clerk-react';

interface AuthModalProps {
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
            <div onClick={(e) => e.stopPropagation()}>
                <SignIn
                    appearance={{
                        elements: {
                            rootBox: "mx-auto",
                            card: "bg-[#1a1a1a] shadow-2xl border border-gray-800",
                            headerTitle: "text-white",
                            headerSubtitle: "text-gray-400",
                            socialButtonsBlockButton: "bg-white hover:bg-gray-100 text-black border-0",
                            formButtonPrimary: "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500",
                            formFieldInput: "bg-[#0f0f0f] border-gray-700 text-white",
                            formFieldLabel: "text-gray-300",
                            footerActionLink: "text-purple-400 hover:text-purple-300",
                            identityPreviewText: "text-white",
                            identityPreviewEditButton: "text-purple-400",
                            footer: "hidden", // Hides "Secured by Clerk"
                            badge: "hidden", // Hides "Development mode"
                        },
                        layout: {
                            socialButtonsPlacement: "top",
                            socialButtonsVariant: "blockButton",
                        }
                    }}
                />
            </div>
        </div>
    );
};
