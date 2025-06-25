import { useEffect } from 'react';

export default function useAvatarSocket(userId) {
  useEffect(() => {
    if (!window.io || !userId) return;
    const socket = window.io();
    const updateAvatar = ({ userId: changedId, avatar }) => {
      if (changedId === userId) {
        const avatarImgs = document.querySelectorAll('.profile-avatar img, .navbar-avatar-img');
        avatarImgs.forEach(img => {
          if (img.dataset.userid === userId) {
            img.src = avatar + '?t=' + Date.now();
          }
        });
      }
    };
    socket.on('avatarUpdated', updateAvatar);
    return () => socket.off('avatarUpdated', updateAvatar);
  }, [userId]);
}
