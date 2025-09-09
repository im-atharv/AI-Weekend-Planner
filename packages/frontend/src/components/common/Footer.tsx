import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="py-4 px-4 md:px-8 border-t border-slate-800 mt-12">
      <div className="container mx-auto text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Curate. All rights reserved.</p>
        <p>Crafted by your personal AI Weekend Architect.</p>
      </div>
    </footer>
  );
};