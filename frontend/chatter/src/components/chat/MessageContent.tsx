import { BsFile } from 'react-icons/bs';
import type { Message } from '../../types/api.types';

const MessageContent = ({ message }: { message: Message }) => {
  if (message.type === 'image' && message.fileUrl) {
    return (
      <img
        src={message.fileUrl}
        alt={message.fileName ?? 'uploaded image'}
        className="rounded-xl max-w-full max-h-64 object-cover cursor-pointer"
        onClick={() => window.open(message.fileUrl!, '_blank')}
      />
    );
  }
  if (message.type === 'file' && message.fileUrl) {
    return (
      <a
        href={message.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors duration-150"
      >
        <BsFile size={24} className="shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="small-semibold truncate">{message.fileName}</span>
          <span className="tiny-regular text-white/60">
            {message.fileSize
              ? `${(message.fileSize / 1024).toFixed(0)} KB`
              : ''}
          </span>
        </div>
      </a>
    );
  }
  return <p className="break-words">{message.content}</p>;
};

export default MessageContent;
