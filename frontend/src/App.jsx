import React, { useState, useRef, useEffect } from "react";

const Icon = {
  Logo: ({ className }) => (
    <img src="../icons/logo.png" alt="" className={className} />
  ),
  Profile: ({ className }) => (
    <img className={className} src="../icons/profile_icon.png" alt="" />
  ),
  AI: ({ className }) => (
    <video
      className={className}
      src="../icons/ai_icon.webm"
      autoPlay
      loop
      muted
      playsInline
    />
  ),
  Upload: ({ className }) => (
    <img className={className} src="../icons/upload_icon.png" alt="" />
  ),
  File: ({ className }) => (
    <img className={className} src="../icons/file_icon.png" alt="" />
  ),
  Search: ({ className }) => (
    <img className={className} src="../icons/search_icon.png" alt="" />
  ),
  Send: ({ className }) => (
    <img className={className} src="../icons/send_icon.png" alt="" />
  ),
  Trash: ({ className }) => (
    <img className={className} src="../icons/delete_icon.png" alt="" />
  ),
  Database: ({ className }) => (
    <img className={className} src="../icons/database_icon.png" alt="" />
  ),
  Logout: ({ className }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  ),
  Settings: ({ className }) => (
    <img className={className} src="../icons/setting_icon.png" alt="" />
  ),
  ChevronLeft: ({ className }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 19l-7-7 7-7"
      />
    </svg>
  ),
};

