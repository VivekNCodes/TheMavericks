"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { FarmerUser } from "@/types/auth";
import { siteConfig } from "@/config/site";

interface AuthContextType {
  user: FarmerUser | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginWithGoogle: (customData?: Partial<FarmerUser>) => Promise<void>;
  logout: () => void;
}

const defaultFarmer: FarmerUser = {
  id: "google-10982348234",
  googleId: "10982348234",
  name: "Ramesh Kumar",
  email: "ramesh.kumar.farmer@gmail.com",
  role: "Farmer",
  location: "Jaipur, Rajasthan",
  avatarUrl: "/images/ramesh-avatar.webp",
  isVerified: true,
  acres: 3.7,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<FarmerUser | null>(defaultFarmer);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    // Check if an existing logged in user is in localStorage
    const savedUser = localStorage.getItem("krishisetu_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(defaultFarmer);
      }
    }
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const loginWithGoogle = async (customData?: Partial<FarmerUser>) => {
    // Simulated or live Google OAuth profile resolver
    const googleUser: FarmerUser = {
      id: customData?.id || `google-${Date.now()}`,
      googleId: customData?.googleId || `g-${Date.now()}`,
      name: customData?.name || "Ramesh Kumar",
      email: customData?.email || "ramesh.kumar.farmer@gmail.com",
      role: "Farmer",
      location: customData?.location || "Jaipur, Rajasthan",
      avatarUrl: customData?.avatarUrl || "/images/ramesh-avatar.webp",
      isVerified: true,
      acres: customData?.acres || 3.7,
    };

    setUser(googleUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("krishisetu_user", JSON.stringify(googleUser));
    }
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("krishisetu_user");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
