import React, { useState, useRef, useEffect } from "react";
import type { User } from "shared/types";
import { googleLogin, emailLogin, emailRegister } from "@/api";

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin }) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const isValidEmail = (value: string) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(value);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      // Client-side validation
      if (!isValidEmail(email.trim())) {
        throw new Error("Please enter a valid email address");
      }
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }
      if (mode === "signup" && !name.trim()) {
        throw new Error("Please enter your full name");
      }

      let user: User;
      if (mode === "signup") {
        user = await emailRegister(name.trim(), email.trim(), password);
      } else {
        user = await emailLogin(email.trim(), password);
      }
      onLogin(user);
    } catch (err: any) {
      console.error(err);
      // Normalize auth error message for wrong credentials
      let msg = String(err?.message || "Authentication failed");
      if (msg.toLowerCase().includes("invalid email or password")) {
        msg = "Invalid Credentials";
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ;
    const google = (window as any).google;
    if (google?.accounts?.id && googleBtnRef.current) {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          try {
            const user = await googleLogin(response.credential);
            onLogin(user);
          } catch (err) {
            console.error(err);
          }
        },
      });
      google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "filled_black",
        size: "large",
        text: "continue_with",
        shape: "pill",
        logo_alignment: "left",
      });
    }
  }, [onLogin]);

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-sm border border-slate-700"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <div className="p-6">
          <h2
            id="auth-modal-title"
            className="text-2xl font-bold text-center text-white mb-2"
          >
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-sm text-center text-slate-400 mb-6">
            {mode === "login" ? "Sign in to save and access your plans" : "Sign up to save and access your plans"}
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            {mode === "signup" && (
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                required
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (error) setError(null); }}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              required
              minLength={6}
            />

            {error && (
              <div className="text-red-400 text-sm" role="alert" aria-live="assertive">{error}</div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-sky-600 disabled:opacity-70 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-sky-700 transition-colors"
            >
              {submitting
                ? (mode === "login" ? "Signing in..." : "Creating account...")
                : (mode === "login" ? "Continue with Email" : "Sign Up with Email")}
            </button>
          </form>

          <div className="mt-3 text-center text-slate-400 text-sm">
            {mode === "login" ? (
              <>
                Don\'t have an account?{" "}
                <button
                  type="button"
                  className="text-sky-400 hover:underline"
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                  }}
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-sky-400 hover:underline"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                >
                  Log In
                </button>
              </>
            )}
          </div>

          <div className="flex items-center my-6">
            <span className="flex-grow border-t border-slate-700"></span>
            <span className="px-3 text-sm text-slate-500">OR</span>
            <span className="flex-grow border-t border-slate-700"></span>
          </div>

      <div
        ref={googleBtnRef}
        className="w-full flex items-center justify-center my-2"
      ></div>
        </div>
      </div>
    </div>
  );
};
