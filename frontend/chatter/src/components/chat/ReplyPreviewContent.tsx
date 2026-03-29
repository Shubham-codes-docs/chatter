import { BsFile } from 'react-icons/bs';
import type { Message } from '../../types/api.types';

const ReplyPreviewContent = ({ message }: { message: Message }) => {
  if (message.type === 'image' && message.fileUrl) {
    return (
      <div className="flex items-center gap-2">
        <img
          src={message.fileUrl}
          alt="image"
          className="h-8 w-8 rounded object-cover shrink-0"
        />
        <span className="small-regular truncate">Photo</span>
      </div>
    );
  }
  if (message.type === 'file') {
    return (
      <div className="flex items-center gap-1">
        <BsFile size={12} className="shrink-0" />
        <span className="small-regular truncate">{message.fileName}</span>
      </div>
    );
  }
  return <span className="small-regular truncate">{message.content}</span>;
};

export default ReplyPreviewContent;
