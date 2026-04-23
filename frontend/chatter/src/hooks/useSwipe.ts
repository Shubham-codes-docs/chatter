import { useRef } from 'react';

interface UseSwipeOptions {
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
  threshold: number;
}

export const useSwipe = ({
  onSwipeRight,
  onSwipeLeft,
  threshold,
}: UseSwipeOptions) => {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!e.changedTouches || e.changedTouches.length === 0) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // ignore vertical scrolls
    if (Math.abs(deltaX) <= Math.abs(deltaY)) return;

    if (deltaX > threshold) onSwipeRight?.();
    if (deltaX < -threshold) onSwipeLeft?.();
  };

  return { onTouchStart, onTouchEnd };
};
