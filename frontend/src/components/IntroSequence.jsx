import { useState, useEffect } from 'react';
import './IntroSequence.css';

const IntroSequence = ({ onComplete }) => {
  const [stage, setStage] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [skipAnimation, setSkipAnimation] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      setSkipAnimation(true);
      onComplete?.();
      return;
    }

    // Stage 1: EAT text with animated dot (0-1s)
    const timer1 = setTimeout(() => {
      setStage(2);
    }, 1000);

    // Stage 2: Laptop icon with upload arrow (1-2s)
    const timer2 = setTimeout(() => {
      setStage(3);
    }, 2000);

    // Stage 3: Play/pause button interaction (2-3s)
    const timer3 = setTimeout(() => {
      setStage(4);
    }, 3000);

    // Stage 4: Final logo (3-4s)
    const timer4 = setTimeout(() => {
      onComplete?.();
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  const handlePlayPauseClick = () => {
    setIsPaused(!isPaused);
  };

  if (skipAnimation) {
    return null;
  }

  return (
    <div className="intro-sequence">
      {/* Stage 1: EAT text with animated dot */}
      {stage === 1 && (
        <div className="intro-stage stage-eat">
          <div className="eat-text">
            EAT
            <span className="animated-dot"></span>
          </div>
        </div>
      )}

      {/* Stage 2: Laptop icon with upload arrow */}
      {stage === 2 && (
        <div className="intro-stage stage-laptop">
          <svg className="laptop-icon" viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
            {/* Laptop screen */}
            <rect x="15" y="10" width="70" height="45" fill="none" stroke="#FFFFFF" strokeWidth="2" />
            {/* Laptop base */}
            <path d="M 10 55 L 15 55 L 15 57 L 85 57 L 85 55 L 90 55 L 95 62 L 5 62 Z" fill="#FFFFFF" />
            {/* Upload arrow */}
            <g className="upload-arrow">
              <line x1="50" y1="45" x2="50" y2="20" stroke="#C41E3A" strokeWidth="2" />
              <polyline points="45,25 50,20 55,25" fill="none" stroke="#C41E3A" strokeWidth="2" />
            </g>
          </svg>
        </div>
      )}

      {/* Stage 3: Play/pause button with click interaction */}
      {stage === 3 && (
        <div className="intro-stage stage-play-pause">
          <button 
            className={`play-pause-button ${isPaused ? 'paused' : 'playing'}`}
            onClick={handlePlayPauseClick}
            aria-label={isPaused ? 'Play' : 'Pause'}
          >
            {!isPaused ? (
              // Play icon (triangle)
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <polygon points="8,5 8,19 19,12" fill="#FFFFFF" />
              </svg>
            ) : (
              // Pause icon (two bars)
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="7" y="5" width="4" height="14" fill="#FFFFFF" />
                <rect x="13" y="5" width="4" height="14" fill="#FFFFFF" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Stage 4: Final logo */}
      {stage === 4 && (
        <div className="intro-stage stage-logo">
          <div className="final-logo">
            <span className="logo-eat">Eat</span>
            <span className="logo-hub">hub</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntroSequence;
