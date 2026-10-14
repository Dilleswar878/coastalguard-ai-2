import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'citizen' | 'admin' | 'officer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  badgeNumber?: string;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loginAsDemoUser: (role: UserRole) => void;
  loginWithCredentials: (email: string, pass: string) => { success: boolean; error?: string };
  registerUser: (name: string, email: string, pass: string, role: UserRole) => { success: boolean; error?: string };
  logout: () => void;
  isCRTActive: boolean;
  toggleCRT: () => void;
  isAudioActive: boolean;
  toggleAudio: () => void;
}

const AUTH_STORAGE_KEY = 'coastalguard_auth_user_v1';
const CRT_STORAGE_KEY = 'coastalguard_crt_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      // Default to citizen user for instant usability
      return {
        id: 'USR-8821',
        name: 'Kai Vance (Citizen Guardian)',
        email: 'kai.vance@oceanwatch.org',
        role: 'citizen',
      };
    } catch {
      return null;
    }
  });

  const [isCRTActive, setIsCRTActive] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem(CRT_STORAGE_KEY);
    return saved !== 'false';
  });

  const [isAudioActive, setIsAudioActive] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }, [user]);

  const toggleCRT = () => {
    setIsCRTActive((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem(CRT_STORAGE_KEY, String(next));
      }
      return next;
    });
  };

  const toggleAudio = () => {
    setIsAudioActive((prev) => !prev);
  };

  const loginAsDemoUser = (role: UserRole) => {
    if (role === 'admin' || role === 'officer') {
      setUser({
        id: 'ADM-902',
        name: 'Commander C. Diaz',
        email: 'c.diaz@coastalguard.gov',
        role: 'admin',
        badgeNumber: 'CG-TAC-902',
        department: 'Regional Coastal Spill & Hazard Response Bureau',
      });
    } else {
      setUser({
        id: 'USR-8821',
        name: 'Kai Vance (Citizen Guardian)',
        email: 'kai.vance@oceanwatch.org',
        role: 'citizen',
      });
    }
  };

  const loginWithCredentials = (email: string, pass: string): { success: boolean; error?: string } => {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid telemetry identifier or email address.' };
    }
    if (!pass || pass.length < 6) {
      return { success: false, error: 'Access cipher must be at least 6 characters in length.' };
    }

    const isAdmin = email.toLowerCase().includes('admin') || email.toLowerCase().includes('officer');
    const newUser: User = {
      id: isAdmin ? 'ADM-902' : 'USR-7734',
      name: isAdmin ? 'Officer C. Diaz' : email.split('@')[0],
      email,
      role: isAdmin ? 'admin' : 'citizen',
      department: isAdmin ? 'Coastal Environmental Response Division' : undefined,
    };

    setUser(newUser);
    return { success: true };
  };

  const registerUser = (name: string, email: string, pass: string, role: UserRole): { success: boolean; error?: string } => {
    if (!name || name.trim().length < 2) {
      return { success: false, error: 'Cadet callsign/name must be at least 2 characters.' };
    }
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Valid environmental comms email required.' };
    }
    if (!pass || pass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const newUser: User = {
      id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      email,
      role,
      department: role === 'admin' ? 'Coastal Taskforce' : undefined,
    };

    setUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'admin' || user?.role === 'officer',
        loginAsDemoUser,
        loginWithCredentials,
        registerUser,
        logout,
        isCRTActive,
        toggleCRT,
        isAudioActive,
        toggleAudio,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
