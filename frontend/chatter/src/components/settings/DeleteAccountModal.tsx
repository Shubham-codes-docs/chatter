import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from '../ui/dialog';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface DeleteAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteAccountModal = ({
  open,
  onOpenChange,
}: DeleteAccountModalProps) => {
  const navigate = useNavigate();
  const { logOut } = useAuthStore();

  // function to handle account deletion
  const handleDeleteAccount = () => {
    // TODO: Connect to backend
    logOut();
    navigate('/login');
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
        </div>

        <DialogFooter>
          <button onClick={handleCancel} className="btn btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleDeleteAccount}
            className="btn bg-error hover:bg-error/90 text-white"
          >
            Yes, Delete My Account
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountModal;
