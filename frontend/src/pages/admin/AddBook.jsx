import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const AddBook = () => {
  const [form, setForm] = useState({ title: '', author: '', genre: '', price: '', description: '', stock: 0 });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setSuccess('Livre ajouté avec succès');
      setForm({ title: '', author: '', genre: '', price: '', description: '', stock: 0 });
    } else {
      const data = await res.json();
      setError(data.message || 'Erreur lors de l\'ajout du livre');
    }
  };

  return (
    <>
      <Navbar />
      <div className="container py-5" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)' }}>
        <div className="row justify-content-center">
          <div className="col-lg-7 col-md-9">
            <div className="card card-modern p-4 p-md-5" style={{ borderRadius: '1.5rem', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)', background: 'rgba(255,255,255,0.95)', border: 'none' }}>
              <h2 className="mb-4 text-center fw-bold" style={{ color: '#6366f1' }}>
                <i className="bi bi-journal-plus me-2"></i>Ajouter un Nouveau Livre
              </h2>
              <form onSubmit={handleSubmit} autoComplete="off">
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">
                    <i className="bi bi-book icon-label"></i>Titre
                  </label>
                  <input type="text" className="form-control" id="title" name="title" placeholder="Ex: Le Petit Prince" required value={form.title} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label htmlFor="author" className="form-label">
                    <i className="bi bi-person icon-label"></i>Auteur
                  </label>
                  <input type="text" className="form-control" id="author" name="author" placeholder="Ex: Antoine de Saint-Exupéry" required value={form.author} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label htmlFor="genre" className="form-label">
                    <i className="bi bi-tags icon-label"></i>Genre
                  </label>
                  <input type="text" className="form-control" id="genre" name="genre" placeholder="Ex: Fiction, Aventure" required value={form.genre} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label htmlFor="price" className="form-label">
                    <i className="bi bi-currency-euro icon-label"></i>Prix (€)
                  </label>
                  <input type="number" className="form-control" id="price" name="price" step="0.01" min="0" placeholder="Ex: 12.99" required value={form.price} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    <i className="bi bi-card-text icon-label"></i>Description
                  </label>
                  <textarea className="form-control" id="description" name="description" rows="3" placeholder="Brève description du livre..." value={form.description} onChange={handleChange}></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="stock" className="form-label">
                    <i className="bi bi-box-seam icon-label"></i>Stock
                  </label>
                  <input type="number" className="form-control" id="stock" name="stock" min="0" required value={form.stock} onChange={handleChange} />
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4">
                  <button type="submit" className="btn btn-primary px-4 mb-2 mb-md-0">
                    <i className="bi bi-plus-circle me-1"></i>Ajouter le Livre
                  </button>
                  <a href="/admin/stock" className="btn btn-secondary px-4">
                    <i className="bi bi-arrow-left me-1"></i>Retour au Stock
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      {/* Inline styles for the page, as in the EJS */}
      <style>{`
        body { background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%); min-height: 100vh; }
        .card-modern { border-radius: 1.5rem; box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15); background: rgba(255,255,255,0.95); border: none; }
        .form-label { font-weight: 600; color: #4f46e5; }
        .btn-primary { background: linear-gradient(90deg, #6366f1 0%, #06b6d4 100%); border: none; font-weight: 600; letter-spacing: 1px; transition: background 0.2s; }
        .btn-primary:hover { background: linear-gradient(90deg, #06b6d4 0%, #6366f1 100%); }
        .btn-secondary { background: #f59e42; border: none; color: #fff; font-weight: 600; transition: background 0.2s; }
        .btn-secondary:hover { background: #f97316; color: #fff; }
        .form-control:focus { border-color: #6366f1; box-shadow: 0 0 0 0.2rem rgba(99,102,241,.15); }
        .icon-label { margin-right: 0.5rem; color: #06b6d4; font-size: 1.2rem; vertical-align: middle; }
        @media (max-width: 576px) { .card-modern { padding: 1rem !important; } h2 { font-size: 1.3rem; } }
      `}</style>
    </>
  );
};

export default AddBook;
