import { useSwipe } from './useSwipe';
import { useUIStore } from '../store/uiStore';

export const useSwipeToGoBack = () => {
  const { setMobileView } = useUIStore();

  return useSwipe({
    onSwipeRight: () => setMobileView('sidebar'),
    threshold: 80,
  });
};
