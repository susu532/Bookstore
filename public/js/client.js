const token = localStorage.getItem('token');

function setAuthHeader() {
  return { 'Authorization': `Bearer ${token}` };
}

// Connexion
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const res = await fetch('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (res.ok) {
    localStorage.setItem('token', data.token);
    window.location.href = '/';
  } else {
    alert(data.message || 'Erreur lors de la connexion');
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
    localStorage.setItem('token', data.token);
    window.location.href = '/';
  } else {
    alert(data.message || 'Erreur lors de l’inscription');
  }
});

// Mise à jour profil
document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const res = await fetch('/api/users/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...setAuthHeader() },
    body: JSON.stringify({ name, email })
  });
  const data = await res.json();
  alert(data.message);
});

// Ajouter au panier
document.getElementById('addToCartForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const bookId = document.querySelector('input[name="bookId"]').value;
  const quantity = document.getElementById('quantity').value;
  const res = await fetch('/api/orders/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...setAuthHeader() },
    body: JSON.stringify({ bookId, quantity })
  });
  const data = await res.json();
  if (res.ok) window.location.href = '/cart';
  else alert(data.message);
});

// Valider la commande
async function checkout() {
  const res = await fetch('/api/orders/checkout', {
    method: 'POST',
    headers: setAuthHeader()
  });
  const data = await res.json();
  if (res.ok) window.location.href = '/orders';
  else alert(data.message);
}

// Déconnexion
function logout() {
  localStorage.removeItem('token');
  window.location.href = '/';
}

// Gestion des utilisateurs (activer/désactiver)
async function toggleUser(userId, isActive) {
  const res = await fetch(`/api/admin/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...setAuthHeader() },
    body: JSON.stringify({ isActive })
  });
  const data = await res.json();
  if (res.ok) window.location.reload();
  else alert(data.message);
}

// Mise à jour du stock
async function updateStock(e, bookId) {
  e.preventDefault();
  const stock = e.target.querySelector('input[name="stock"]').value;
  const res = await fetch(`/api/admin/books/${bookId}/stock`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...setAuthHeader() },
    body: JSON.stringify({ stock })
  });
  const data = await res.json();
  if (res.ok) window.location.reload();
  else alert(data.message);
}