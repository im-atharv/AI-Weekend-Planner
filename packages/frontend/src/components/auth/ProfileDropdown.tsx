import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import type { User } from "shared/types";
import { PlansIcon, LogoutIcon } from "@/assets/icons";

interface ProfileDropdownProps {
  user: User;
  onLogout: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name?: string) => {
    if (!name || typeof name !== 'string') {
      return '??'; // Provide a fallback
    }
    const names = name.split(' ');
    if (names.length > 1 && names[0] && names[names.length - 1]) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sky-400 font-bold border-2 border-slate-600 hover:border-sky-500 transition-colors"
        aria-label="Open user menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {getInitials(user.name)}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-20 animate-fade-in-fast">
          <div className="p-2 border-b border-slate-700">
             <p className="text-sm font-semibold text-white truncate">{user.name || 'User'}</p>
             <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
          <ul className="py-1" role="menu">
            <li role="none">
              <Link to="/plans" onClick={() => setIsOpen(false)} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700" role="menuitem">
                <PlansIcon className="w-4 h-4" />
                <span>My Plans</span>
              </Link>
            </li>
            <li role="none">
              <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-400 hover:bg-slate-700" role="menuitem">
                <LogoutIcon className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};