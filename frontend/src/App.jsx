import { useEffect, useState } from "react";
import { theme } from "./theme";
import AuthForm from "./components/AuthForm";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import ToastContainer from "./components/ToastContainer";

const USER_API_URL = import.meta.env.VITE_USER_API_URL || "";

const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL || "";

const statusDetails = (status) => {
  const value = String(status || "UPLOADING").toUpperCase();
  if (value === "COMPLETED")
    return { status: "ready", loadingText: "Ready", progress: 100 };
  if (value === "FAILED")
    return { status: "failed", loadingText: "Failed", progress: 0 };
  return {
    status: "loading",
    loadingText: value
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase()),
    progress: 0,
  };
};

const toDocument = (document) => ({
  id: document.id,
  name: document.filename,
  chatId: document.chat?.id || null,
  backendStatus: document.status,
  isDeleting: false,
  ...statusDetails(document.status),
});

const toCitations = (sources) =>
  Array.isArray(sources)
    ? sources.map((source, index) => ({
        page: source?.metadata?.page,
        text:
          source?.metadata?.text ||
          source?.text ||
          source?.doc ||
          `Source ${index + 1}`,
      }))
    : [];

const toMessage = (message) => ({
  id: message.id,
  role: String(message.role).toLowerCase() === "user" ? "user" : "ai",
  content: message.content,
  citations: toCitations(message.sources),
});

