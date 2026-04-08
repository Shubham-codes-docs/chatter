import { BsCameraVideo, BsTelephone, BsTelephoneX } from 'react-icons/bs';
import { SOCKET_EVENTS } from '../../socket/events';
import { getSocket } from '../../socket/socketClient';
import { useCallStore } from '../../store/callStore';

const IncomingCall = () => {
  const { activeCall, callStatus, setCallStatus, resetCall } = useCallStore();

  if (callStatus !== 'ringing' || !activeCall) return null;

  const handleAccept = () => {
    const socket = getSocket();
    socket?.emit(SOCKET_EVENTS.CALL_ACCEPT, {
      callId: activeCall.callId,
      callerId: activeCall.caller.id,
    });
    setCallStatus('connected');
  };

  const handleReject = () => {
    const socket = getSocket();
    socket?.emit(SOCKET_EVENTS.CALL_REJECT, {
      callId: activeCall.callId,
      callerId: activeCall.caller.id,
    });
    resetCall();
  };
  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-dark-300 border border-dark-100 rounded-2xl p-4 animate-slide-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="avatar avatar-md shrink-0">
          {activeCall.caller.fullName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="body-semibold text-white truncate">
            {activeCall.caller.fullName}
          </p>
          <div className="flex items-center gap-1.5">
            {activeCall.callType === 'video' ? (
              <BsCameraVideo size={12} className="text-light-400" />
            ) : (
              <BsTelephone size={12} className="text-light-400" />
            )}
            <p className="small-regular text-light-400">
              Incoming {activeCall.callType} call
            </p>
          </div>
        </div>
        <div className="w-3 h-3 rounded-full bg-success animate-pulse shrink-0" />
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleReject}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-error/20 hover:bg-error:30 text-error transition-colors duration-150"
        >
          <BsTelephoneX size={16} />
          <span className="small-semibold">Decline</span>
        </button>
        <button
          onClick={handleAccept}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-success/20 hover:bg-success:30 text-success transition-colors duration-150"
        >
          <BsTelephone size={16} />
          <span className="small-semibold">Accept</span>
        </button>
      </div>
    </div>
  );
};

export default IncomingCall;
