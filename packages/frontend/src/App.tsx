import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Header } from "./components/common/Header";
import { Footer } from "./components/common/Footer";
import { AuthModal } from "./components/auth/AuthModal";
import { Toast } from "./components/common/Toast";
import { PageTransition } from "./components/common/PageTransition"; 
import { NewPlanPage } from "./pages/NewPlanPage";
import { PlansPage } from "./pages/PlansPage";
import { ChatPage } from "./pages/ChatPage";
import type { User } from "shared/types";

type ToastMessage = { message: string; type: "success" | "error" | "info" };

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const lastLocation = useRef(location);

  useEffect(() => {
    // Trigger transition when the pathname changes
    if (location.pathname !== lastLocation.current.pathname) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        // After the "slide in" completes, update the location ref and end the transition
        lastLocation.current = location;
        setIsTransitioning(false);
      }, 800); // This duration controls the whole transition sequence
      return () => clearTimeout(timer);
    }
  }, [location]);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("curateUser");
    if (loggedInUser) {
      setCurrentUser(JSON.parse(loggedInUser));
    }
  }, []);

  const showToast = (message: string, type: ToastMessage['type']) => {
    setToast({ message, type });
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("curateUser", JSON.stringify(user));
    setAuthModalOpen(false);
    showToast(`Welcome back, ${user.name}!`, "success");
    navigate('/plans');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("curateUser");
    if (location.pathname.startsWith('/plans') || location.pathname.startsWith('/chat')) {
        navigate('/newplan');
    }
  };

  return (
    <div className="min-h-screen font-sans flex flex-col bg-slate-900 text-slate-200">
      <PageTransition isTransitioning={isTransitioning} />
      
      <Header
        user={currentUser}
        onLogin={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />
      {/* We add a key to the main element to force a re-render and trigger the new animation */}
      <main key={location.pathname} className="flex-grow container mx-auto px-4 py-8 md:py-12 flex flex-col items-center justify-center w-full main-content">
        <Routes>
          <Route path="/" element={<NewPlanPage user={currentUser} onLoginRequest={() => setAuthModalOpen(true)} />} />
          <Route path="/newplan" element={<NewPlanPage user={currentUser} onLoginRequest={() => setAuthModalOpen(true)} />} />
          <Route path="/plans" element={<PlansPage user={currentUser} onLoginRequest={() => setAuthModalOpen(true)} />} />
          <Route path="/chat" element={<ChatPage user={currentUser} showToast={showToast} onLoginRequest={() => setAuthModalOpen(true)} />} />
          <Route path="/chat/:planId" element={<ChatPage user={currentUser} showToast={showToast} onLoginRequest={() => setAuthModalOpen(true)} />} />
        </Routes>
      </main>
      <Footer />
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          onLogin={handleLogin}
        />
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default App;