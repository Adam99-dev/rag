import { useState } from "react";
import { theme } from "../theme";
import { Icon } from "./Icons";

const AuthForm = ({ auth, setAuth, handleAuth, authLoading }) => {
  const [showPassword, setShowPassword] = useState(false);

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
                disabled={authLoading}
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={auth.form.password}
                  onChange={(e) =>
                    setAuth({
                      ...auth,
                      form: { ...auth.form, password: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                  style={theme.input}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  disabled={authLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 transition disabled:opacity-50"
                >
                  {showPassword ? (
                    // Eye-off icon
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    // Eye icon
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={authLoading}
              className="w-full mt-1 py-3.5 text-white font-semibold text-sm rounded-2xl transition hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              style={theme.primary}
            >
              {authLoading
                ? "Please wait..."
                : auth.mode === "login"
                  ? "Login to DocuMind"
                  : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
