import type { Message } from '../types/api.types';

// request notification permission
export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
};

// show notification
export const showDesktopNotification = (message: Message) => {
  if (
    'Notification' in window &&
    Notification.permission === 'granted' &&
    document.hidden // only show when tab is not active
  ) {
    new Notification(message.sender.fullName, {
      body:
        message.type === 'text' ? message.content : `Sent a ${message.type}`,
      icon: message.sender.avatar ?? '/chatter-logo.jpg',
    });
  }
};
