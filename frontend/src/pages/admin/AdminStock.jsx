import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { authFetch } from '../Login';

const AdminStock = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAllStock();
  }, []);

  const loadAllStock = async () => {
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
      setError('Erreur lors du chargement du stock.');
      setLoading(false);
    }
  };

  const updateStock = async (bookId, stock) => {
    const res = await authFetch(`/api/books/${bookId}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock })
    });
    if (res.status === 401 || res.status === 403) {
      window.location.href = '/login';
      return;
    }
    const data = await res.json();
    if (res.ok) {
      loadAllStock();
    } else {
      alert(data.message || 'Erreur lors de la mise à jour du stock');
    }
  };

  return (
    <>
      <Navbar />
      <div className="container py-4" style={{ minHeight: '100vh', fontFamily: "'Montserrat', Arial, sans-serif", background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)' }}>
        <div className="stock-header mb-4 shadow" style={{ background: 'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)', color: '#fff', borderRadius: '1rem', padding: '2rem 2rem 1rem 2rem', boxShadow: '0 4px 24px 0 rgba(99,102,241,0.08)', marginBottom: '2rem', textAlign: 'center' }}>
          <h2 className="fw-bold mb-0">Gestion des Stocks</h2>
          <p className="mt-2 mb-0">Surveillez et ajustez le stock de vos livres en toute simplicité.</p>
        </div>
        <div className="table-responsive">
          <table className="table table-modern align-middle">
            <thead>
              <tr>
                <th scope="col">Titre</th>
                <th scope="col">Stock</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3" className="text-center">Chargement...</td></tr>
              ) : error ? (
                <tr><td colSpan="3" className="text-center text-danger">{error}</td></tr>
              ) : books.length === 0 ? (
                <tr><td colSpan="3" className="text-center alert alert-info">Aucun livre trouvé.</td></tr>
              ) : (
                books.map(book => (
                  <tr key={book._id}>
                    <td className="fw-semibold text-primary">{book.title}</td>
                    <td><span className="badge rounded-pill bg-info text-dark fs-6 px-3 py-2">{book.stock}</span></td>
                    <td>
                      <form className="d-flex align-items-center gap-2" onSubmit={e => { e.preventDefault(); updateStock(book._id, e.target.stock.value); }}>
                        <input type="number" className="form-control form-control-sm w-50" name="stock" defaultValue={book.stock} min="0" required />
                        <button type="submit" className="btn btn-gradient btn-sm fw-bold shadow-sm">Mettre à jour</button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
      {/* Inline styles for the page, as in the EJS */}
      <style>{`
        body { font-family: 'Montserrat', Arial, sans-serif; background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%); min-height: 100vh; }
        .stock-header { background: linear-gradient(90deg, #6366f1 0%, #06b6d4 100%); color: #fff; border-radius: 1rem; padding: 2rem 2rem 1rem 2rem; box-shadow: 0 4px 24px 0 rgba(99,102,241,0.08); margin-bottom: 2rem; text-align: center; }
        .table-modern { background: #fff; border-radius: 1rem; box-shadow: 0 2px 12px 0 rgba(0,0,0,0.06); overflow: hidden; }
        .table-modern th { background: #6366f1; color: #fff; border: none; }
        .table-modern td { vertical-align: middle; border-top: none; }
        .btn-gradient { background: linear-gradient(90deg, #06b6d4 0%, #6366f1 100%); color: #fff; border: none; transition: background 0.2s; }
        .btn-gradient:hover { background: linear-gradient(90deg, #6366f1 0%, #06b6d4 100%); color: #fff; }
        .form-control:focus { border-color: #6366f1; box-shadow: 0 0 0 0.2rem rgba(99,102,241,0.15); }
        @media (max-width: 768px) { .stock-header { padding: 1rem; font-size: 1.2rem; } .table-responsive { font-size: 0.95rem; } }
      `}</style>
    </>
  );
};

export default AdminStock;
