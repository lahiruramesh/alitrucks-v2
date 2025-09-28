"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { authClient } from "@/lib/auth-client";

interface User {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  userType?: string | null;
  companyName?: string | null;
  emailVerified?: boolean;
  [key: string]: any; // Allow other properties
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authClient.getSession();
      const newUser = data?.user || null;
      setUser(newUser);
    } catch (error) {
      console.error("Failed to get session:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authClient.signOut();
      setUser(null);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      if (mounted) {
        try {
          const { data } = await authClient.getSession();
          if (mounted) {
            setUser(data?.user || null);
          }
        } catch (error) {
          console.error("Failed to get session:", error);
          if (mounted) {
            setUser(null);
          }
        } finally {
          if (mounted) {
            setIsLoading(false);
          }
        }
      }
    };
    
    initAuth();
    
    return () => {
      mounted = false;
    };
  }, []); // Remove refreshUser dependency to prevent re-runs

  const contextValue = useMemo(() => ({
    user,
    isLoading,
    signOut,
    refreshUser
  }), [user, isLoading, signOut, refreshUser]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}