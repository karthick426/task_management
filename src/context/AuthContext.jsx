import React, { createContext, useContext, useState, useEffect } from "react";
import { dbService } from "../firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = dbService.onAuthChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const user = await dbService.login(email, password);
      setCurrentUser(user);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, displayName) => {
    setLoading(true);
    try {
      const user = await dbService.register(email, password, displayName);
      setCurrentUser(user);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const user = await dbService.loginWithGoogle();
      setCurrentUser(user);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await dbService.logout();
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    const user = await dbService.updateUserProfile(profileData);
    setCurrentUser(user);
    return user;
  };

  const updatePassword = async (passwordData) => {
    return await dbService.updateUserPassword(passwordData);
  };

  const value = {
    currentUser,
    login,
    register,
    loginWithGoogle,
    logout,
    updateProfile,
    updatePassword,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
