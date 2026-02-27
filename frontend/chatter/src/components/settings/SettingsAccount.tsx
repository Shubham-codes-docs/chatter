import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Label } from '../ui/label';
import ChangePassWordModal from './ChangePassWordModal';
import DeleteAccountModal from './DeleteAccountModal';

const SettingsAccount = () => {
  const navigate = useNavigate();
  const { user, logOut } = useAuthStore();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleLogout = () => {
    logOut();
    navigate('/login');
  };

  return (
    <div>
      <h2 className="h2-bold mb-6">Account Settings</h2>

      <div className="space-y-6">
        {/* Email (Read-only) - NO form needed */}
        <div className="p-4 rounded-lg border border-default">
          <Label className="body-medium font-semibold block mb-2">
            Email Address
          </Label>
          <p className="body-regular text-secondary mb-3">
            Your email is used for login and account recovery
          </p>
          <input
            type="email"
            value={user?.email || 'john@example.com'}
            disabled
            className="input w-full opacity-60 cursor-not-allowed"
          />
        </div>

        {/* Change Password */}
        <div className="p-4 rounded-lg border border-default">
          <Label className="body-medium font-semibold block mb-2">
            Password
          </Label>
          <p className="body-regular text-secondary mb-3">
            Update your password to keep your account secure
          </p>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="btn btn-secondary"
          >
            Change Password
          </button>
        </div>

        {/* Divider */}
        <div className="divider my-6" />
        {/* Logout */}
        <div className="p-4 rounded-lg border border-default">
          <Label className="body-medium font-semibold block mb-2">Logout</Label>
          <p className="body-regular text-secondary mb-3">
            Sign out of your account on this device
          </p>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
        {/* Delete Account */}
        <div className="p-4 rounded-lg border-2 border-error bg-error/5">
          <Label className="body-medium font-semibold block mb-2 text-error">
            Danger Zone
          </Label>
          <p className="body-regular text-secondary mb-3">
            Permanently delete your account and all your data. This action
            cannot be undone.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="btn bg-error hover:bg-error/90 text-white"
          >
            Delete Account
          </button>
        </div>
      </div>

      <ChangePassWordModal
        open={showPasswordModal}
        onOpenChange={setShowPasswordModal}
      />

      <DeleteAccountModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
      />
    </div>
  );
};

export default SettingsAccount;
