// Socket.io real-time avatar update for all pages
if (typeof io !== 'undefined') {
  const socket = io();

  // Listen for avatar update events from the server
  socket.on('avatarUpdated', function({ userId, avatar }) {
    // Update avatar image on all pages if the current user matches
    const avatarImgs = document.querySelectorAll('.profile-avatar img, .navbar-avatar-img');
    avatarImgs.forEach(img => {
      if (img.dataset.userid === userId) {
        img.src = avatar + '?t=' + Date.now(); // bust cache
      }
    });
  });

  // Optionally, emit an event after avatar upload (handled server-side)
}
