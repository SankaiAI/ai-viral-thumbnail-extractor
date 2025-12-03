
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react';
import { UserProfile } from '../types';

interface AuthContextType {
    isSignedIn: boolean;
    user: any | null; // Clerk User
    profile: UserProfile | null;
    loading: boolean;
    signInWithGoogle: () => void;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    consumeCredit: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();
    const { signOut: clerkSignOut } = useClerkAuth();
    const { openSignIn } = useClerk();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Sync user with DB on login
    useEffect(() => {
        if (isUserLoaded) {
            if (isSignedIn && user) {
                syncUserWithDb();
            } else {
                setProfile(null);
                setLoading(false);
            }
        }
    }, [isUserLoaded, isSignedIn, user]);

    const syncUserWithDb = async () => {
        try {
            setLoading(true);
            const referralCode = localStorage.getItem('referralCode');

            const res = await fetch('/api/user/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id,
                    email: user?.primaryEmailAddress?.emailAddress,
                    referralCode
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setProfile(data.profile);
                if (referralCode) localStorage.removeItem('referralCode');
            } else {
                console.error('Failed to sync user');
            }
        } catch (error) {
            console.error('Error syncing user:', error);
        } finally {
            setLoading(false);
        }
    };

    const refreshProfile = async () => {
        if (user) {
            await syncUserWithDb();
        }
    };

    const signInWithGoogle = () => {
        openSignIn({
            afterSignInUrl: '/',
            afterSignUpUrl: '/',
        });
    };

    const signOut = async () => {
        await clerkSignOut();
        setProfile(null);
    };

    const consumeCredit = async (): Promise<boolean> => {
        if (!user) return false;
        try {
            const res = await fetch('/api/credits/consume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    // Optimistically update
                    if (profile) {
                        setProfile({ ...profile, credits: profile.credits - 1 });
                    }
                    return true;
                }
            }
            return false;
        } catch (err) {
            console.error('Error consuming credit:', err);
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{
            isSignedIn: !!isSignedIn,
            user,
            profile,
            loading: !isUserLoaded || loading,
            signInWithGoogle,
            signOut,
            refreshProfile,
            consumeCredit
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
