import { useState } from 'react';
import { BsTelephone, BsCameraVideo } from 'react-icons/bs';
import { HiDotsVertical } from 'react-icons/hi';
import UserProfile from '../user/UserProfile';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import {
  getConversationName,
  getOnlineStatus,
} from '../../utils/conversationUtils';
import GroupInfoModal from '../modals/GroupInfoModal';
import { useCallStore } from '../../store/callStore';
import type { CallType } from '../../types/api.types';
import { getSocket } from '../../socket/socketClient';
import { SOCKET_EVENTS } from '../../socket/events';

const ChatHeader = () => {
  const [showUserProfile, setShowUSerProfile] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const { activeConversationId, conversations, onlineUsers } = useChatStore();
  const { user } = useAuthStore();
  const { callStatus, setCallStatus, setActiveCall } = useCallStore();

  const handleHeaderClick = () => {
    if (activeConversation?.type === 'group') {
      setShowGroupInfo(true);
    } else {
      setShowUSerProfile(true);
    }
  };

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  if (!activeConversation || !user) return;

  const otherParticipant = getConversationName(activeConversation, user?.id);
  const otherParticipantUser = activeConversation.participants.find(
    (p) => p.userId !== user.id
  );
  const isOnline = getOnlineStatus(activeConversation, user.id, onlineUsers);

  // handle start call
  const initiateCall = (callType: CallType) => {
    const socket = getSocket();
    if (!socket || !otherParticipantUser) return;
    if (callStatus !== 'idle') return;
    setActiveCall({
      callId: '',
      conversationId: activeConversation.id,
      callType,
      caller: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        avatar: user.avatar,
      },
      recipient: {
        id: otherParticipantUser.userId,
        fullName: otherParticipantUser.user.fullName,
        username: otherParticipantUser.user.username,
        avatar: otherParticipantUser.user.avatar,
      },
    });
    setCallStatus('calling');
    socket.emit(SOCKET_EVENTS.CALL_INITIATE, {
      conversationId: activeConversation.id,
      recipientId: otherParticipantUser.userId,
      callType,
    });
  };

  return (
    <>
      <div className="h-16 bg-light50_dark300 border-b border-default px-6 flex justify-between items-center">
        <div
          className="flex items-center gap-4 cursor-pointer hover:opacity-80"
          onClick={handleHeaderClick}
        >
          <div className="avatar avatar-md">{otherParticipant.charAt(0)}</div>
          <div>
            <h3 className="body-medium font-semibold text-light-900 dark:text-light-50 mb-1">
              {otherParticipant}
            </h3>
            <div className="flex items-center gap-1">
              {isOnline ? (
                <>
                  <span className="status-online mb-0.5" />
                  <span className="small-regular text-green-600 dark:text-green-400 leading-none">
                    Online
                  </span>
                </>
              ) : (
                <>
                  <span className="status-offline mb-0.5" />
                  <span className="small-regular text-secondary leading-none">
                    {activeConversation.type === 'group'
                      ? `${activeConversation.participants.length} members`
                      : 'Offline'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        {activeConversation.type !== 'group' && (
          <div className="flex items-center gap-2">
            <button
              className="btn btn-ghost p-2 hover:bg-light200_dark200 rounded-lg transition-colors"
              onClick={() => {
                initiateCall('audio');
              }}
              disabled={callStatus !== 'idle'}
            >
              <BsTelephone className="w-5 h-5" aria-label="Voice Call" />
            </button>
            <button
              className="btn btn-ghost p-2 hover:bg-light200_dark200 rounded-lg transition-colors"
              onClick={() => {
                initiateCall('video');
              }}
              disabled={callStatus !== 'idle'}
            >
              <BsCameraVideo className="w-5 h-5" aria-label="Video Call" />
            </button>
            <button className="btn btn-ghost p-2 hover:bg-light200_dark200 rounded-lg transition-colors">
              <HiDotsVertical className="w-5 h-5" aria-label="More Options" />
            </button>
          </div>
        )}
      </div>
      <UserProfile
        isOpen={showUserProfile}
        onClose={() => setShowUSerProfile(false)}
        userId={otherParticipantUser?.userId ?? ''}
      />
      <GroupInfoModal
        isOpen={showGroupInfo}
        conversation={activeConversation}
        onClose={() => {
          setShowGroupInfo(false);
        }}
      />
    </>
  );
};

export default ChatHeader;
