import React, { createContext, useContext, useState, useCallback } from "react";
import { getUserProfile, logoutUser } from "../api/user";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getUserProfile();
      if (res.success) {
        const userData = res.data.user || res.data;
        setUser(userData);
        setIsAuthenticated(true);
        return userData;
      } else {
        setUser(null);
        setIsAuthenticated(false);
        return null;
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Lỗi khi logout:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const contextValue = {
    user,
    isAuthenticated,
    isLoading,
    logout,
    login,
    refreshUser,
    setUser,
    setIsAuthenticated,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
