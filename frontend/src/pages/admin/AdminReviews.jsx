import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { authFetch } from '../Login';

const statusClass = status =>
  status === 'approved' ? 'badge-approved' : status === 'rejected' ? 'badge-rejected' : 'badge-pending';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReviews();
    // Optionally, add real-time updates via Socket.io if needed
    // (not implemented here for simplicity)
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/admin/reviews');
      if (res.status === 401 || res.status === 403) {
        window.location.href = '/login';
        return;
      }
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch {
      setError('Erreur lors du chargement des avis.');
      setLoading(false);
    }
  };

  const moderateReview = async (id, action) => {
    let method = action === 'delete' ? 'DELETE' : 'PUT';
    const res = await authFetch(`/api/admin/reviews/${id}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: method === 'PUT' ? JSON.stringify({ action }) : undefined
    });
    if (res.status === 401 || res.status === 403) {
      window.location.href = '/login';
      return;
    }
    if (res.ok) loadReviews();
    else alert('Erreur lors de la modération.');
  };

  return (
    <>
      <Navbar />
      <div className="container py-5" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)' }}>
        <div className="moderation-card">
          <h2 className="mb-4"><i className="bi bi-chat-left-text me-2"></i>Modération des Avis & Notations</h2>
          {loading ? (
            <div className="alert alert-info text-center">Chargement...</div>
          ) : error ? (
            <div className="alert alert-danger text-center">{error}</div>
          ) : reviews.length === 0 ? (
            <div className="alert alert-info text-center">Aucun avis à modérer.</div>
          ) : (
            reviews.map(r => (
              <div key={r._id} className="review-row d-flex align-items-center justify-content-between">
                <div>
                  <b>{r.username || 'Utilisateur'}</b> sur <i>{r.bookTitle || 'Livre inconnu'}</i><br />
                  <span className="text-secondary">{r.text}</span><br />
                  <span className={`badge ${statusClass(r.status)}`}>{r.status || 'pending'}</span>
                  <span className="ms-2 text-warning">{r.rating ? '★'.repeat(r.rating) : ''}</span>
                </div>
                <div className="review-actions">
                  <button className="btn btn-danger btn-sm" onClick={() => moderateReview(r._id, 'delete')}><i className="bi bi-trash"></i> Supprimer</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
      {/* Inline styles for the page, as in the EJS */}
      <style>{`
        body { background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%); min-height: 100vh; }
        .moderation-card { background: #fff; border-radius: 1.2rem; box-shadow: 0 4px 24px 0 rgba(60,72,88,0.08); padding: 2rem 2.5rem; margin-bottom: 2rem; border: none; }
        .review-row { border-bottom: 1px solid #e5e7eb; padding: 1rem 0; }
        .review-row:last-child { border-bottom: none; }
        .review-actions button { margin-right: 0.5rem; }
        .badge-pending { background: #fff7e6; color: #b26a00; }
        .badge-approved { background: #e6f9f0; color: #1a7f5a; }
        .badge-rejected { background: #ffe6e6; color: #d32f2f; }
      `}</style>
    </>
  );
};

export default AdminReviews;
