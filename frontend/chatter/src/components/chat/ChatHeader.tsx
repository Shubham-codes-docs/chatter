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

const ChatHeader = () => {
  const [showUserProfile, setShowUSerProfile] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const { activeConversationId, conversations, onlineUsers } = useChatStore();
  const { user } = useAuthStore();

  const toggleUserProfile = () => {
    setShowUSerProfile((prev) => !prev);
  };

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
  const isOnline = getOnlineStatus(activeConversation, user.id, onlineUsers);

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
            <button className="btn btn-ghost p-2 hover:bg-light200_dark200 rounded-lg transition-colors">
              <BsTelephone className="w-5 h-5" aria-label="Voice Call" />
            </button>
            <button className="btn btn-ghost p-2 hover:bg-light200_dark200 rounded-lg transition-colors">
              <BsCameraVideo className="w-5 h-5" aria-label="Video Call" />
            </button>
            <button className="btn btn-ghost p-2 hover:bg-light200_dark200 rounded-lg transition-colors">
              <HiDotsVertical className="w-5 h-5" aria-label="More Options" />
            </button>
          </div>
        )}
      </div>
      <UserProfile isOpen={showUserProfile} onClose={toggleUserProfile} />
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
