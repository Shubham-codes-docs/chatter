import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { conversationService } from '../../services/conversationService';
import { userService } from '../../services/userService';
import { handleApiError } from '../../utils/errorHandler';
import type { User } from '../../types/api.types';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { useDebounce } from '../../hooks/useDebounce';

interface newChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing?: boolean;
  conversationId?: string;
  title?: string;
}

const NewGroupModal = ({
  isOpen,
  onClose,
  isEditing,
  conversationId,
  title = 'Create Group',
}: newChatModalProps) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);

  const { setActiveConversationId, fetchConversations } = useChatStore();
  const { user } = useAuthStore();

  // get all blocked users for this contact
  useEffect(() => {
    if (!isOpen) return;
    userService
      .getBlockedUsers()
      .then((blocked) => setBlockedUserIds(blocked.map((b) => b.blockedId)))
      .catch(console.error);
  }, [isOpen]);

  // check if isEditing is true. if yes we prepopulate the fields
  useEffect(() => {
    if (isEditing && !conversationId) {
      return;
    }
    if (isEditing) {
      const fetchConversationDetails = async () => {
        try {
          if (!conversationId) {
            return;
          }
          const conversationDetails =
            await conversationService.getConversationDetails(conversationId);
          setGroupName(conversationDetails.name || '');
          setGroupDescription(conversationDetails.description || '');
        } catch (error) {
          toast.error(handleApiError(error));
        }
      };
      fetchConversationDetails();
    }
  }, [isEditing, conversationId]);

  // handle key change
  const handlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  // effect that changes when debounceQuery changes
  useEffect(() => {
    const fetchUsers = async () => {
      if (debouncedQuery.trim().length < 2) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const users = await userService.searchUsers(debouncedQuery);
        const filteredUsers = users.filter(
          (u) => u.id !== user?.id && !blockedUserIds.includes(u.id)
        );
        setResults(filteredUsers);
      } catch (error) {
        toast.error(handleApiError(error));
      } finally {
        setIsSearching(false);
      }
    };

    fetchUsers();
  }, [debouncedQuery, blockedUserIds, user?.id]);

  // add users to the groups
  const handleAddUser = (participant: User) => {
    // if the user is already selected, unselect it
    setSelectedUsers((prevState) =>
      prevState.some((u) => u.id === participant.id)
        ? prevState.filter((u) => u.id !== participant.id)
        : [...prevState, participant]
    );
  };

  // start chat
  const handleCreateGroup = async () => {
    if (groupName.trim() === '') {
      toast.error('Group Name required');
      return;
    }
    if (selectedUsers.length === 0) {
      toast.error('Add at least one member');
      return;
    }
    setIsCreating(true);

    const selectedUserIds = selectedUsers.map((u) => u.id);

    try {
      const conversation = await conversationService.create(
        'group',
        selectedUserIds,
        groupName,
        groupDescription
      );
      await fetchConversations();
      setActiveConversationId(conversation?.id);
      onClose();
      toast.success(`${groupName} created`);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsCreating(false);
    }
  };

  // handle edit group
  const handleEditGroup = async () => {
    if (groupName.trim() === '') {
      toast.error('Group Name required');
      return;
    }
    setIsCreating(true);

    try {
      const conversation = await conversationService.editConversationDetails(
        conversationId!,
        groupName,
        groupDescription
      );
      await fetchConversations();
      setActiveConversationId(conversation?.id);
      onClose();
      toast.success(`${groupName} edited`);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsCreating(false);
    }
  };

  // handle close
  const handleClose = () => {
    if (!isEditing) {
      setQuery('');
      setGroupName('');
      setGroupDescription('');
      setResults([]);
      setSelectedUsers([]);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div>
            <label className="small-semibold text-primary mb-1 flex items-center gap-1">
              Group Name
              <span className="text-error">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter group name"
              className="input w-full"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
          <div>
            <label className="small-semibold text-primary mb-1 flex items-center gap-1">
              Description
              <span className="tiny-regular text-secondary ml-1">
                (optional)
              </span>
            </label>
            <input
              type="text"
              placeholder="What's this group about?"
              className="input w-full"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
            />
          </div>
        </div>
        {!isEditing && (
          <input
            type="text"
            placeholder="Search by username or name..."
            className="input w-full"
            value={query}
            onChange={handlInputChange}
            autoFocus
          />
        )}
        {!isEditing && selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-2">
            {selectedUsers.map((u) => (
              <div
                key={u.id}
                className="flex flex-col items-center gap-1 relative"
              >
                {/* remove button */}
                <button
                  onClick={() => handleAddUser(u)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full flex items-center justify-center hover:opacity-80 z-10"
                >
                  <span className="text-white tiny-regular leading-none">
                    ✕
                  </span>
                </button>
                {/* avatar */}
                <div className="avatar avatar-md">{u.fullName.charAt(0)}</div>
                {/* name */}
                <span className="tiny-regular text-secondary text-center max-w-12 truncate">
                  {u.fullName.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        )}

        {!isEditing && (
          <div className="flex flex-col gap-2 max-h-72 overflow-y-auto mt-2">
            {isSearching && (
              <p className="text-center small-regular text-secondary py-4">
                Searching...
              </p>
            )}

            {!isSearching && query.length >= 2 && results.length === 0 && (
              <p className="text-center small-regular text-secondary py-4">
                No users found
              </p>
            )}

            {results.map((result) => (
              <div
                key={result.id}
                onClick={() => !isCreating && handleAddUser(result)}
                className={`flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover cursor-pointer transition-colors ${
                  selectedUsers.some((u) => u.id === result.id)
                    ? 'bg-brand-primary/10 border border-brand-primary/30'
                    : 'hover:bg-surface-hover'
                }`}
              >
                <div className="avatar avatar-md">
                  {result.fullName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="body-medium font-semibold text-primary">
                    {result.fullName}
                  </p>
                  <p className="small-regular text-secondary">
                    @{result.username}
                  </p>
                </div>
                {selectedUsers.some((u) => u.id === result.id) && (
                  <span className="text-brand-primary font-bold">✓</span>
                )}
              </div>
            ))}
          </div>
        )}
        <button
          className="btn btn-primary w-full mt-2"
          onClick={() => (!isEditing ? handleCreateGroup() : handleEditGroup())}
          disabled={
            isCreating ||
            groupName.trim() === '' ||
            (!isEditing && selectedUsers.length === 0)
          }
        >
          {isCreating
            ? isEditing
              ? 'Saving...'
              : 'Creating...'
            : isEditing
              ? 'Save Changes'
              : 'Create Group'}
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default NewGroupModal;
