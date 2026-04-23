import { useState, useRef } from 'react';
import { useSwipe } from './useSwipe';
import type { Message } from '../types/api.types';

export const useSwipeToReply = (
  message: Message,
  onReply: (message: Message) => void
) => {
  const isTouch = useRef(window.matchMedia('(pointer:coarse)').matches);
  const [swipeOffSet, setSwipeOffSet] = useState(0);
  const [isSwipping, setIsSwipping] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(0);

  // using base useSwipe hook for gesture detection
  const { onTouchEnd: baseOnTouchEnd } = useSwipe({
    onSwipeRight: () => onReply(message),
    threshold: 50,
  });

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsSwipping(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const deltaX = e.touches[0].clientX - touchStartX.current;
    if (deltaX < 0) return;
    setSwipeOffSet(Math.min(deltaX, 80));
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    baseOnTouchEnd(e);
    setSwipeOffSet(0);
    setIsSwipping(false);
  };

  const onMouseEnter = () => !isTouch.current && setIsHovered(true);
  const onMouseLeave = () => !isTouch.current && setIsHovered(false);

  return {
    swipeOffSet,
    isSwipping,
    isHovered,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onMouseEnter,
    onMouseLeave,
  };
};
