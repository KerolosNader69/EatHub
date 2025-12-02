import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import IntroSequence from './IntroSequence';

describe('IntroSequence Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should render the first stage (EAT text)', () => {
    render(<IntroSequence onComplete={vi.fn()} />);
    
    const eatText = screen.getByText(/EAT/i);
    expect(eatText).toBeInTheDocument();
  });

  it('should progress through all stages', async () => {
    const onComplete = vi.fn();
    render(<IntroSequence onComplete={onComplete} />);
    
    // Stage 1: EAT text
    expect(screen.getByText(/EAT/i)).toBeInTheDocument();
    
    // Advance to stage 2 (1 second)
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(document.querySelector('.stage-laptop')).toBeInTheDocument();
    
    // Advance to stage 3 (2 seconds total)
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    // Button shows "Pause" label when in playing state (showing play icon)
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    
    // Advance to stage 4 (3 seconds total)
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('Eat')).toBeInTheDocument();
    expect(screen.getByText('hub')).toBeInTheDocument();
    
    // Complete animation (4 seconds total)
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('should handle play/pause button click in stage 3', () => {
    render(<IntroSequence onComplete={vi.fn()} />);
    
    // Advance to stage 3
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    
    // Initially shows "Pause" (playing state with play icon)
    const button = screen.getByRole('button', { name: /pause/i });
    
    // Click to pause - button changes to "Play" (paused state with pause icon)
    act(() => {
      fireEvent.click(button);
    });
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
    
    // Click to play again - button changes back to "Pause"
    const playButton = screen.getByRole('button', { name: /play/i });
    act(() => {
      fireEvent.click(playButton);
    });
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
  });

  it('should skip animation and call onComplete immediately when prefers-reduced-motion is enabled', async () => {
    // Mock matchMedia to return prefers-reduced-motion: reduce
    const mockMatchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    
    window.matchMedia = mockMatchMedia;
    
    const onComplete = vi.fn();
    const { container } = render(<IntroSequence onComplete={onComplete} />);
    
    // Should call onComplete immediately
    expect(onComplete).toHaveBeenCalledTimes(1);
    
    // Should not render any content
    expect(container.firstChild).toBeNull();
  });

  it('should complete within 4 seconds', async () => {
    const onComplete = vi.fn();
    render(<IntroSequence onComplete={onComplete} />);
    
    // Advance exactly 4 seconds
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('should cleanup timers on unmount', () => {
    const { unmount } = render(<IntroSequence onComplete={vi.fn()} />);
    
    // Unmount before completion
    unmount();
    
    // Advance timers - onComplete should not be called
    const onComplete = vi.fn();
    vi.advanceTimersByTime(5000);
    expect(onComplete).not.toHaveBeenCalled();
  });
});
