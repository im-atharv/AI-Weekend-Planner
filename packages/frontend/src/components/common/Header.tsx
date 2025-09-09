import React from "react";
import { Link } from "react-router-dom";
import type { User } from "shared/types";
import { ProfileDropdown } from "@/components/auth/ProfileDropdown";

interface HeaderProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogin, onLogout }) => {
  return (
    <header className="sticky top-0 z-50 py-3 px-4 md:px-8 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/newplan" className="cursor-pointer">
          <h1 className="text-2xl font-bold tracking-wider text-white">
            C<span className="text-sky-500">U</span>RATE
          </h1>
          <p className="text-xs text-slate-400 -mt-1 tracking-widest">
            AI WEEKEND ARCHITECT
          </p>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <ProfileDropdown user={user} onLogout={onLogout} />
          ) : (
            <button
              onClick={onLogin}
              className="px-4 py-2 text-sm font-semibold bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              Login / Sign Up
            </button>
          )}
        </div>
      </div>
    </header>
  );
};