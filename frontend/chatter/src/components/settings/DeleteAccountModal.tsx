import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from '../ui/dialog';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { userService } from '../../services/userService';
import { toast } from 'sonner';
import { handleApiError } from '../../utils/errorHandler';

interface DeleteAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteAccountModal = ({
  open,
  onOpenChange,
}: DeleteAccountModalProps) => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [email, setEmail] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // function to handle account deletion
  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await userService.deleteAccount(email);
      toast.success('Account deleted successfully');
      logout();
      navigate('/login');
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsDeleting(false);
      setEmail('');
    }
  };

  // function to handle cancel action
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Account?</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="body-regular text-secondary mb-4">
            Are you sure you want to delete your account? This action is
            permanent and cannot be undone.
          </p>
          <div className="bg-error/10 border border-error rounded-lg p-3">
            <p className="small-semibold text-error">⚠️ Warning:</p>
            <ul className="small-regular text-secondary mt-2 space-y-1 list-disc list-inside">
              <li>All your messages will be deleted</li>
              <li>Your profile will be removed</li>
              <li>You will lose all contacts</li>
              <li>This cannot be reversed</li>
            </ul>
          </div>
          <div className="mb-4">
            <label className="small-semibold text-secondary block mb-2">
              Confirm your email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input w-full"
              placeholder="Enter your registered email"
            />
          </div>
        </div>

        <DialogFooter>
          <button onClick={handleCancel} className="btn btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleDeleteAccount}
            className="btn bg-error hover:bg-error/90 text-white"
            disabled={!email.trim() || isDeleting}
          >
            Yes, Delete My Account
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountModal;
