import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from '../../schemas/auth.schema';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { userService } from '../../services/userService';
import { toast } from 'sonner';
import { handleApiError } from '../../utils/errorHandler';

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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
  const onPasswordSubmit = async (data: ChangePasswordInput) => {
    try {
      await userService.updatePassword(data.currentPassword, data.newPassword);
      // Close modal and reset form
      onOpenChange(false);
      reset();
      toast.success('Password changed successfully!');
    } catch (error) {
      toast.error(handleApiError(error));
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
