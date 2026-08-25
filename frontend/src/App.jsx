import { useCallback, useEffect, useState } from "react";
import { theme } from "./theme";
import AuthForm from "./components/AuthForm";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import ToastContainer from "./components/ToastContainer";
import { useAuth } from "./hooks/useAuth";
import { authApi } from "./api/auth.api";
import { documentApi } from "./api/document.api";
import { chatApi } from "./api/chat.api";

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
  const { loggedUser, setLoggedUser, isLoggedIn, setIsLoggedIn, authLoading } = useAuth();
  const [auth, setAuth] = useState({
    mode: "login",
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
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsVersion, setDocumentsVersion] = useState(0);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((message, type = "info", duration = 3500) =>
    setToasts((current) => [...current, { id: Date.now() + Math.random(), message, type, duration }]), []);
  const removeToast = (id) => setToasts((current) => current.filter((toast) => toast.id !== id));

  useEffect(() => {
    const showError = (value) => showToast(value instanceof Error ? value.message : value || "Unexpected error", "error");
    const onError = (event) => showError(event.error || event.message);
    const onRejection = (event) => showError(event.reason);
    const originalWarn = console.warn;
    console.warn = (...args) => { showToast(args.join(" "), "warning"); originalWarn(...args); };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
      console.warn = originalWarn;
    };
  }, [showToast]);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return undefined;

    let pollTimer;
    const fetchDocuments = async () => {
      setDocumentsLoading(true);
      try {
        const data = await documentApi.list();
        const nextDocuments = (data.documents || []).map(toDocument);
        setDocs(nextDocuments);
        setSelected((current) =>
          current
            ? nextDocuments.find((document) => document.id === current.id) ||
              null
            : nextDocuments.find((document) => document.id === sessionStorage.getItem("selectedDocumentId")) || null,
        );
        if (nextDocuments.some((document) => !["COMPLETED", "FAILED"].includes(document.backendStatus)))
          pollTimer = window.setTimeout(fetchDocuments, 5000);
      } catch (error) {
        if (error.message !== "Authentication required. Please login.")
          showToast(error.message || "Unable to load documents", "error");
      } finally {
        setDocumentsLoading(false);
      }
    };

    fetchDocuments();
    return () => {
      window.clearTimeout(pollTimer);
    };
  }, [isLoggedIn, documentsVersion, showToast]);

  useEffect(() => {
    if (!selected?.chatId || chat[selected.id]) return;
    chatApi.get(selected.chatId)
      .then((data) => setChat((current) => ({ ...current, [selected.id]: (data.chat.messages || []).map(toMessage) })))
      .catch((error) => showToast(error.message || "Unable to load chat history", "error"));
  }, [selected, chat, showToast]);

  const handleAuth = async (event) => {
    event.preventDefault();
    if (authSubmitting) return;
    setAuthSubmitting(true);
    try {
      const isLogin = auth.mode === "login";
      const data = await (isLogin
        ? authApi.login({ email: auth.form.email, password: auth.form.password })
        : authApi.signup(auth.form));
      const user = data.data.user;
      setLoggedUser(user);
      setIsLoggedIn(true);
      showToast(
        isLogin
          ? `Welcome back, ${user.name}!`
          : `Account created successfully, ${user.name}!`,
        "success",
      );
    } catch (error) {
      showToast(error.message || "Authentication failed", "error");
    } finally {
      setAuthSubmitting(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setAuth({
        mode: "login",
        form: { name: "", email: "", password: "" },
      });
      setLoggedUser(null);
      setIsLoggedIn(false);
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
      const data = await documentApi.upload(formData);
      setDocs((current) => [toDocument(data.document), ...current]);
      setDocumentsVersion((value) => value + 1);
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
      await documentApi.remove(id);
      setDocs((current) => current.filter((document) => document.id !== id));
      if (selected?.id === id) {
        setSelected(null);
        sessionStorage.removeItem("selectedDocumentId");
      }
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
    sessionStorage.setItem("selectedDocumentId", document.id);
    if (isMobile) setMobileView("chat");
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
      const data = await chatApi.send({
          query: content,
          documentId,
          chatId: selected.chatId,
          history,
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

  if (authLoading) return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500" style={{ background: theme.bg }}>Loading...</div>;

  if (!isLoggedIn) return <><ToastContainer toasts={toasts} removeToast={removeToast} /><AuthForm auth={auth} setAuth={setAuth} handleAuth={handleAuth} authLoading={authSubmitting} /></>;

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
          loading={documentsLoading}
          selected={selected}
          onSelect={handleDocSelect}
          showDeleteConfirm={showDeleteConfirm}
          docToDelete={docToDelete}
          setShowDeleteConfirm={setShowDeleteConfirm}
          setDocToDelete={setDocToDelete}
          handleDeleteDoc={handleDeleteDoc}
          user={loggedUser}
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
          loading={Boolean(selected?.chatId && !chat[selected.id])}
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
