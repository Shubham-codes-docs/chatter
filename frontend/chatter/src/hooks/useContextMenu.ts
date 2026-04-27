import { useRef } from 'react';

export const useContextMenu = (onOpen: () => void) => {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  const onTouchStart = (_: React.TouchEvent) => {
    longPressTimer.current = setTimeout(() => {
      onOpen();
    }, 500);
  };

  const onTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const onTouchMove = () => {
    // cancel long press if finger moves (user is scrolling)
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  return { onTouchStart, onTouchEnd, onTouchMove, isTouch: isTouch };
};
