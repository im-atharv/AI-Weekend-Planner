import React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocation } from "react-router-dom";

type PageTransitionProps = {
  children: React.ReactNode;
};

// Subtle, professional page transition respecting reduced motion.
export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  const variants = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        enter: { opacity: 1, transition: { duration: 0.12 } },
        exit: { opacity: 0, transition: { duration: 0.1 } },
      }
    : {
        initial: { opacity: 0, y: 8, scale: 0.985, filter: "blur(4px)" },
        enter: {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
        },
        exit: {
          opacity: 0,
          y: -8,
          scale: 0.995,
          filter: "blur(2px)",
          transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
        },
      };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={variants}
        initial="initial"
        animate="enter"
        exit="exit"
        className="relative w-full flex flex-col items-center"
      >
        {/* Maintain a subtle ambient glow that matches the slate/cyan theme. */}
        {!prefersReducedMotion && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.03 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background:
                "radial-gradient(1100px 520px at 50% 0%, rgba(34,211,238,0.06), transparent 60%)",
              mixBlendMode: "screen",
            }}
          />
        )}
        <div className="relative z-10 w-full flex flex-col items-center">{children}</div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
