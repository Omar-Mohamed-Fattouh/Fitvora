import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [healthInfo, setHealthInfo] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("authToken")));

  const fetchUserData = async () => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      setUser(null);
      setHealthInfo(null);
      setLoading(false);
      return;
    }

    try {
      const [userResponse, healthResponse] = await Promise.all([
        api.get("/users/current/accountInfo"),
        api.get("/users/current/healthInfo"),
      ]);

      const account = userResponse.data.accountInfo || {};
      const userData = {
        ...account,
        name: account.name || localStorage.getItem("userName"),
        email: userResponse.data.email || localStorage.getItem("userEmail"),
        isVerified: userResponse.data.isVerified,
      };

      setUser(userData);
      setHealthInfo(healthResponse.data.healthInfo || healthResponse.data);

      localStorage.setItem("userName", userData.name || "");
      localStorage.setItem("userEmail", userData.email || "");
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (token, userData = {}) => {
    const name = userData.name || userData.accountInfo?.name || "";
    const email = userData.email || userData.accountInfo?.email || "";
    localStorage.setItem("authToken", token);
    localStorage.setItem("userName", name);
    localStorage.setItem("userEmail", email);
    setUser({
      name,
      email,
      birthDate: userData.accountInfo?.birthDate,
      isVerified: userData.isVerified !== false,
    });
    if (userData.healthInfo) {
      setHealthInfo(userData.healthInfo);
    }
    setLoading(false);
    await fetchUserData();
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userData");
    setUser(null);
    setHealthInfo(null);
  };

  const refreshHealthInfo = async () => {
    try {
      const response = await api.get("/users/current/healthInfo");
      setHealthInfo(response.data.healthInfo || response.data);
    } catch (error) {
      console.error("Error refreshing health info:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        healthInfo,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUserData: fetchUserData,
        refreshHealthInfo,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
