import React from 'react';
import type SimplePeer from 'simple-peer';
import { useCallStore } from '../../store/callStore';
import { getSocket } from '../../socket/socketClient';
import { SOCKET_EVENTS } from '../../socket/events';
import {
  BsCameraVideo,
  BsCameraVideoOff,
  BsMic,
  BsMicMute,
  BsTelephone,
} from 'react-icons/bs';

interface CallControlsProps {
  recipientId: string;
  callId: string;
  peerRef: React.RefObject<SimplePeer.Instance | null>;
}

const CallControls = ({ recipientId, callId, peerRef }: CallControlsProps) => {
  const {
    isMuted,
    isCameraOff,
    activeCall,
    toggleMute,
    toggleCamera,
    resetCall,
  } = useCallStore();

  // handle end call
  const handleEndCall = () => {
    const socket = getSocket();

    if (!socket) return;

    socket.emit(SOCKET_EVENTS.END_CALL, {
      callId,
      recipientId,
    });

    peerRef.current?.destroy();
    peerRef.current = null;
    resetCall();
  };
  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      <button
        onClick={toggleMute}
        className={`w-14 h-14 round-full flex items-center justify-center transistion-all duration-200 ${isMuted ? 'bg-error text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
      >
        {isMuted ? <BsMicMute size={22} /> : <BsMic size={20} />}
      </button>
      {activeCall?.callType === 'video' && (
        <button
          onClick={toggleCamera}
          className={`w-14 h-14 round-full flex items-center justify-center transistion-all duration-200 ${isCameraOff ? 'bg-error text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
        >
          {isCameraOff ? (
            <BsCameraVideoOff size={22} />
          ) : (
            <BsCameraVideo size={20} />
          )}
        </button>
      )}
      <button
        onClick={handleEndCall}
        className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 bg-error text-white hover:bg-error-dark shadow-lg"
      >
        <BsTelephone size={22} className="text-white rotate-[135deg]" />
      </button>
    </div>
  );
};

export default CallControls;