const theme = {
  bg: "linear-gradient(160deg, #d4cfc8 0%, #e8e4de 45%, #f0ebe3 100%)",
  panel: {
    background: "linear-gradient(145deg, #fdfaf5, #f0ebe3)",
    borderRadius: "20px",
    boxShadow:
      "0 10px 40px rgba(0,0,0,0.08), 0 2px 10px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.95)",
    border: "1px solid rgba(255,255,255,0.55)",
  },
  input: {
    background: "linear-gradient(145deg, #ffffff, #f5f2ed)",
    borderRadius: "14px",
    boxShadow:
      "inset 0 2px 5px rgba(0,0,0,0.05), 0 1px 0 rgba(255,255,255,0.9)",
    border: "1px solid #d8d2ca",
  },
  button: {
    background: "linear-gradient(145deg, #ffffff, #e8e4de)",
    borderRadius: "14px",
    boxShadow:
      "0 4px 14px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95)",
    border: "1px solid rgba(255,255,255,0.7)",
    cursor: "pointer",
  },
  primary: {
    background: "linear-gradient(145deg, #3b82f6, #2563eb)",
    boxShadow:
      "0 8px 28px rgba(59,130,246,0.32), inset 0 1px 0 rgba(255,255,255,0.25)",
  },
  selected: {
    background: "linear-gradient(145deg, #eff6ff, #dbeafe)",
    boxShadow:
      "0 6px 22px rgba(59,130,246,0.16), inset 0 1px 0 rgba(255,255,255,0.9)",
    border: "1px solid rgba(59,130,246,0.22)",
  },
};

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
  const fileRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, selected, typing]);

  const handleAuth = (e) => {
    e.preventDefault();
    setAuth({
      ...auth,
      isAuth: true,
      user: {
        name:
          auth.mode === "login"
            ? auth.form.email.split("@")[0] || "User"
            : auth.form.name || "User",
        email: auth.form.email,
      },
    });
  };

  const logout = () => {
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
  };

  const upload = (files) => {
    if (!files?.length) return;
    const newDocs = Array.from(files).map((f) => ({
      id: Date.now() + Math.random() * 1000,
      name: f.name,
      size: (f.size / 1024 / 1024).toFixed(1) + " MB",
      status: "loading",
      loadingText: "Thinking...",
      progress: 0,
      pages: Math.floor(Math.random() * 30) + 5,
      file: f,
    }));
    setDocs((prev) => [...prev, ...newDocs]);
    newDocs.forEach((doc) => {
      const steps = [
        { text: "Thinking...", progress: 10 },
        { text: "Analyzing content...", progress: 25 },
        { text: "Embedding vectors...", progress: 45 },
        { text: "Clauding patterns...", progress: 65 },
        { text: "Indexing document...", progress: 85 },
        { text: "Ready", progress: 100 },
      ];
      let i = 0;
      const t = setInterval(() => {
        if (i < steps.length) {
          const s = steps[i];
          setDocs((prev) =>
            prev.map((d) =>
              d.id === doc.id
                ? {
                    ...d,
                    loadingText: s.text,
                    progress: s.progress,
                    status: s.progress === 100 ? "ready" : "loading",
                  }
                : d,
            ),
          );
          i++;
        } else clearInterval(t);
      }, 800);
    });
  };

  const delDoc = (id) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
    if (selected?.id === id) setSelected(null);
    setChat((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const sendMsg = () => {
    if (!msg.trim() || !selected) return;
    const userMsg = {
      id: Date.now(),
      role: "user",
      content: msg.trim(),
      citations: [],
    };
    setChat((prev) => ({
      ...prev,
      [selected.id]: [...(prev[selected.id] || []), userMsg],
    }));
    setMsg("");
    setTyping(true);
    const currentMsg = msg.trim();
    setTimeout(() => {
      const responses = [
        {
          content: `Based on the content in "${selected.name}", I found several relevant insights related to "${currentMsg.substring(0, 50)}...".`,
          citations: [
            { page: 3, text: "Key findings, page 3" },
            { page: 7, text: "Methodology, page 7" },
          ],
        },
        {
          content: `Analyzing the retrieved context, "${currentMsg.substring(0, 40)}..." relates to core themes in the text.`,
          citations: [
            { page: 12, text: "Case studies, page 12" },
            { page: 18, text: "Implementation, page 18" },
          ],
        },
        {
          content: `The document "${selected.name}" contains relevant information about your query.`,
          citations: [
            { page: 5, text: "Literature review, page 5" },
            { page: 9, text: "Analysis results, page 9" },
          ],
        },
      ];
      const picked = responses[Math.floor(Math.random() * responses.length)];
      setChat((prev) => ({
        ...prev,
        [selected.id]: [
          ...(prev[selected.id] || []),
          { id: Date.now() + 1, role: "ai", ...picked },
        ],
      }));
      setTyping(false);
    }, 2000);
  };

  const filtered = docs.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDocSelect = (doc) => {
    setSelected(doc);
    if (isMobile) setMobileView("chat");
  };

  if (!auth.isAuth) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: theme.bg }}
      >
        <div className="w-full max-w-[400px]" style={theme.panel}>
          <div className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="inline-flex w-14 h-14 mb-4 rounded-2xl overflow-hidden">
                <Icon.Logo className="w-14 h-14" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">DocuMind</h1>
              <p className="mt-1 text-sm text-gray-500">
                AI-Powered Document Intelligence
              </p>
            </div>
            <div className="flex mb-6 p-1 rounded-2xl" style={theme.input}>
              {["login", "signup"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setAuth({ ...auth, mode: m })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${auth.mode === m ? "text-gray-800" : "text-gray-500"}`}
                  style={
                    auth.mode === m
                      ? {
                          background:
                            "linear-gradient(145deg, #ffffff, #f0ebe3)",
                          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                        }
                      : {}
                  }
                >
                  {m === "login" ? "Login" : "Sign Up"}
                </button>
              ))}
            </div>
            <form onSubmit={handleAuth} className="space-y-3.5">
              {auth.mode === "signup" && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={auth.form.name}
                    onChange={(e) =>
                      setAuth({
                        ...auth,
                        form: { ...auth.form, name: e.target.value },
                      })
                    }
                    className="w-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                    style={theme.input}
                    placeholder="John Doe"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={auth.form.email}
                  onChange={(e) =>
                    setAuth({
                      ...auth,
                      form: { ...auth.form, email: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                  style={theme.input}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={auth.form.password}
                  onChange={(e) =>
                    setAuth({
                      ...auth,
                      form: { ...auth.form, password: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                  style={theme.input}
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full mt-1 py-3.5 text-white font-semibold text-sm rounded-2xl transition hover:-translate-y-0.5"
                style={theme.primary}
              >
                {auth.mode === "login" ? "Login to DocuMind" : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen flex overflow-hidden"
      style={{ background: theme.bg, color: "#1f2937" }}
    >
      <style>{`* { scrollbar-width: none; -ms-overflow-style: none; } *::-webkit-scrollbar { display: none; }`}</style>

      {(!isMobile || mobileView === "docs") && (
        <aside
          className={`${isMobile ? "w-full" : "w-[280px] lg:w-[300px]"} flex-shrink-0 flex flex-col h-full p-3 gap-3`}
        >
          <div
            className="p-3.5 cursor-pointer transition flex-shrink-0"
            style={{
              ...theme.panel,
              ...(drag
                ? {
                    background: "linear-gradient(145deg, #eff6ff, #dbeafe)",
                    boxShadow: "0 8px 32px rgba(59,130,246,0.18)",
                  }
                : {}),
            }}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDrag(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              if (e.dataTransfer.files.length)
                upload([e.dataTransfer.files[0]]);
            }}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) upload([e.target.files[0]]);
                e.target.value = "";
              }}
            />
            <div className="text-center">
              <Icon.Upload
                className={`w-10 h-10 mx-auto mb-2 text-blue-600 transition ${drag ? "scale-110" : ""}`}
              />
              <h3 className="font-semibold text-sm text-gray-800">
                Upload Document
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Drag & drop or click · PDF only
              </p>
            </div>
          </div>

          <div
            className="px-3 py-2.5 flex items-center gap-2 flex-shrink-0"
            style={theme.input}
          >
            <Icon.Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="flex-1 bg-transparent focus:outline-none text-sm placeholder:text-gray-400"
            />
          </div>

          <div
            className="flex-1 min-h-0 overflow-hidden rounded-[20px]"
            style={theme.panel}
          >
            <div className="h-full overflow-y-auto p-2 space-y-2">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-10 text-gray-400">
                  <Icon.File className="w-11 h-11 mb-2 opacity-40" />
                  <p className="text-sm font-medium">No documents yet</p>
                  <p className="text-xs mt-1 opacity-70">
                    Upload a PDF to get started
                  </p>
                </div>
              ) : (
                filtered.map((doc) => {
                  const isReady = doc.status === "ready";
                  const isSelected = selected?.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      className={`p-3 transition ${isReady ? "cursor-pointer hover:-translate-y-0.5" : "cursor-not-allowed opacity-70"}`}
                      style={{
                        ...theme.panel,
                        borderRadius: "14px",
                        ...(isSelected ? theme.selected : {}),
                        ...(!isReady ? { pointerEvents: "none" } : {}),
                      }}
                      onClick={isReady ? () => handleDocSelect(doc) : undefined}
                    >
                      <div className="flex items-start gap-2.5">
                        <Icon.File className="w-7 h-7 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate text-gray-800">
                            {doc.name}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {doc.size} · {doc.pages} pages
                          </p>
                          <div className="flex items-center justify-between mt-1.5">
                            {doc.status === "loading" ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium animate-pulse">
                                  {doc.loadingText}
                                </span>
                                <span className="text-[11px] font-semibold text-blue-600">
                                  {doc.progress}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium capitalize">
                                {doc.status}
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                delDoc(doc.id);
                              }}
                              disabled={!isReady}
                              className={`p-1 rounded-lg transition ${isReady ? "hover:bg-red-50 text-gray-400 hover:text-red-500" : "text-gray-300"}`}
                            >
                              <Icon.Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div
            className="flex-shrink-0 p-3 flex items-center justify-between gap-2 relative"
            style={theme.panel}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Icon.Logo className="w-8 h-8 rounded-xl flex-shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-sm text-gray-800 truncate">
                    DocuMind
                  </h1>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-900 text-white font-semibold">
                    AI
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 truncate">
                  {auth.user?.name || "Guest"}
                </p>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                title="Profile"
                className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 hover:text-blue-600 transition"
              >
                <Icon.Profile className="w-8 h-8 cursor-pointer" />
              </button>

              {profileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileMenuOpen(false)}
                  />
                  <div
                    className="absolute bottom-full right-0 mb-2 w-48 rounded-xl shadow-lg z-50 overflow-hidden"
                    style={{
                      ...theme.panel,
                      border: "1px solid rgba(0,0,0,0.1)",
                    }}
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {auth.user?.name || "Guest"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {auth.user?.email || "Not signed in"}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        console.log("Open profile settings");
                      }}
                      className="cursor-pointer font-semibold w-full px-4 py-2.5 flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <Icon.Settings className="w-5 h-5" />
                      Settings
                    </button>
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        logout();
                      }}
                      className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 transition cursor-pointer font-semibold"
                    >
                      <Icon.Logout className="w-4 h-4 ml-1" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </aside>
      )}

      {(!isMobile || mobileView === "chat") && (
        <main
          className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden m-3 ml-3"
          style={{ ...theme.panel, borderRadius: "20px" }}
        >
          {!selected ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center max-w-xs">
                <Icon.AI className="w-32 h-32 mx-auto mb-4 opacity-80" />
                <h3 className="text-lg font-semibold text-gray-800 mb-1.5">
                  Welcome to DocuMind AI
                </h3>
                <p className="text-sm text-gray-500">
                  Upload a document and select it to start asking questions.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="shrink-0 px-4 py-3 border-b border-gray-200/50 flex items-center gap-2.5">
                {isMobile && (
                  <button
                    onClick={() => setMobileView("docs")}
                    className="p-1.5 -ml-1 rounded-lg hover:bg-black/5"
                  >
                    <Icon.ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                )}
                <Icon.AI className="w-10 h-10 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-sm truncate text-gray-800">
                    {selected.name}
                  </h2>
                  <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    AI Ready · Ask anything
                  </p>
                </div>
                <div
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 max-w-[200px]"
                  style={{
                    background: "linear-gradient(145deg, #f8f5f0, #ebe7e1)",
                    borderRadius: "10px",
                  }}
                >
                  <Icon.Database className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-medium text-gray-700 truncate">
                    {selected.name}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    · {selected.pages}p
                  </span>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5">
                {(chat[selected.id] || []).length === 0 && (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <p className="text-sm font-medium">No messages yet</p>
                      <p className="text-xs mt-1 opacity-70">
                        Ask a question about “{selected.name}”
                      </p>
                    </div>
                  </div>
                )}
                {(chat[selected.id] || []).map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] px-3.5 py-2.5 ${
                        m.role === "user"
                          ? "bg-blue-600 text-white rounded-2xl rounded-br-md"
                          : "bg-white/90 text-gray-800 rounded-2xl rounded-bl-md"
                      }`}
                      style={{
                        boxShadow:
                          m.role === "user"
                            ? "0 4px 16px rgba(37,99,235,0.22)"
                            : "0 4px 18px rgba(0,0,0,0.07)",
                      }}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {m.content}
                      </p>
                      {m.citations?.length > 0 && (
                        <div className="mt-2.5 pt-2.5 border-t border-gray-200/60">
                          <p className="text-[10px] font-semibold mb-1 text-gray-500 uppercase tracking-wider">
                            Sources
                          </p>
                          {m.citations.map((c, i) => (
                            <div
                              key={i}
                              className="text-xs text-gray-500 flex items-start gap-1.5 mb-0.5"
                            >
                              <Icon.Database className="w-3 h-3 mt-0.5 flex-shrink-0 opacity-60" />
                              <span>{c.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex justify-start">
                    <div
                      className="bg-white/90 rounded-2xl rounded-bl-md px-4 py-3"
                      style={{ boxShadow: "0 4px 18px rgba(0,0,0,0.07)" }}
                    >
                      <div className="flex gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 150}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>

              <div className="flex-shrink-0 p-3 border-t border-gray-200/50">
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !e.shiftKey && sendMsg()
                    }
                    placeholder={`Ask about ${selected.name}...`}
                    className="flex-1 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/25 placeholder:text-gray-400"
                    style={theme.input}
                  />
                  <button
                    onClick={sendMsg}
                    disabled={!msg.trim()}
                    className="w-11 h-11 flex items-center justify-center text-white rounded-xl transition hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
                    style={theme.primary}
                  >
                    <Icon.Send className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      )}
    </div>
  );
};

export default App;
