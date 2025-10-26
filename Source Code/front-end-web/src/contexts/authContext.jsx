import React, { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser, logoutUser } from "../api/auth";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      setIsLoading(true);
      try {
        const res = await getCurrentUser();
        if (res.data.success) {
          setUser(res.data.data);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
        console.error("Lỗi khi kiểm tra trạng thái đăng nhập:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Lỗi khi logout:", error);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const contextValue = {
    user,
    isAuthenticated,
    isLoading,
    logout,
    setUser,
    setIsAuthenticated,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
