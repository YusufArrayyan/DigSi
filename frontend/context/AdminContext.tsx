"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AdminContextType {
  isAdmin: boolean;
  username: string | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  callApi: (url: string, options?: RequestInit) => Promise<Response>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("digsi_admin_token");
    const savedUser = localStorage.getItem("digsi_admin_user");
    if (savedToken && savedUser) {
        setIsAdmin(true);
        setToken(savedToken);
        setUsername(savedUser);
    }
  }, []);

  const login = async (user: string, pass: string) => {
    try {
        const res = await fetch("http://127.0.0.1:8080/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: user, password: pass })
        });
        
        if (res.ok) {
            const data = await res.json();
            setIsAdmin(true);
            setToken(data.token);
            setUsername(data.username);
            localStorage.setItem("digsi_admin_token", data.token);
            localStorage.setItem("digsi_admin_user", data.username);
            return true;
        }
        return false;
    } catch (e) {
        console.error("Login failed:", e);
        return false;
    }
  };

  const register = async (user: string, pass: string) => {
    try {
        const res = await fetch("http://127.0.0.1:8080/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: user, password: pass })
        });
        
        if (res.ok) {
            return { success: true };
        }
        const data = await res.json();
        return { success: false, error: data.error };
    } catch (e) {
        return { success: false, error: "Connection failed" };
    }
  };

  const logout = () => {
    setIsAdmin(false);
    setToken(null);
    setUsername(null);
    localStorage.removeItem("digsi_admin_token");
    localStorage.removeItem("digsi_admin_user");
  };

  // Helper to call protected APIs
  const callApi = async (url: string, options: RequestInit = {}) => {
    const headers = {
      ...options.headers,
      "Authorization": `Bearer ${token}`,
    };
    return fetch(url, { ...options, headers });
  };

  return (
    <AdminContext.Provider value={{ isAdmin, username, token, login, register, logout, callApi }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
