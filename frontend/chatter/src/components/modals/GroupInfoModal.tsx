import { Dialog, DialogContent } from '../ui/dialog';
import type { Conversation } from '../../types/api.types';
import GroupMemberInfo from './GroupMemberInfo';
import { useAuthStore } from '../../store/authStore';
import { IoPeopleOutline } from 'react-icons/io5';
import { useState } from 'react';
import { toast } from 'sonner';
import { conversationService } from '../../services/conversationService';
import { handleApiError } from '../../utils/errorHandler';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../../store/chatStore';
import NewGroupModal from './NewGroupModal';
import UserProfile from '../user/UserProfile';
import ConfirmModal from './ConfirmModal';

interface GroupInfoModalInterface {
  isOpen: boolean;
  conversation: Conversation;
  onClose: () => void;
}

const GroupInfoModal = ({
  isOpen,
  onClose,
  conversation,
}: GroupInfoModalInterface) => {
  const { user } = useAuthStore();
  const { onlineUsers } = useChatStore();
  const currentParticipant = conversation.participants.find(
    (p) => p.userId === user?.id
  );

  // open CreateGroup Modal to edit group
  const [showIsEditGroup, setShowIsEditGroup] = useState(false);
  // set participant userId to show profile
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  // confirm delete group
  const [showDeleteGroupConfirm, setShowDeleteGroupConfirm] = useState(false);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);

  // get online user counts
  const onlineMembers = conversation.participants.filter((p) =>
    onlineUsers.includes(p.userId)
  ).length;

  const isAdmin = currentParticipant?.role === 'admin';
  const [isLeavingGroup, setIsLeavingGroup] = useState(false);
  const navigate = useNavigate();

  // handle leave group
  const handleLeaveGroup = async () => {
    if (!user?.id) {
      toast.error('You need to be a member of the group to leave it');
      return;
    }

    setIsLeavingGroup(true);
    try {
      await conversationService.leaveGroup(conversation.id, user?.id);
      toast.success('Group left successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsLeavingGroup(false);
    }
  };

  // handle delete group
  const handleDeleteGroup = async () => {
    setIsDeletingGroup(true);
    try {
      await conversationService.deleteConversation(conversation.id);
      onClose();
      navigate('/dashboard');
      toast.success('Group deleted');
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsDeletingGroup(false);
      setShowDeleteGroupConfirm(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <div className="h-32 gradient-primary relative"></div>
          <div className="flex justify-center -mt-12 mb-4">
            <div className="avatar w-24 h-24 text-2xl ring-4 ring-white dark:ring-dark">
              {conversation.avatar ? (
                <img
                  src={conversation.avatar}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                conversation.name?.charAt(0)
              )}
            </div>
          </div>
          <div className="px-6 pb-6">
            <div className="text-center mb-4">
              <h2 className="h2-bold mb-1">{conversation.name}</h2>
              <div className="flex flex-center gap-1 text-secondary mt-1">
                <IoPeopleOutline size={14} />
                <span className="small-regular">
                  {conversation.participants.length} members
                </span>
                <span className="text-secondary">·</span>
                <span className="w-2 h-2 rounded-full bg-success inline-block" />
                <span className="small-regular text-success">
                  {onlineMembers} online
                </span>
              </div>
            </div>
            {conversation.description && (
              <p className="body-regular text-secondary text-center mb-6">
                {conversation.description}
              </p>
            )}
            {isAdmin && (
              <div className="flex gap-2 mb-4">
                <button
                  className="btn btn-secondary flex-1 small-medium"
                  onClick={() => setShowIsEditGroup(true)}
                >
                  Edit Group
                </button>
              </div>
            )}
            <div className="divider mb-4" />
            <div>
              <h4 className="small-semibold text-secondary mb-3 uppercase tracking-wide">
                Members ({conversation.participants.length})
              </h4>
              {conversation.participants.map((participant) => {
                return (
                  <GroupMemberInfo
                    participant={participant}
                    key={participant.id}
                    isAdmin={isAdmin}
                    isCurrentUser={participant.userId === user?.id}
                    conversationId={conversation.id}
                    onViewProfile={(userId) => {
                      setProfileUserId(userId);
                    }}
                  />
                );
              })}
            </div>
          </div>
          <div className="divider my-4"></div>
          <button
            className="btn btn-danger w-full"
            onClick={handleLeaveGroup}
            disabled={isLeavingGroup}
          >
            Leave Group
          </button>
          {isAdmin && (
            <>
              <div className="divider my-2" />
              <button
                className="btn btn-danger w-full mb-4"
                onClick={() => setShowDeleteGroupConfirm(true)}
              >
                Delete Group
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
      <NewGroupModal
        isOpen={showIsEditGroup}
        onClose={() => setShowIsEditGroup(false)}
        isEditing={true}
        conversationId={conversation.id}
        title="Edit Group details"
      />
      <UserProfile
        userId={profileUserId ?? ''}
        isOpen={!!profileUserId}
        onClose={() => setProfileUserId(null)}
      />
      <ConfirmModal
        isOpen={showDeleteGroupConfirm}
        onClose={() => setShowDeleteGroupConfirm(false)}
        onConfirm={handleDeleteGroup}
        title="Delete Group"
        message="Are you sure you want to delete this group? This will remove the group for all members and cannot be undone."
        isDestructive={true}
        isLoading={isDeletingGroup}
      />
    </>
  );
};

export default GroupInfoModal;
