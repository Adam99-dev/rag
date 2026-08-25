import { createContext, useEffect, useState } from "react";
import { authApi } from "../api/auth.api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [loggedUser, setLoggedUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    authApi.me()
      .then(({ data }) => {
        setLoggedUser(data.user);
        setIsLoggedIn(true);
      })
      .catch(() => {})
      .finally(() => setAuthLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ loggedUser, setLoggedUser, isLoggedIn, setIsLoggedIn, authLoading, setAuthLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
