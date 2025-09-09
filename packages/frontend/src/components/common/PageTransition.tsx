import React, { useState, useEffect } from 'react';

interface PageTransitionProps {
  isTransitioning: boolean;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ isTransitioning }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isTransitioning) {
      setShow(true);
    }
  }, [isTransitioning]);

  const handleAnimationEnd = () => {
    // Hide the component from the DOM after the exit animation completes
    if (!isTransitioning) {
      setShow(false);
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div 
      className={`page-transition ${isTransitioning ? 'is-active' : 'is-exiting'}`}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="transition-panel panel-1" />
      <div className="transition-panel panel-2" />
    </div>
  );
};