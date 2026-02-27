import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { changePasswordSchema } from '../../schemas/auth.schema';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from '../ui/dialog';
import { Label } from '../ui/label';

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

const ChangePassWordModal = ({
  open,
  onOpenChange,
}: ChangePasswordModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  // function to handle password change submission
  const onPasswordSubmit = async () => {
    try {
      // TODO: await api.put('/users/password', data);

      // Close modal and reset form
      onOpenChange(false);
      reset();

      // Show success message (add toast later)
      alert('Password changed successfully!');
    } catch (error) {
      console.error('Password change failed:', error);
    }
  };

  // function to handle cancel action
  const handleCancel = () => {
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onPasswordSubmit)}>
          <div className="space-y-4 py-4">
            <div>
              <Label className="small-semibold text-secondary block mb-2">
                Current Password
              </Label>
              <input
                {...register('currentPassword')}
                type="password"
                className={`input w-full ${errors.currentPassword ? 'input-error' : ''}`}
                placeholder="Enter current password"
              />
              {errors.currentPassword && (
                <p className="text-error text-sm mt-1">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>
            <div>
              <Label className="small-semibold text-secondary block mb-2">
                New Password
              </Label>
              <input
                {...register('newPassword')}
                type="password"
                className={`input w-full ${errors.newPassword ? 'input-error' : ''}`}
                placeholder="Enter new password"
              />
              {errors.newPassword && (
                <p className="text-error text-sm mt-1">
                  {errors.newPassword.message}
                </p>
              )}
            </div>
            <div>
              <Label className="small-semibold text-secondary block mb-2">
                Confirm New Password
              </Label>
              <input
                {...register('confirmPassword')}
                type="password"
                className={`input w-full ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Confirm new password"
              />
              {errors.confirmPassword && (
                <p className="text-error text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                handleCancel();
                reset();
              }}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePassWordModal;
