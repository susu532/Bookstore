import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const EditBook = () => {
  const [form, setForm] = useState({ title: '', author: '', genre: '', price: '', description: '', stock: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Assume bookId is in the URL as /admin/edit-book/:id (adapt as needed)
  const bookId = window.location.pathname.split('/').pop();

  useEffect(() => {
    fetch(`/api/books/${bookId}`)
      .then(res => res.json())
      .then(book => {
        setForm({
          title: book.title || '',
          author: book.author || '',
          genre: book.genre || '',
          price: book.price || '',
          description: book.description || '',
          stock: book.stock || ''
        });
        setLoading(false);
      })
      .catch(() => {
        setError('Erreur lors du chargement du livre.');
        setLoading(false);
      });
  }, [bookId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    const res = await fetch(`/api/books/${bookId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      alert('Livre mis à jour avec succès');
      window.location.href = '/books/manage';
    } else {
      const data = await res.json();
      setError(data.message || 'Erreur lors de la mise à jour du livre');
    }
  };

  return (
    <>
      <Navbar />
      <div className="container py-5" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)' }}>
        <div className="row justify-content-center">
          <div className="col-lg-7 col-md-9">
            <div className="card p-4 p-md-5 shadow-lg" style={{ borderRadius: '1.5rem', boxShadow: '0 4px 32px rgba(80, 80, 180, 0.08)', border: 'none' }}>
              <div className="mb-4 text-center">
                <span className="fs-1 text-primary"><i className="bi bi-journal-bookmark-fill"></i></span>
                <h2 className="fw-bold mb-1" style={{ color: '#a21caf' }}>Modifier le Livre</h2>
                <p className="text-muted mb-0">Mettez à jour les informations du livre ci-dessous.</p>
              </div>
              {loading ? (
                <div className="alert alert-info text-center">Chargement...</div>
              ) : error ? (
                <div className="alert alert-danger text-center">{error}</div>
              ) : (
                <form onSubmit={handleSubmit} autoComplete="off">
                  <div className="form-floating mb-3 position-relative">
                    <input type="text" className="form-control" id="title" name="title" value={form.title} onChange={handleChange} placeholder="Titre" required />
                    <label htmlFor="title"><i className="bi bi-book icon-input"></i> Titre</label>
                  </div>
                  <div className="form-floating mb-3 position-relative">
                    <input type="text" className="form-control" id="author" name="author" value={form.author} onChange={handleChange} placeholder="Auteur" required />
                    <label htmlFor="author"><i className="bi bi-person icon-input"></i> Auteur</label>
                  </div>
                  <div className="form-floating mb-3 position-relative">
                    <input type="text" className="form-control" id="genre" name="genre" value={form.genre} onChange={handleChange} placeholder="Genre" required />
                    <label htmlFor="genre"><i className="bi bi-tags icon-input"></i> Genre</label>
                  </div>
                  <div className="form-floating mb-3 position-relative">
                    <input type="number" className="form-control" id="price" name="price" value={form.price} onChange={handleChange} step="0.01" min="0" placeholder="Prix" required />
                    <label htmlFor="price"><i className="bi bi-currency-euro icon-input"></i> Prix (€)</label>
                  </div>
                  <div className="form-floating mb-3 position-relative">
                    <textarea className="form-control" id="description" name="description" value={form.description} onChange={handleChange} placeholder="Description" style={{ height: 100 }} />
                    <label htmlFor="description"><i className="bi bi-card-text icon-input"></i> Description</label>
                  </div>
                  <div className="form-floating mb-4 position-relative">
                    <input type="number" className="form-control" id="stock" name="stock" value={form.stock} onChange={handleChange} min="0" placeholder="Stock" required />
                    <label htmlFor="stock"><i className="bi bi-box-seam icon-input"></i> Stock</label>
                  </div>
                  <div className="d-flex flex-column flex-md-row gap-2 justify-content-center">
                    <button type="submit" className="btn btn-primary px-4 py-2">
                      <i className="bi bi-arrow-repeat me-2"></i>Mettre à jour
                    </button>
                    <a href="/books/manage" className="btn btn-secondary px-4 py-2">
                      <i className="bi bi-x-circle me-2"></i>Annuler
                    </a>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
      {/* Inline styles for the page, as in the EJS */}
      <style>{`
        body { background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%); min-height: 100vh; }
        .card { border-radius: 1.5rem; box-shadow: 0 4px 32px rgba(80, 80, 180, 0.08); border: none; }
        .form-floating > .form-control, .form-floating > .form-select { border-radius: 0.75rem; }
        .form-label { font-weight: 500; color: #4f46e5; }
        .btn-primary { background: linear-gradient(90deg, #6366f1 0%, #a21caf 100%); border: none; font-weight: 600; letter-spacing: 0.5px; box-shadow: 0 2px 8px rgba(99,102,241,0.15); }
        .btn-primary:hover { background: linear-gradient(90deg, #a21caf 0%, #6366f1 100%); }
        .btn-secondary { background: #f59e42; border: none; color: #fff; font-weight: 600; }
        .btn-secondary:hover { background: #ea580c; color: #fff; }
        .icon-input { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #6366f1; font-size: 1.2rem; pointer-events: none; }
        .form-floating .form-control { padding-left: 2.5rem; }
        @media (max-width: 576px) { .card { padding: 0.5rem; } .container { padding: 0.5rem !important; } }
      `}</style>
    </>
  );
};

export default EditBook;
