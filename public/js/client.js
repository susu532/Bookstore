// Notification UI
function showNotification(message, type = 'info', duration = 7000) { // duration increased
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.style.position = 'fixed';
    container.style.top = '30px';
    container.style.right = '30px';
    container.style.zIndex = '9999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';
    document.body.appendChild(container);
  }
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
  notif.style.transition = 'opacity 1.2s'; // slower fade-out
  container.appendChild(notif);
  setTimeout(() => {
    notif.style.opacity = '0';
    setTimeout(() => notif.remove(), 1200); // match fade-out duration
  }, duration);
}

// Connexion
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  // If login is handled by server-side redirect, just reload
  if (res.redirected) {
    window.location.href = res.url;
    return;
  }
  const data = await res.json().catch(() => ({}));
  if (res.ok && data.redirectUrl) {
    window.location.href = data.redirectUrl;
  } else if (data.message) {
    showNotification(data.message, 'error');
  } else {
    showNotification('Erreur lors de la connexion', 'error');
  }
});

// Inscription
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const res = await fetch('/api/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const data = await res.json();
  if (res.ok) {
    window.location.href = '/login';
  } else {
    showNotification(data.message || 'Erreur lors de l’inscription', 'error');
  }
});

// Mise à jour du profil (AJAX, supporte avatar)
document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = document.getElementById('profileForm');
  const formData = new FormData(form);
  const res = await fetch('/api/users/profile', {
    method: 'PUT',
    body: formData
  });
  const data = await res.json();
  if (res.ok) {
    showNotification(data.message, 'success');
    // Mettre à jour l'avatar sur la page sans recharger
    if (data.avatar) {
      const avatarImg = document.querySelector('.profile-avatar img');
      if (avatarImg) {
        avatarImg.src = data.avatar + '?t=' + Date.now();
      }
    }
  } else {
    showNotification(data.message || 'Erreur lors de la mise à jour', 'error');
  }
});

// Ajouter un livre
document.getElementById('addBookForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const author = document.getElementById('author').value;
  const genre = document.getElementById('genre').value;
  const price = document.getElementById('price').value;
  const description = document.getElementById('description').value;
  const stock = document.getElementById('stock').value;
  const res = await fetch('/api/books/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, author, genre, price, description, stock })
  });
  const data = await res.json();
  if (res.ok) {
    showNotification(data.message, 'success');
    // Real-time update: add the new book to the table without reload
    const booksTableBody = document.getElementById('booksTableBody');
    if (booksTableBody && data.book) {
      const book = data.book;
      const row = document.createElement('tr');
      row.setAttribute('data-book-id', book._id);
      row.innerHTML = `
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td><span class="badge bg-info bg-gradient text-dark">${book.genre}</span></td>
        <td><span class="fw-bold text-success">${book.price}</span></td>
        <td>${book.stock > 5 ? `<span class='badge bg-success'>${book.stock}</span>` : book.stock > 0 ? `<span class='badge bg-warning text-dark'>${book.stock}</span>` : `<span class='badge bg-danger'>Rupture</span>`}</td>
        <td>${book.image ? `<img src='${book.image}' alt='Couverture' style='width:48px;height:64px;object-fit:cover;border-radius:0.3rem;box-shadow:0 2px 8px #0001;'>` : `<span class='text-muted'>Aucune</span>`}</td>
        <td>
          <button onclick="editBook('${book._id}', '${book.title.replace(/'/g, "&#39;")}', '${book.author.replace(/'/g, "&#39;")}', '${book.genre}', '${book.price}', '${book.stock}')" class="btn btn-sm btn-primary me-1" title="Modifier">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button onclick="deleteBook('${book._id}')" class="btn btn-sm btn-danger me-1" title="Supprimer">
            <i class="bi bi-trash"></i>
          </button>
          <a href="/book/${book._id}" class="btn btn-sm btn-info" title="Détails">
            <i class="bi bi-info-circle"></i>
          </a>
        </td>
      `;
      booksTableBody.prepend(row);
      document.getElementById('addBookForm').reset();
    } else {
      window.location.reload();
    }
  } else {
    showNotification(data.message || 'Erreur lors de l’ajout du livre', 'error');
  }
});

