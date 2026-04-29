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
import { useUIStore } from '../../store/uiStore';
import { IoArrowBack } from 'react-icons/io5';
import { conversationService } from '../../services/conversationService';
import { toast } from 'sonner';
import { handleApiError } from '../../utils/errorHandler';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import ConfirmModal from '../modals/ConfirmModal';

const ChatHeader = () => {
  const [showUserProfile, setShowUSerProfile] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingConversation, setIsDeletingConversation] = useState(false);
  const {
    activeConversationId,
    conversations,
    onlineUsers,
    setActiveConversationId,
  } = useChatStore();
  const { user } = useAuthStore();
  const { callStatus, setCallStatus, setActiveCall } = useCallStore();
  const { setMobileView } = useUIStore();

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

  // delete handler
  const handleDeleteConversation = async () => {
    setIsDeletingConversation(true);
    try {
      await conversationService.deleteConversation(activeConversation.id);
      setActiveConversationId('');
      toast.success('Conversation deleted successfully');
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsDeletingConversation(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <div className="h-16 bg-light50_dark300 border-b border-default px-6 flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <button
            className="md:hidden btn btn-ghost p-2 mr-2"
            onClick={() => setMobileView('sidebar')}
          >
            <IoArrowBack size={20} />
          </button>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="btn btn-ghost p-2 hover:bg-light200_dark200 rounded-lg transition-colors">
                  <HiDotsVertical className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-error focus:text-error"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Conversation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConversation}
        title="Delete Conversation"
        message="Are you sure you want to delete this conversation? This cannot be undone."
        isDestructive={true}
        isLoading={isDeletingConversation}
      />
    </>
  );
};

export default ChatHeader;
