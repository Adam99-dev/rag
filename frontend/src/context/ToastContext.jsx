import { createContext, useCallback, useEffect, useState } from "react";
import ToastContainer from "../components/ToastContainer";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info", duration = 3500) =>
    setToasts((current) => [
      ...current,
      { id: Date.now() + Math.random(), message: String(message), type, duration },
    ]), []);
  const removeToast = (id) =>
    setToasts((current) => current.filter((toast) => toast.id !== id));

  useEffect(() => {
    const showError = (value) =>
      showToast(value instanceof Error ? value.message : value || "Unexpected error", "error");
    const onError = (event) => showError(event.error || event.message);
    const onRejection = (event) => showError(event.reason);
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export { ToastContext };
