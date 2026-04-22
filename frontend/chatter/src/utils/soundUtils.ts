const notificationSound = new Audio('/notification.ogg');
notificationSound.volume = 1;

export const playMessageSound = () => {
  notificationSound.currentTime = 0;
  notificationSound.play().catch(() => {
    // autoplay blocked by browser — ignore silently
  });
};
