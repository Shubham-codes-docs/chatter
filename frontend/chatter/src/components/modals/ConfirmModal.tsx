import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

const ConfirmModal = ({
  isOpen,
  onClose,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive,
  onConfirm,
  isLoading,
}: ConfirmModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <h4 className="small-regular">{message}</h4>
        <div className="flex items-center justify-center gap-4">
          <button
            className={`btn ${isDestructive ? 'btn-primary' : 'btn-danger'} `}
            onClick={() => onConfirm()}
            disabled={isLoading}
          >
            {confirmLabel}
          </button>
          <button className="btn btn-secondary" onClick={() => onClose()}>
            {cancelLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmModal;