const App = () => {
  const [auth, setAuth] = useState({
    isAuth: false,
    mode: "login",
    user: null,
    form: { name: "", email: "", password: "" },
  });
  const [docs, setDocs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [chat, setChat] = useState({});
  const [msg, setMsg] = useState("");
  const [typing, setTyping] = useState(false);
  const [search, setSearch] = useState("");
  const [drag, setDrag] = useState(false);
  const [mobileView, setMobileView] = useState("docs");
  const [isMobile, setIsMobile] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [openSources, setOpenSources] = useState({});
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "info", duration = 3500) =>
    setToasts((current) => [
      ...current,
      { id: Date.now() + Math.random(), message, type, duration },
    ]);
  const removeToast = (id) =>
    setToasts((current) => current.filter((toast) => toast.id !== id));

  // API SERVICE
  // I WILL CONNECT THIS
  const request = async (baseUrl, path, options = {}) => {
    const response = await fetch(`${baseUrl}${path}`, {
      credentials: "include",
      ...options,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok)
      throw new Error(data.message || data.error || "Request failed");
    return data;
  };

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const data = await request(USER_API_URL, "/api/auth/me");
        setAuth((current) => ({ ...current, isAuth: true, user: data.user }));
      } catch {
        // No active session is expected before a user signs in.
      }
    };
    restoreSession();
  }, []);

  useEffect(() => {
    if (!auth.isAuth) return undefined;

    const fetchDocuments = async () => {
      try {
        const data = await request(USER_API_URL, "/api/document");
        const nextDocuments = (data.documents || []).map(toDocument);
        setDocs(nextDocuments);
        setSelected((current) =>
          current
            ? nextDocuments.find((document) => document.id === current.id) ||
              null
            : null,
        );
      } catch (error) {
        if (error.message !== "Authentication required. Please login.")
          showToast(error.message || "Unable to load documents", "error");
      }
    };

    const initialFetch = window.setTimeout(fetchDocuments, 0);
    const statusPoll = window.setInterval(fetchDocuments, 5000);
    return () => {
      window.clearTimeout(initialFetch);
      window.clearInterval(statusPoll);
    };
  }, [auth.isAuth]);

  const handleAuth = async (event) => {
    event.preventDefault();
    try {
      const isLogin = auth.mode === "login";
      const data = await request(
        USER_API_URL,
        isLogin ? "/api/auth/login" : "/api/auth/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isLogin
              ? { email: auth.form.email, password: auth.form.password }
              : auth.form,
          ),
        },
      );
      const user = data.data.user;
      setAuth((current) => ({ ...current, isAuth: true, user }));
      showToast(
        isLogin
          ? `Welcome back, ${user.name}!`
          : `Account created successfully, ${user.name}!`,
        "success",
      );
    } catch (error) {
      showToast(error.message || "Authentication failed", "error");
    }
  };

  const logout = async () => {
    console.log(USER_API_URL);
    try {
      await request(USER_API_URL, "/api/auth/logout", { method: "POST" });
      setAuth({
        isAuth: false,
        mode: "login",
        user: null,
        form: { name: "", email: "", password: "" },
      });
      setDocs([]);
      setSelected(null);
      setChat({});
      setMobileView("docs");
      setProfileMenuOpen(false);
      setOpenSources({});
    } catch (error) {
      showToast(error.message || "Unable to log out", "error");
    }
  };

  const upload = async (files) => {
    if (!files?.length) return;
    const formData = new FormData();
    formData.append("document", files[0]);
    try {
      const data = await request(USER_API_URL, "/api/document", {
        method: "POST",
        body: formData,
      });
      setDocs((current) => [toDocument(data.document), ...current]);
      showToast(data.message || "Document uploaded successfully", "success");
    } catch (error) {
      showToast(error.message || "Unable to upload document", "error");
    }
  };

  const handleDeleteDoc = async (id) => {
    setDocs((current) =>
      current.map((document) =>
        document.id === id ? { ...document, isDeleting: true } : document,
      ),
    );
    try {
      await request(USER_API_URL, `/api/document/${id}`, { method: "DELETE" });
      setDocs((current) => current.filter((document) => document.id !== id));
      if (selected?.id === id) setSelected(null);
      setChat((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      showToast("Document deleted successfully", "success");
    } catch (error) {
      setDocs((current) =>
        current.map((document) =>
          document.id === id ? { ...document, isDeleting: false } : document,
        ),
      );
      showToast(error.message || "Unable to delete document", "error");
    } finally {
      setDocToDelete(null);
    }
  };

  const handleDocSelect = async (document) => {
    setSelected(document);
    if (isMobile) setMobileView("chat");
    if (!document.chatId || chat[document.id]) return;
    try {
      const data = await request(USER_API_URL, `/api/chat/${document.chatId}`);
      setChat((current) => ({
        ...current,
        [document.id]: (data.chat.messages || []).map(toMessage),
      }));
    } catch (error) {
      showToast(error.message || "Unable to load chat history", "error");
    }
  };

  const sendMsg = async () => {
    if (!msg.trim() || !selected?.chatId || typing) return;
    const content = msg.trim();
    const documentId = selected.id;
    const history = (chat[documentId] || []).map((message) => ({
      role: message.role === "user" ? "user" : "assistant",
      content: message.content,
    }));
    setChat((current) => ({
      ...current,
      [documentId]: [
        ...(current[documentId] || []),
        { id: Date.now(), role: "user", content, citations: [] },
      ],
    }));
    setMsg("");
    setTyping(true);
    try {
      const data = await request(CHAT_API_URL, "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: content,
          documentId,
          chatId: selected.chatId,
          history,
        }),
      });
      setChat((current) => ({
        ...current,
        [documentId]: [
          ...(current[documentId] || []),
          {
            id: Date.now() + 1,
            role: "ai",
            content: data.answer || "",
            citations: toCitations(data.sources),
          },
        ],
      }));
    } catch (error) {
      showToast(error.message || "Unable to send message", "error");
    } finally {
      setTyping(false);
    }
  };

  const toggleSources = (id) =>
    setOpenSources((current) => ({ ...current, [id]: !current[id] }));
  const filtered = docs.filter((document) =>
    document.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (!auth.isAuth)
    return <AuthForm auth={auth} setAuth={setAuth} handleAuth={handleAuth} />;

  return (
    <div
      className="h-screen flex overflow-hidden"
      style={{ background: theme.bg, color: "#1f2937" }}
    >
      <style>{`* { scrollbar-width: none; -ms-overflow-style: none; } *::-webkit-scrollbar { display: none; }`}</style>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {(!isMobile || mobileView === "docs") && (
        <Sidebar
          isMobile={isMobile}
          drag={drag}
          setDrag={setDrag}
          upload={upload}
          search={search}
          setSearch={setSearch}
          filteredDocs={filtered}
          selected={selected}
          onSelect={handleDocSelect}
          showDeleteConfirm={showDeleteConfirm}
          docToDelete={docToDelete}
          setShowDeleteConfirm={setShowDeleteConfirm}
          setDocToDelete={setDocToDelete}
          handleDeleteDoc={handleDeleteDoc}
          user={auth.user}
          profileMenuOpen={profileMenuOpen}
          setProfileMenuOpen={setProfileMenuOpen}
          logout={logout}
        />
      )}
      {(!isMobile || mobileView === "chat") && (
        <ChatArea
          selected={selected}
          isMobile={isMobile}
          setMobileView={setMobileView}
          chat={chat}
          typing={typing}
          openSources={openSources}
          toggleSources={toggleSources}
          msg={msg}
          setMsg={setMsg}
          sendMsg={sendMsg}
        />
      )}
    </div>
  );
};

export default App;
