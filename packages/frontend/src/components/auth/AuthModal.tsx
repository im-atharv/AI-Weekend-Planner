import React, { useState, useRef, useEffect } from "react";
import type { User } from "shared/types";
import { googleLogin } from "@/api";

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Record<string, any> = { email, name };
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Authentication failed");
      }
      const user: User = await res.json();
      onLogin(user);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const clientId = "558274772700-uaduokd4glfjbqa9mkdjs3pua47otgck.apps.googleusercontent.com"; // IMPORTANT: Replace with your actual Google Client ID
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
            Welcome
          </h2>
          <p className="text-sm text-center text-slate-400 mb-6">
            Sign in to save and access your plans
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              required
            />
            <button
              type="submit"
              className="w-full bg-sky-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-sky-700 transition-colors"
            >
              Continue with Email
            </button>
          </form>

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