import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export interface UserAuthProfile {
  isAuthenticated: boolean;
  address: `0x${string}` | null;
  authMethod: 'google' | 'email' | 'twitter' | 'injected' | null;
  email?: string;
  name?: string;
  avatar?: string;
  username?: string;
  isEmbedded?: boolean;
}

interface AuthContextType {
  profile: UserAuthProfile;
  loginWithPrivy: () => void;
  loginWithGoogle: (email?: string, name?: string) => Promise<void>;
  loginWithEmailOTP: (email: string, code: string) => Promise<boolean>;
  loginWithTwitter: (handle: string) => Promise<void>;
  connectInjected: () => Promise<void>;
  disconnect: () => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  pendingEmailForOtp: string;
  setPendingEmailForOtp: (email: string) => void;
  generatedOtpCode: string;
  setGeneratedOtpCode: (code: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Deterministic wallet address derivation based on unique identity string
export function deriveEmbeddedAddress(identity: string): `0x${string}` {
  const cleanId = identity.toLowerCase().trim();
  let hash1 = 0x811c9dc5;
  let hash2 = 0x5f356495;
  
  for (let i = 0; i < cleanId.length; i++) {
    const char = cleanId.charCodeAt(i);
    hash1 = Math.imul(hash1 ^ char, 0x01000193);
    hash2 = Math.imul(hash2 ^ (char << 1), 0x01000193);
  }
  
  const hex1 = (hash1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (hash2 >>> 0).toString(16).padStart(8, '0');
  const seed = 'b4e72c819a6d0f3e5c1a8d7b9e2f4a6c8d0e1b3f';
  const combined = (hex1 + hex2 + seed).slice(0, 40);
  return `0x${combined}` as `0x${string}`;
}

const SESSION_STORAGE_KEY = 'base_escrow_privy_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address: wagmiAddress, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();

  const [savedSession, setSavedSession] = useState<UserAuthProfile | null>(() => {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingEmailForOtp, setPendingEmailForOtp] = useState('');
  const [generatedOtpCode, setGeneratedOtpCode] = useState('482910');

  // Sync session changes to localStorage
  const updateSession = (newSession: UserAuthProfile | null) => {
    setSavedSession(newSession);
    if (newSession && newSession.isAuthenticated) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  };

  // Profile resolution
  const profile: UserAuthProfile = useMemo(() => {
    if (isConnected && wagmiAddress) {
      return {
        isAuthenticated: true,
        address: wagmiAddress,
        authMethod: 'injected',
        name: `${wagmiAddress.slice(0, 6)}...${wagmiAddress.slice(-4)}`,
        isEmbedded: false,
      };
    }

    if (savedSession && savedSession.isAuthenticated && savedSession.address) {
      return savedSession;
    }

    return {
      isAuthenticated: false,
      address: null,
      authMethod: null,
    };
  }, [isConnected, wagmiAddress, savedSession]);

  const loginWithGoogle = async (email = 'pinnaclecrypt@gmail.com', name = 'Google User') => {
    const address = deriveEmbeddedAddress(email);
    const userSession: UserAuthProfile = {
      isAuthenticated: true,
      address,
      authMethod: 'google',
      email,
      name: email.split('@')[0],
      isEmbedded: true,
    };
    updateSession(userSession);
    setIsModalOpen(false);
  };

  const loginWithEmailOTP = async (email: string, code: string): Promise<boolean> => {
    if (!code || code.length < 4) {
      return false;
    }
    const cleanEmail = email.trim().toLowerCase();
    const address = deriveEmbeddedAddress(cleanEmail);
    const userSession: UserAuthProfile = {
      isAuthenticated: true,
      address,
      authMethod: 'email',
      email: cleanEmail,
      name: cleanEmail.split('@')[0],
      isEmbedded: true,
    };
    updateSession(userSession);
    setIsModalOpen(false);
    return true;
  };

  const loginWithTwitter = async (handle: string) => {
    const cleanHandle = handle.replace('@', '').trim();
    const address = deriveEmbeddedAddress(`x_${cleanHandle}`);
    const userSession: UserAuthProfile = {
      isAuthenticated: true,
      address,
      authMethod: 'twitter',
      username: cleanHandle,
      name: `@${cleanHandle}`,
      isEmbedded: true,
    };
    updateSession(userSession);
    setIsModalOpen(false);
  };

  const connectInjected = async () => {
    try {
      const injectedConnector = connectors.find((c) => c.id === 'injected') || connectors[0];
      if (injectedConnector) {
        await connectAsync({ connector: injectedConnector });
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to connect injected wallet:', err);
    }
  };

  const loginWithPrivy = () => {
    setIsModalOpen(true);
  };

  const disconnect = async () => {
    updateSession(null);
    if (isConnected) {
      try {
        await disconnectAsync();
      } catch (err) {
        console.error('Failed to disconnect:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        profile,
        loginWithPrivy,
        loginWithGoogle,
        loginWithEmailOTP,
        loginWithTwitter,
        connectInjected,
        disconnect,
        isModalOpen,
        setIsModalOpen,
        pendingEmailForOtp,
        setPendingEmailForOtp,
        generatedOtpCode,
        setGeneratedOtpCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAppAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAppAuth must be used within an AuthProvider');
  }
  return context;
};
