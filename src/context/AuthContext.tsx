"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";
import type { FarmerUser } from "@/types/auth";

interface AuthContextType {
  user: FarmerUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginWithGoogle: (customData?: Partial<FarmerUser>) => Promise<void>;
  loginWithDirectGoogleOAuth: () => Promise<void>;
  updateProfile: (updates: Partial<FarmerUser>) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const defaultFarmer: FarmerUser = {
  id: "preset-ramesh",
  googleId: "google-preset-ramesh-101",
  name: "Ramesh Kumar",
  email: "ramesh.kumar.farmer@gmail.com",
  role: "FARMER",
  location: "Jaipur, Rajasthan",
  state: "Rajasthan",
  district: "Jaipur",
  avatarUrl: "/images/ramesh-avatar.webp",
  isVerified: true,
  acres: 3.7,
  farmSize: 3.7,
  farmSizeUnit: "acre",
  preferredLanguage: "hi",
  soilType: "Sandy Loam",
  irrigationMethod: "Drip & Tube-well",
  farmingExperience: 14,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthInnerProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();
  const [user, setUser] = useState<FarmerUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  // Sync session with profile from /api/user/profile
  const fetchUserProfile = useCallback(async () => {
    if (status === "authenticated" && session?.user) {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setUser(json.data);
            return;
          }
        }
      } catch (e) {
        console.warn("Could not fetch user profile from API, using session data:", e);
      }

      // Fallback from session payload
      const sessUser = session.user as any;
      setUser({
        id: sessUser.id || "farmer-session-user",
        name: sessUser.name || "Farmer",
        email: sessUser.email || "",
        role: "FARMER",
        location: sessUser.location || "Jaipur, Rajasthan",
        state: sessUser.state || "Rajasthan",
        district: sessUser.district || "Jaipur",
        avatarUrl: sessUser.image || "/images/ramesh-avatar.webp",
        isVerified: true,
        acres: sessUser.acres || 3.0,
        farmSize: sessUser.acres || 3.0,
        farmSizeUnit: "acre",
        preferredLanguage: sessUser.preferredLanguage || "en",
      });
    } else if (status === "unauthenticated") {
      // Check if user has saved preference or fallback
      const saved = typeof window !== "undefined" ? localStorage.getItem("agrosaathi_active_user") : null;
      if (saved) {
        try {
          setUser(JSON.parse(saved));
        } catch {
          setUser(null);
        }
      } else {
        // Initialize with default demo farmer for seamless out-of-the-box experience
        setUser(defaultFarmer);
      }
    }
  }, [status, session]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  // Full real Google OAuth redirection flow
  const loginWithDirectGoogleOAuth = async () => {
    setIsLocalLoading(true);
    try {
      await signIn("google", {
        callbackUrl: window.location.href,
      });
    } catch (err) {
      console.error("Direct Google OAuth failed:", err);
    } finally {
      setIsLocalLoading(false);
    }
  };

  // Google Sign-In supporting both direct OAuth and preset farmer credentials
  const loginWithGoogle = async (customData?: Partial<FarmerUser>) => {
    setIsLocalLoading(true);

    try {
      if (customData?.email) {
        // Sign in via NextAuth credentials provider to persist real server cookies
        const res = await signIn("farmer-credentials", {
          email: customData.email,
          name: customData.name || "Farmer",
          googleId: customData.googleId || `g-${Date.now()}`,
          avatarUrl: customData.avatarUrl || "/images/ramesh-avatar.webp",
          redirect: false,
        });

        if (res?.ok) {
          await fetchUserProfile();
        }
      } else {
        // Direct Google OAuth flow
        await signIn("google", {
          callbackUrl: window.location.href,
        });
      }
    } catch (err) {
      console.error("Google sign in failed:", err);
    } finally {
      setIsLocalLoading(false);
      setIsAuthModalOpen(false);
    }
  };

  const updateProfile = async (updates: Partial<FarmerUser>): Promise<boolean> => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setUser(json.data);
          if (typeof window !== "undefined") {
            localStorage.setItem("agrosaathi_active_user", JSON.stringify(json.data));
          }
          await update(json.data);
          return true;
        }
      }
    } catch (e) {
      console.error("Profile update failed:", e);
    }

    // Local fallback update
    if (user) {
      const updatedUser: FarmerUser = {
        ...user,
        ...updates,
      };
      setUser(updatedUser);
      if (typeof window !== "undefined") {
        localStorage.setItem("agrosaathi_active_user", JSON.stringify(updatedUser));
      }
      return true;
    }
    return false;
  };

  const deleteAccount = async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmDelete: true }),
      });

      if (res.ok) {
        await logout();
        return true;
      }
    } catch (e) {
      console.error("Account deletion failed:", e);
    }
    await logout();
    return true;
  };

  const logout = async () => {
    try {
      await signOut({ redirect: false });
    } catch (e) {
      console.warn("NextAuth signOut error:", e);
    }
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("agrosaathi_active_user");
      localStorage.removeItem("agrosaathi_user");
      localStorage.removeItem("krishisetu_user");
    }
    setIsAuthModalOpen(false);
  };

  const refreshUser = async () => {
    await fetchUserProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading: status === "loading" || isLocalLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        loginWithGoogle,
        loginWithDirectGoogleOAuth,
        updateProfile,
        deleteAccount,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SessionProvider>
      <AuthInnerProvider>{children}</AuthInnerProvider>
    </SessionProvider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
