import { useState, useRef } from 'react';
import { BsPaperclip, BsEmojiSmile, BsImage, BsFile } from 'react-icons/bs';
import { IoMdSend } from 'react-icons/io';
import { useChatStore } from '../../store/chatStore';
import { getSocket } from '../../socket/socketClient';
import { SOCKET_EVENTS } from '../../socket/events';
import type { Message } from '../../types/api.types';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useFileUpload } from '../../hooks/useFileUpload';
import ReplyPreviewContent from './ReplyPreviewContent';

interface MessageInputInterface {
  replyTo: Message | null;
  onReply: (message: Message | null) => void;
}

const MessageInput = ({ replyTo, onReply }: MessageInputInterface) => {
  const [message, setMessage] = useState('');
  const [isSendDisabled, setIsSendDisabled] = useState(true);
  const { activeConversationId, sendMessage, isSendingMessage } =
    useChatStore();
  // state for showing file picker
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  // state for selected files
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { uploadFiles, isUploading, progress } = useFileUpload({
    type: 'message',
    onSuccess: (results) => {
      results.forEach((result) => {
        sendMessage(
          activeConversationId || '',
          result.fileName,
          result.fileType.startsWith('image/') ? 'image' : 'file',
          replyTo?.id,
          result.url,
          result.fileName,
          result.fileSize
        );
      });
      setSelectedFiles([]);
    },
  });

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // refs for imagePicker and filePicker
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    setIsSendDisabled(value.trim() === '');

    if (!activeConversationId) return;

    const socket = getSocket();
    if (!socket) return;

    // emit typing start
    socket.emit(SOCKET_EVENTS.TYPING_START, activeConversationId);

    // clear existing timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // emit typing stop after 2 seconds of no typing
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit(SOCKET_EVENTS.TYPING_STOP, activeConversationId);
    }, 2000);
  };

  const handleSend = async () => {
    if (!activeConversationId) return;
    if (message.trim() === '' && selectedFiles.length === 0) return;

    const socket = getSocket();
    if (!socket) return;

    // emit stop typing
    socket.emit(SOCKET_EVENTS.TYPING_STOP, activeConversationId);
    if (selectedFiles.length > 0) {
      await uploadFiles(selectedFiles);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    // send message
    if (message.trim()) {
      await sendMessage(
        activeConversationId,
        message.trim(),
        'text',
        replyTo?.id
      );
      setMessage('');
      setIsSendDisabled(true);
      onReply(null);
    }
  };

  // enter button to send message
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isSendDisabled) {
      handleSend();
    }
  };

  return (
    <>
      {replyTo && (
        <div className="reply-preview">
          <div className="reply-preview-content">
            <p className="reply-preview-sender">{replyTo.sender.username}</p>
            <p className="reply-preview-message">
              <ReplyPreviewContent message={replyTo} />
            </p>
          </div>
          <button
            className="reply-preview-cancel"
            onClick={() => onReply(null)}
          >
            ✕
          </button>
        </div>
      )}
      {/* file preview */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 py-2 bg-light50_dark300 border-t border-default">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-surface border border-default rounded-lg px-3 py-1.5"
            >
              {file.type.startsWith('image/') ? (
                <BsImage size={14} className="text-brand-primary shrink-0" />
              ) : (
                <BsFile size={14} className="text-secondary shrink-0" />
              )}
              <span className="small-regular text-primary truncate max-w-[120px]">
                {file.name}
              </span>
              <span className="tiny-regular text-muted shrink-0">
                {(file.size / 1024).toFixed(0)}KB
              </span>
              <button
                className="text-muted hover:text-error transition-colors duration-150 shrink-0"
                onClick={() =>
                  setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
                }
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* progress bar */}
      {isUploading && (
        <div className="px-4 py-2 bg-light50_dark300 border-t border-default">
          <div className="flex items-center justify-between mb-1">
            <span className="tiny-regular text-secondary">Uploading...</span>
            <span className="tiny-regular text-brand-primary">{progress}%</span>
          </div>
          <div className="w-full bg-light-300 dark:bg-dark-200 rounded-full h-1.5">
            <div
              className="gradient-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          setSelectedFiles((prev) => [...prev, ...files]);
          e.target.value = ''; // reset so same file can be selected again
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.js,.ts,.zip,.rar"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          setSelectedFiles((prev) => [...prev, ...files]);
          e.target.value = '';
        }}
      />
      <div className="h-18 bg-light50_dark300 border-t border-default p-6 flex items-center justify-between gap-4">
        <Popover open={showAttachMenu} onOpenChange={setShowAttachMenu}>
          <PopoverTrigger asChild>
            <button className="btn btn-ghost p-2">
              <BsPaperclip size={20} />
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" align="start" className="w-40 p-2">
            <button
              className="dropdown-item w-full rounded-lg"
              onClick={() => {
                imageInputRef.current?.click();
                setShowAttachMenu(false);
              }}
            >
              <BsImage className="mr-2" />
              Image
            </button>
            <button
              className="dropdown-item w-full rounded-lg"
              onClick={() => {
                fileInputRef.current?.click();
                setShowAttachMenu(false);
              }}
            >
              <BsFile className="mr-2" />
              File
            </button>
          </PopoverContent>
        </Popover>

        <input
          type="text"
          placeholder="Type a message..."
          className="input flex-1"
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
        />
        <button className="btn btn-ghost p-2">
          <BsEmojiSmile size={20} />
        </button>
        <button
          className="btn btn-primary p-2"
          onClick={handleSend}
          disabled={
            (isSendDisabled && selectedFiles.length === 0) ||
            isSendingMessage ||
            isUploading
          }
        >
          <IoMdSend />
        </button>
      </div>
    </>
  );
};

export default MessageInput;
