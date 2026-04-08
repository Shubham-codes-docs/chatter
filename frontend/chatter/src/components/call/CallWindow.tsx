import { useCallStore } from '../../store/callStore';
import { useAuthStore } from '../../store/authStore';
import { useWebRTC } from '../../hooks/useWebRTC';
import CallControls from './CallControls';
import VideoTile from './VideoTile';

const CallWindow = () => {
  const { activeCall, callStatus, localStream, remoteStream, isCameraOff } =
    useCallStore();
  const { user } = useAuthStore();

  const isInitiator = user?.id === activeCall?.caller.id;

  const { peerRef } = useWebRTC({
    isInitiator,
    recipientId: isInitiator
      ? activeCall?.recipient.id || ''
      : activeCall?.caller.id || '',
    callType: activeCall?.callType || 'audio',
  });

  if (!activeCall) return null;

  const remoteParticipant = isInitiator
    ? activeCall.recipient
    : activeCall.caller;

  return (
    <div className="fixed inset-0 z-50 bg-dark-500/95 flex flex-col items-center justify-between p-6">
      <div className="class-center mt-8">
        <p className="small-regular text-light-400 uppercase tracking-widest mb-2">
          {callStatus === 'calling' && 'Calling...'}
          {callStatus === 'connected' && 'Connected'}
          {callStatus === 'ended' && 'Call Ended'}
        </p>
        <h2 className="h2-bold text-white">{remoteParticipant?.fullName}</h2>
        <p className="body-regular text-light-500">
          @{remoteParticipant?.username}
        </p>
      </div>
      {/*Video Tiles */}
      {activeCall.callType === 'video' ? (
        <div className="relative w-full max-w-2xl flex-1 my-6">
          <VideoTile
            stream={remoteStream}
            className="w-full h-full object-cover rounded-2xl bg-dark-400 min-h-[300px]"
          />
          {!isCameraOff && (
            <VideoTile
              stream={localStream}
              muted={true}
              className="absolute bottom-4 right-4 w-32 h-24 object-cover rounded-xl border-2 border-white/20"
            />
          )}
          {/* remote avatar fallback when no video */}
          {!remoteStream && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="avatar w-24 h-24 text-3xl">
                {remoteParticipant.fullName.charAt(0)}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="avatar w-32 h-32 text-4xl ring-4 ring-white/20">
              {remoteParticipant.fullName.charAt(0)}
            </div>
            {callStatus === 'connected' && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="small-regular text-success">
                  Audio connected
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      <CallControls
        recipientId={
          isInitiator ? activeCall.recipient.id : activeCall.caller.id
        }
        callId={activeCall.callId}
        peerRef={peerRef}
      />
    </div>
  );
};

export default CallWindow;
