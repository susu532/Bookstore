import { useEffect } from 'react';

export function useNotification() {
  useEffect(() => {
    if (document.getElementById('notification-container')) return;
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.style.position = 'fixed';
    container.style.top = '30px';
    container.style.right = '30px';
    container.style.zIndex = '9999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';
    document.body.appendChild(container);
  }, []);

  function showNotification(message, type = 'info', duration = 7000) {
    const container = document.getElementById('notification-container');
    if (!container) return;
    const notif = document.createElement('div');
    notif.innerText = message;
    notif.style.padding = '16px 24px';
    notif.style.borderRadius = '8px';
    notif.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    notif.style.color = '#fff';
    notif.style.fontSize = '1rem';
    notif.style.fontWeight = '500';
    notif.style.background = type === 'error'
      ? 'linear-gradient(90deg,#e53935,#e35d5b)'
      : type === 'success'
        ? 'linear-gradient(90deg,#43cea2,#185a9d)'
        : 'linear-gradient(90deg,#2193b0,#6dd5ed)';
    notif.style.opacity = '0.95';
    notif.style.transition = 'opacity 1.2s';
    container.appendChild(notif);
    setTimeout(() => {
      notif.style.opacity = '0';
      setTimeout(() => notif.remove(), 1200);
    }, duration);
  }

  return showNotification;
}
