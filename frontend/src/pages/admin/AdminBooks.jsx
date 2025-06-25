import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { authFetch } from '../Login';

const AdminBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadAllBooks();
  }, []);

  const loadAllBooks = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/books');
      if (res.status === 401 || res.status === 403) {
        window.location.href = '/login';
        return;
      }
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch {
      setError('Erreur lors du chargement des livres.');
      setLoading(false);
    }
  };

  const deleteBook = async bookId => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) return;
    const res = await authFetch(`/api/books/${bookId}`, { method: 'DELETE' });
    if (res.status === 401 || res.status === 403) {
      window.location.href = '/login';
      return;
    }
    const data = await res.json();
    if (res.ok) {
      loadAllBooks();
    } else {
      alert(data.message || 'Erreur lors de la suppression');
    }
  };

  // Helper for book image
  const getBookImageUrl = image => {
    if (!image || image.trim() === '') return '/images/books/default-cover.png';
    if (image.startsWith('/uploads/avatars/') || image.startsWith('/uploads/books/')) return image;
    if (image.startsWith('/') || image.startsWith('http')) return image;
    return '/images/books/' + image;
  };

  // Filter books by search
  const filteredBooks = books.filter(book => {
    const text = `${book.title} ${book.author} ${book.genre}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <>
      <Navbar />
      <div className="container py-5" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)' }}>
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card card-glass shadow-lg border-0" style={{ background: 'rgba(255,255,255,0.85)', borderRadius: '1.25rem', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.18)' }}>
              <div className="card-body">
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4">
                  <h2 className="fw-bold mb-3 mb-md-0 text-primary">
                    <i className="bi bi-book-half me-2"></i>Gestion des Livres
                  </h2>
                  <a href="/admin/books/add" className="btn btn-gradient btn-lg shadow-sm">
                    <i className="bi bi-plus-circle me-2"></i>Ajouter un Livre
                  </a>
                </div>
                <form className="mb-4" onSubmit={e => { e.preventDefault(); }}>
                  <div className="input-group input-group-lg">
                    <input type="text" className="form-control rounded-start" placeholder="Rechercher par titre, auteur ou genre..." value={search} onChange={e => setSearch(e.target.value)} />
                    <button type="button" className="btn btn-gradient rounded-end" tabIndex={-1}>
                      <i className="bi bi-search"></i> Rechercher
                    </button>
                  </div>
                </form>
                <div className="table-responsive rounded-3">
                  <table className="table align-middle table-hover shadow-sm mb-0">
                    <thead>
                      <tr>
                        <th scope="col"><i className="bi bi-journal-text"></i> Titre</th>
                        <th scope="col"><i className="bi bi-person"></i> Auteur</th>
                        <th scope="col"><i className="bi bi-tags"></i> Genre</th>
                        <th scope="col"><i className="bi bi-currency-euro"></i> Prix (€)</th>
                        <th scope="col"><i className="bi bi-box"></i> Stock</th>
                        <th scope="col"><i className="bi bi-image"></i> Couverture</th>
                        <th scope="col"><i className="bi bi-gear"></i> Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan="7" className="text-center">Chargement...</td></tr>
                      ) : error ? (
                        <tr><td colSpan="7" className="text-center text-danger">{error}</td></tr>
                      ) : filteredBooks.length === 0 ? (
                        <tr><td colSpan="7" className="text-center alert alert-info">Aucun livre trouvé.</td></tr>
                      ) : (
                        filteredBooks.map(book => (
                          <tr key={book._id}>
                            <td className="fw-semibold text-primary">{book.title}</td>
                            <td>{book.author}</td>
                            <td><span className="badge bg-info bg-gradient text-dark px-3 py-2 fs-6">{book.genre}</span></td>
                            <td><span className="fw-bold text-success">{book.price}</span></td>
                            <td>{book.stock > 5 ? <span className="badge bg-success bg-gradient px-3 py-2">{book.stock}</span> : book.stock > 0 ? <span className="badge bg-warning bg-gradient text-dark px-3 py-2">{book.stock}</span> : <span className="badge bg-danger bg-gradient px-3 py-2">Rupture</span>}</td>
                            <td>{book.image ? <img src={getBookImageUrl(book.image)} alt="Couverture" style={{ width: 48, height: 64, objectFit: 'cover', borderRadius: '0.3rem', boxShadow: '0 2px 8px #0001' }} onError={e => { e.target.onerror = null; e.target.src = '/images/books/default-cover.png'; }} /> : <span className="text-muted">Aucune</span>}</td>
                            <td>
                              <a href={`/admin/books/edit/${book._id}`} className="btn btn-sm btn-outline-primary me-2 mb-1">
                                <i className="bi bi-pencil-square"></i>
                              </a>
                              <button onClick={() => deleteBook(book._id)} className="btn btn-sm btn-outline-danger mb-1">
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="mt-5">
              <Footer />
            </div>
          </div>
        </div>
      </div>
      {/* Inline styles for the page, as in the EJS */}
      <style>{`
        body { background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%); min-height: 100vh; }
        .card-glass { background: rgba(255,255,255,0.85); border-radius: 1.25rem; box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18); backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.18); }
        .table thead { background: linear-gradient(90deg, #6366f1 0%, #06b6d4 100%); color: #fff; }
        .btn-gradient { background: linear-gradient(90deg, #6366f1 0%, #06b6d4 100%); color: #fff; border: none; }
        .btn-gradient:hover { background: linear-gradient(90deg, #06b6d4 0%, #6366f1 100%); color: #fff; }
        .form-control:focus { border-color: #6366f1; box-shadow: 0 0 0 0.2rem rgba(99,102,241,.25); }
        @media (max-width: 767px) { .table-responsive { font-size: 0.95rem; } h2 { font-size: 1.5rem; } }
      `}</style>
    </>
  );
};

export default AdminBooks;
