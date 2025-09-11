import React from "react";
import { motion } from "framer-motion";

const LoadingBackdrop: React.FC = () => {
  return (
    <>
      {/* This is a much subtler, on-brand loading visual. 
        It's a single, slow-breathing aurora that matches the slate/sky theme.
      */}
      <motion.div
        aria-hidden="true"
        className="fixed inset-0 z-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1, opacity: 0.05 }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.5), transparent 60%)",
            filter: "blur(80px)", // A soft blur for a gentle effect
          }}
        />
      </motion.div>
      <span className="sr-only">Loading plan…</span>
    </>
  );
};

export default LoadingBackdrop;