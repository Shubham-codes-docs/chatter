import { create } from 'zustand';

interface UIStore {
  mobileView: 'sidebar' | 'chat';
  setMobileView: (view: 'sidebar' | 'chat') => void;
}

export const useUIStore = create<UIStore>((set) => ({
  mobileView: 'sidebar',
  setMobileView: (view) => {
    set({
      mobileView: view,
    });
  },
}));
