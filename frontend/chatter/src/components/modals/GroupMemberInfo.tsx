import { HiDotsVertical } from 'react-icons/hi';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '../ui/dropdown-menu';
import type { ConversationParticipant } from '../../types/api.types';
import { useState } from 'react';
import { toast } from 'sonner';
import { conversationService } from '../../services/conversationService';
import { handleApiError } from '../../utils/errorHandler';
import { useChatStore } from '../../store/chatStore';
import ConfirmModal from './ConfirmModal';

interface GroupMemberInfoInterface {
  participant: ConversationParticipant;
  isAdmin: boolean;
  conversationId: string;
  isCurrentUser: boolean;
}

const GroupMemberInfo = ({
  participant,
  isCurrentUser,
  isAdmin,
  conversationId,
}: GroupMemberInfoInterface) => {
  const [isRemovingUser, setIsRemovingUser] = useState(false);
  const [isUpdatingUserRole, setIsUpdatingUserRole] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    isDestructive: false,
  });
  const { fetchConversations } = useChatStore();

  const handleRemoveParticipant = async (userId: string) => {
    if (!userId) toast.error('Please select a user first');

    setIsRemovingUser(true);
    try {
      await conversationService.removeParticipant(conversationId, userId);
      fetchConversations();
      toast.success('Participant removed from the group!');
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsRemovingUser(false);
    }
  };

  // handle update user role
  const handleUpdateUserRole = async (
    userId: string,
    role: 'admin' | 'member'
  ) => {
    if (!userId) toast.error('Please select a user first');

    setIsUpdatingUserRole(true);
    try {
      await conversationService.updateParticipantRole(
        conversationId,
        userId,
        role
      );
      fetchConversations();
      toast.success('Participant role updated!');
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsUpdatingUserRole(false);
    }
  };

  // set the confirmation modal
  const openConfirm = (
    title: string,
    message: string,
    action: () => void,
    isDestructive: boolean
  ) => {
    setModalConfig({ title, message, isDestructive });
    setConfirmAction(() => action);
    setIsConfirmModalOpen(true);
  };

  // handle confirm action
  const handleConfirm = () => {
    confirmAction?.();
    setIsConfirmModalOpen(false);
  };

  return (
    <>
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-hover">
        <div className="avatar avatar-sm">
          {participant.user.fullName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="body-medium font-semibold text-primary truncate">
              {participant.user.fullName}
              {isCurrentUser && (
                <span className="text-secondary font-normal">(You)</span>
              )}
            </p>
            {participant.role === 'admin' && (
              <span className="badge badge-primary tiny-medium">Admin</span>
            )}
            <p className="small-regular text-secondary">
              @{participant.user.username}
            </p>
          </div>
          {isAdmin && !isCurrentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="btn btn-ghost p-1">
                  <HiDotsVertical size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    openConfirm(
                      participant.role === 'admin'
                        ? 'Remove Admin'
                        : 'Make Admin',
                      `Are you sure you want to ${participant.role === 'admin' ? 'remove admin from' : 'make admin'} ${participant.user.fullName}?`,
                      () =>
                        handleUpdateUserRole(
                          participant.userId,
                          participant.role === 'admin' ? 'member' : 'admin'
                        ),
                      false
                    )
                  }
                  disabled={isUpdatingUserRole}
                >
                  {participant.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    openConfirm(
                      'Remove User',
                      `Are you sure you want to remove ${participant.user.fullName}`,
                      () => handleRemoveParticipant(participant.userId),
                      true
                    )
                  }
                  disabled={isRemovingUser}
                >
                  Remove from group
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        isDestructive={modalConfig.isDestructive}
        isLoading={isRemovingUser || isUpdatingUserRole}
      />
    </>
  );
};

export default GroupMemberInfo;
