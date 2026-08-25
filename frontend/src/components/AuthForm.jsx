import { theme } from "../theme";
import { Icon } from "./Icons";

const AuthForm = ({ auth, setAuth, handleAuth }) => {
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
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
                  auth.mode === m ? "text-gray-800" : "text-gray-500"
                }`}
                style={
                  auth.mode === m
                    ? {
                        background: "linear-gradient(145deg, #ffffff, #f0ebe3)",
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
};

export default AuthForm;