import { createContext, useEffect, useState } from "react";
import { userApi } from "../api/user.api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [loggedUser, setLoggedUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    userApi.me()
      .then(({ data }) => {
        if (cancelled) return;
        setLoggedUser(data.user);
        setIsLoggedIn(true);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setAuthLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ loggedUser, setLoggedUser, isLoggedIn, setIsLoggedIn, authLoading, setAuthLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
