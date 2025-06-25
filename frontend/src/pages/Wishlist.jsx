import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Wishlist = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetch('/api/wishlist')
      .then(res => res.json())
      .then(data => {
        setBooks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError('Erreur lors du chargement des favoris.');
        setLoading(false);
      });
  }, []);

  const removeFromWishlist = async (bookId) => {
    const res = await fetch(`/api/wishlist/${bookId}`, { method: 'DELETE' });
    if (res.ok) {
      setBooks(books => books.filter(b => b._id !== bookId));
      setAlert({ type: 'success', msg: 'Livre retiré des favoris.' });
    } else {
      setAlert({ type: 'danger', msg: 'Erreur lors du retrait.' });
    }
  };

  const moveToCart = async (bookId) => {
    const res = await fetch(`/api/wishlist/${bookId}/move-to-cart`, { method: 'POST' });
    if (res.ok) {
      setBooks(books => books.filter(b => b._id !== bookId));
      setAlert({ type: 'success', msg: 'Livre déplacé vers le panier.' });
    } else {
      setAlert({ type: 'danger', msg: 'Erreur lors du déplacement.' });
    }
  };

  return (
    <>
      <Navbar />
      <div className="container py-4" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)' }}>
        <h2 className="mb-4"><i className="bi bi-heart-fill text-danger"></i> Mes Favoris</h2>
        {alert && (
          <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
            {alert.msg}
            <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
          </div>
        )}
        {loading ? (
          <div className="alert alert-info">Chargement...</div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : books.length > 0 ? (
          <div className="row">
            {books.map(book => (
              <div className="col-md-4 mb-4" key={book._id}>
                <div className="wishlist-card p-3">
                  <div className="d-flex align-items-center">
                    <img src={book.image || '/images/books/default-cover.png'} alt="Couverture" className="book-cover me-3" />
                    <div>
                      <h5 className="mb-1">{book.title}</h5>
                      <p className="mb-1 text-muted">{book.author}</p>
                      <div className="d-flex align-items-center gap-2">
                        <button className="btn btn-outline-primary btn-sm move-to-cart-btn" onClick={() => moveToCart(book._id)}><i className="bi bi-cart-plus"></i> Déplacer vers le panier</button>
                        <button className="btn btn-outline-danger btn-sm toggle-wishlist-btn" onClick={() => removeFromWishlist(book._id)}><i className="bi bi-heart-fill"></i> Retirer</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="alert alert-info">Aucun livre dans vos favoris pour le moment.</div>
        )}
      </div>
      <Footer />
      {/* Inline styles for the page, as in the EJS */}
      <style>{`
        body { background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%); min-height: 100vh; }
        .wishlist-card { background: #fff; border-radius: 1.2rem; box-shadow: 0 4px 24px 0 rgba(60,72,88,0.08); padding: 2rem 2.5rem; margin-bottom: 2rem; border: none; }
        .book-cover { height: 180px; width: 130px; object-fit: cover; border-radius: 0.3rem; box-shadow: 0 2px 8px #0001; }
        .remove-btn { color: #b26a00; }
        .move-btn { color: #0d6efd; }
      `}</style>
    </>
  );
};

export default Wishlist;
