import { create } from 'zustand';
import type { ActiveCall, CallStatus } from '../types/api.types';

interface CallStoreInterface {
  callStatus: CallStatus;
  activeCall: ActiveCall | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isCameraOff: boolean;

  // actions
  setCallStatus: (status: CallStatus) => void;
  setActiveCall: (call: ActiveCall | null) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setRemoteStream: (stream: MediaStream | null) => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  resetCall: () => void;
}

export const useCallStore = create<CallStoreInterface>((set) => ({
  callStatus: 'idle',
  activeCall: null,
  localStream: null,
  remoteStream: null,
  isMuted: false,
  isCameraOff: false,

  setCallStatus: (status) => set({ callStatus: status }),
  setActiveCall: (call) => set({ activeCall: call }),
  setLocalStream: (stream) => set({ localStream: stream }),
  setRemoteStream: (stream) => set({ remoteStream: stream }),

  toggleMute: () =>
    set((state) => {
      state.localStream
        ?.getAudioTracks()
        .forEach((track) => (track.enabled = !track.enabled));
      return { isMuted: !state.isMuted };
    }),

  toggleCamera: () =>
    set((state) => {
      state.localStream
        ?.getVideoTracks()
        .forEach((track) => (track.enabled = !track.enabled));
      return { isCameraOff: !state.isCameraOff };
    }),

  resetCall: () =>
    set((state) => {
      state.localStream?.getTracks().forEach((track) => track.stop());
      state.remoteStream?.getTracks().forEach((track) => track.stop());
      return {
        callStatus: 'idle',
        activeCall: null,
        localStream: null,
        remoteStream: null,
        isMuted: false,
        isCameraOff: false,
      };
    }),
}));
