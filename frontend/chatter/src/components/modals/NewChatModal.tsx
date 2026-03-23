import { useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { conversationService } from '../../services/conversationService';
import { userService } from '../../services/userService';
import { handleApiError } from '../../utils/errorHandler';
import type { User } from '../../types/api.types';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';

interface newChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewChatModal = ({ isOpen, onClose }: newChatModalProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { setActiveConversationId, fetchConversations } = useChatStore();
  const { user } = useAuthStore();

  // handle user search
  const handleSearch = async (q: string) => {
    setQuery(q);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const users = await userService.searchUsers(query);
      setResults(users.filter((u) => u.id !== user?.id));
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsSearching(false);
    }
  };

  // start chat
  const handleStartChat = async (selectedUser: User) => {
    setIsCreating(true);
    try {
      const conversation = await conversationService.create('direct', [
        selectedUser.id,
      ]);
      await fetchConversations();
      setActiveConversationId(conversation?.id);
      onClose();
      toast.success(`Chat started with ${selectedUser.fullName}`);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsCreating(false);
    }
  };

  // handle close
  const handleClose = () => {
    setQuery('');
    setResults([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Chat</DialogTitle>
        </DialogHeader>

        <input
          type="text"
          placeholder="Search by username or name..."
          className="input w-full"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          autoFocus
        />

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
              onClick={() => !isCreating && handleStartChat(result)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover cursor-pointer transition-colors"
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
              {isCreating && (
                <span className="small-regular text-secondary">Opening...</span>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewChatModal;
