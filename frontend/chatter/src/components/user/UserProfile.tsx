import { Dialog, DialogContent } from '../ui/dialog';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfile = ({ isOpen, onClose }: UserProfileProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="h-32 gradient-primary relative"></div>
        <div className="flex justify-center -mt-12 mb-4">
          <div className="avatar w-24 h-24 text-2xl ring-4 ring-white dark:ring-dark">
            J
          </div>
        </div>
        <div className="px-6 pb-6">
          <div className="text-center mb-4">
            <h2 className="h2-bold mb-1">John Doe</h2>
            <p className="body-regular text-muted">John@doe</p>
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <span className="status-online" />
              <span className="small-regular text-success">Online</span>
            </div>
          </div>
          <p className="body-regular text-secondary text-center mb-6">
            Chatting on Chatter
          </p>
          <div className="flex items-center gap-3 mb-6">
            <button className="btn btn-primary flex-1">Message</button>
            <button className="btn btn-secondary flex-1">Call</button>
          </div>
          <div className="divider mb-4" />
          <div className="flex flex-col gap-4 items-center">
            <div className="flex flex-center gap-2 text-sm">
              <span className="text-muted">📅</span>
              <span className="text-secondary">Member since: Jan 2026</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted">✉️</span>
              <span className="text-secondary">john@example.com</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfile;
