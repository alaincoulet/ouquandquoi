// src/context/AuthContext.tsx
/**
 * Contexte d’authentification global (React Context)
 * - Fournit l’utilisateur connecté et son token à toute l’appli
 * - Prend en charge l’identifiant MongoDB natif (_id)
 * - Persiste la session dans localStorage
 * - Best practice : typage strict, prêt pour extension
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Type TypeScript pour les infos utilisateur reçues du backend (100% Mongo natif)
export interface AuthUser {
  _id: string;            // Identifiant natif MongoDB (ObjectId sous forme string)
  email: string;
  pseudo?: string;
  nom?: string;
  prenom?: string;
  role?: string;
  preferredEmailClient?: "gmail" | "outlook" | "yahoo" | "default";
}

// Type du contexte
interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// Création du contexte (valeur par défaut vide)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider qui enveloppe l’appli
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Chargement initial : essaie de retrouver un token/user dans localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("oqq_token");
    const savedUser = localStorage.getItem("oqq_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Fonction pour connecter l’utilisateur (et sauvegarder dans localStorage)
  const login = (newToken: string, newUser: AuthUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("oqq_token", newToken);
    localStorage.setItem("oqq_user", JSON.stringify(newUser));
  };

  // Fonction pour se déconnecter (clear tout)
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("oqq_token");
    localStorage.removeItem("oqq_user");
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook custom pratique pour accéder au contexte dans les composants
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return ctx;
}
