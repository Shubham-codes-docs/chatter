import { BsTelephone, BsCameraVideo } from 'react-icons/bs';
import { HiDotsVertical } from 'react-icons/hi';

const ChatHeader = () => {
  return (
    <div className="h-16 bg-light50_dark300 border-b border-default px-6 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="avatar avatar-md">J</div>
        <div>
          <h3 className="body-medium font-semibold text-light-900 dark:text-light-50 mb-1">
            John Doe
          </h3>
          <div className="flex items-center gap-1">
            <span className="status-online mb-0.5" />
            <span className="small-regular text-green-600 dark:text-green-400 leading-none">
              Online
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="btn btn-ghost p-2 hover:bg-light200_dark200 rounded-lg transition-colors">
          <BsTelephone className="w-5 h-5" aria-label="Voice Call" />
        </button>
        <button className="btn btn-ghost p-2 hover:bg-light200_dark200 rounded-lg transition-colors">
          <BsCameraVideo className="w-5 h-5" aria-label="Video Call" />
        </button>
        <button className="btn btn-ghost p-2 hover:bg-light200_dark200 rounded-lg transition-colors">
          <HiDotsVertical className="w-5 h-5" aria-label="More Options" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