// Modifier un livre
async function editBook(bookId, currentTitle, currentAuthor, currentGenre, currentPrice, currentStock) {
  const newTitle = prompt('Nouveau titre :', currentTitle) || currentTitle;
  const newAuthor = prompt('Nouvel auteur :', currentAuthor) || currentAuthor;
  const newGenre = prompt('Nouveau genre :', currentGenre) || currentGenre;
  const newPrice = prompt('Nouveau prix (€) :', currentPrice) || currentPrice;
  const newStock = prompt('Nouveau stock :', currentStock) || currentStock;

  const res = await fetch(`/api/books/${bookId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: newTitle, author: newAuthor, genre: newGenre, price: newPrice, stock: newStock })
  });
  const data = await res.json();
  if (res.ok) {
    showNotification(data.message, 'success');
    window.location.reload();
  } else {
    showNotification(data.message || 'Erreur lors de la mise à jour', 'error');
  }
}

// Supprimer un livre
async function deleteBook(bookId) {
  if (confirm('Voulez-vous vraiment supprimer ce livre ?')) {
    const res = await fetch(`/api/books/${bookId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (res.ok) {
      showNotification(data.message, 'success');
      window.location.reload();
    } else {
      showNotification(data.message || 'Erreur lors de la suppression', 'error');
    }
  }
}

// Rechercher des livres
document.getElementById('searchBooksForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = document.getElementById('searchQuery').value;
  const res = await fetch(`/api/books/search?query=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  const books = await res.json();
  const tbody = document.getElementById('booksTableBody');
  tbody.innerHTML = '';
  books.forEach(book => {
    tbody.innerHTML += `
      <tr data-book-id="${book._id}">
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td><span class="badge bg-info bg-gradient text-dark">${book.genre}</span></td>
        <td><span class="fw-bold text-success">${book.price}</span></td>
        <td>${book.stock > 5 ? `<span class='badge bg-success'>${book.stock}</span>` : book.stock > 0 ? `<span class='badge bg-warning text-dark'>${book.stock}</span>` : `<span class='badge bg-danger'>Rupture</span>`}</td>
        <td>${book.image ? `<img src='${book.image}' alt='Couverture' style='width:48px;height:64px;object-fit:cover;border-radius:0.3rem;box-shadow:0 2px 8px #0001;'>` : `<span class='text-muted'>Aucune</span>`}</td>
        <td>
          <button onclick="editBook('${book._id}', '${book.title.replace(/'/g, "&#39;")}', '${book.author.replace(/'/g, "&#39;")}', '${book.genre}', '${book.price}', '${book.stock}')" class="btn btn-sm btn-primary me-1" title="Modifier">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button onclick="deleteBook('${book._id}')" class="btn btn-sm btn-danger me-1" title="Supprimer">
            <i class="bi bi-trash"></i>
          </button>
          <a href="/book/${book._id}" class="btn btn-sm btn-info" title="Détails">
            <i class="bi bi-info-circle"></i>
          </a>
        </td>
      </tr>
    `;
  });
});

// Ajouter au panier
document.getElementById('addToCartForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  // Ne plus utiliser userId, le backend utilise req.user via session
  const bookId = document.querySelector('input[name="bookId"]').value;
  const quantity = document.getElementById('quantity').value;
  const res = await fetch('/api/orders/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookId, quantity })
  });
  const data = await res.json();
  if (res.ok) {
    showNotification(data.message || 'Ajouté au panier', 'success');
    window.location.reload();
  } else {
    showNotification(data.message || 'Erreur lors de l’ajout au panier', 'error');
  }
});

// Valider la commande
async function checkout() {
  // Ne plus utiliser userId, le backend utilise req.user via session
  const res = await fetch('/api/orders/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  if (res.ok) window.location.href = `/orders`;
  else showNotification(data.message || 'Erreur lors de la validation', 'error');
}

// Emprunter un livre
async function emprunterLivre(bookId) {
  // Ne plus utiliser userId, le backend utilise req.user via session
  // Vérifier si déjà emprunté
  const resCheck = await fetch(`/api/emprunts/user`);
  const dataCheck = await resCheck.json();
  if (resCheck.ok && dataCheck.emprunts.some(e => e.book._id === bookId && !e.dateRetour)) {
    showNotification('Vous avez déjà emprunté ce livre et ne l\'avez pas encore retourné.', 'warning');
    return;
  }
  // Emprunter
  const res = await fetch('/api/emprunts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookId })
  });
  const data = await res.json();
  if (res.ok) {
    showNotification('Livre emprunté avec succès', 'success');
    if (data.gamification) updateGamificationBar(data.gamification);
    window.location.href = '/emprunts';
  } else {
    showNotification(data.message || 'Erreur lors de l\'emprunt', 'error');
  }
}

// Return book from emprunt page (AJAX)
async function retournerLivre(empruntId) {
  const res = await fetch(`/api/emprunts/return/${empruntId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  if (res.ok) {
    showNotification('Livre retourné avec succès', 'success');
    setTimeout(() => window.location.reload(), 1000);
  } else {
    showNotification(data.message || 'Erreur lors du retour', 'error');
  }
}

// Déconnexion
function logout() {
  // Nettoyer le localStorage si besoin, puis rediriger
  window.location.href = '/logout';
}

// Gestion des utilisateurs (activer/désactiver)
async function toggleUser(userId, isActive) {
  const res = await fetch(`/api/admin/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isActive })
  });
  const data = await res.json();
  if (res.ok) window.location.reload();
  else showNotification(data.message || 'Erreur lors de la mise à jour', 'error');
}

// Mise à jour du stock (pour la vue stock admin)
async function updateStock(e, bookId) {
  e.preventDefault();
  const stock = e.target.querySelector('input[name="stock"]').value;
  const res = await fetch(`/api/admin/books/${bookId}/stock`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stock })
  });
  const data = await res.json();
  if (res.ok) window.location.reload();
  else showNotification(data.message || 'Erreur lors de la mise à jour', 'error');
}

async function redirectToDashboard(userId) {
  const res = await fetch(`/api/users/profile?userId=${userId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  if (res.ok && data.user) {
    if (data.user.role === 1) {
      window.location.href = `/admin/users?userId=${userId}`;
    } else {
      window.location.href = `/dashboard?userId=${userId}`;
    }
  } else {
    showNotification('Erreur lors de la vérification du rôle', 'error');
  }
}