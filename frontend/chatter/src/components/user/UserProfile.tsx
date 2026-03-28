import { useEffect, useState } from 'react';
import type { User } from '../../types/api.types';
import { Dialog, DialogContent } from '../ui/dialog';
import { userService } from '../../services/userService';
import { toast } from 'sonner';
import { handleApiError } from '../../utils/errorHandler';
import { useChatStore } from '../../store/chatStore';
import { format } from 'date-fns';
import { DialogTitle } from '@radix-ui/react-dialog';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const UserProfile = ({ isOpen, onClose, userId }: UserProfileProps) => {
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { onlineUsers } = useChatStore();

  const isOnline = onlineUsers.includes(userId);

  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const data = await userService.getUserById(userId);
        setProfile(data);
      } catch (error) {
        toast.error(handleApiError(error));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogTitle>Profile</DialogTitle>
        {isLoading ? (
          // ── SKELETON ─────────────────────────────────────────
          <>
            <div className="h-32 gradient-primary" />
            <div className="flex flex-col items-center gap-3 px-6 pb-6 -mt-12">
              <div className="skeleton w-24 h-24 rounded-full ring-4 ring-white dark:ring-dark-300" />
              <div className="skeleton-text w-36 mt-2" />
              <div className="skeleton-text w-24" />
              <div className="skeleton-text w-48" />
            </div>
          </>
        ) : (
          // ── CONTENT ──────────────────────────────────────────
          <>
            <div className="h-32 gradient-primary relative" />

            {/* avatar */}
            <div className="flex justify-center -mt-12 mb-4">
              <div className="avatar w-24 h-24 text-2xl ring-4 ring-white dark:ring-dark-300">
                {profile?.fullName.charAt(0)}
              </div>
            </div>

            <div className="px-6 pb-6">
              {/* name + username + status */}
              <div className="text-center mb-4">
                <h2 className="h2-bold mb-1">{profile?.fullName}</h2>
                <p className="body-regular text-muted">@{profile?.username}</p>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <span
                    className={isOnline ? 'status-online' : 'status-offline'}
                  />
                  <span
                    className={`small-regular ${isOnline ? 'text-success' : 'text-muted'}`}
                  >
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>

              {/* bio */}
              {profile?.bio && (
                <p className="body-regular text-secondary text-center mb-6">
                  {profile.bio}
                </p>
              )}

              {/* actions */}
              <div className="flex items-center gap-3 mb-6">
                <button className="btn btn-primary flex-1">Message</button>
                <button className="btn btn-secondary flex-1" disabled>
                  Call
                </button>
              </div>

              <div className="divider mb-4" />

              {/* meta */}
              <div className="flex flex-col gap-3 items-center">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted">📅</span>
                  <span className="text-secondary">
                    Member since:{' '}
                    {profile?.createdAt
                      ? format(new Date(profile.createdAt), 'MMM yyyy')
                      : '—'}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserProfile;
