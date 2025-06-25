import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { authFetch } from '../Login';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadAllOrders();
  }, []);

  const loadAllOrders = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/admin/orders');
      if (res.status === 401 || res.status === 403) {
        window.location.href = '/login';
        return;
      }
      if (!res.ok) throw new Error('Erreur lors du chargement des commandes');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch {
      setError('Erreur lors du chargement des commandes.');
      setLoading(false);
    }
  };

  // Filter orders by user name, email, or book title
  const filteredOrders = orders.filter(order => {
    const userName = order.user && order.user.name ? order.user.name.toLowerCase() : '';
    const userEmail = order.user && order.user.email ? order.user.email.toLowerCase() : '';
    const booksData = order.books.map(item => item.book.title.toLowerCase()).join(' ');
    const value = search.toLowerCase();
    return userName.includes(value) || userEmail.includes(value) || booksData.includes(value);
  });

  return (
    <>
      <Navbar />
      <div className="container py-4" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)' }}>
        <div className="orders-header shadow" style={{ background: 'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)', color: '#fff', borderRadius: '1rem 1rem 0 0', padding: '2rem 1rem 1rem 1rem', boxShadow: '0 4px 12px rgba(99,102,241,0.08)', textAlign: 'center', marginBottom: '2rem' }}>
          <h2 className="mb-0"><i className="bi bi-bag-check-fill me-2"></i>Historique de toutes les commandes</h2>
          <p className="mb-0" style={{ fontSize: '1.1rem' }}>Consultez l'historique de toutes les commandes des utilisateurs.</p>
        </div>
        <div className="row mb-4">
          <div className="col-md-6 mx-auto">
            <input type="text" className="form-control" placeholder="Rechercher par nom, email, livre..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="row justify-content-center" id="ordersList">
          {loading ? (
            <div className="alert alert-info text-center mt-4 shadow-sm" role="alert">
              <i className="bi bi-info-circle-fill me-2"></i>Chargement...
            </div>
          ) : error ? (
            <div className="alert alert-danger text-center mt-4 shadow-sm" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="alert alert-info text-center mt-4 shadow-sm" role="alert">
              <i className="bi bi-info-circle-fill me-2"></i>Aucune commande trouvée.
            </div>
          ) : (
            filteredOrders.map(order => {
              const userName = order.user && order.user.name ? order.user.name : 'Utilisateur inconnu';
              const userEmail = order.user && order.user.email ? order.user.email : '';
              const orderDate = new Date(order.createdAt).toLocaleDateString();
              return (
                <div key={order._id} className="col-12 col-md-8 col-lg-6 order-item mb-3">
                  <div className="card order-card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="order-date"><i className="bi bi-calendar-event me-1"></i>Date : {orderDate}</span>
                        <span className="order-total"><i className="bi bi-currency-euro me-1"></i>{order.total} €</span>
                      </div>
                      <div className="mb-2">
                        <span className="fw-bold text-secondary"><i className="bi bi-person-circle me-1"></i>Utilisateur : {userName} &lt;{userEmail}&gt;</span>
                      </div>
                      <hr />
                      <h6 className="mb-2 text-primary"><i className="bi bi-book-half me-1"></i>Livres commandés :</h6>
                      <ul className="list-unstyled book-list mb-0">
                        {order.books.map(item => (
                          <li key={item.book._id} style={{ background: '#f1f5f9', borderRadius: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', color: '#334155', fontSize: '1rem' }}>
                            <span className="fw-semibold">{item.book.title}</span>
                            <span className="badge bg-gradient bg-info text-dark ms-2">Quantité : {item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <Footer />
      {/* Inline styles for the page, as in the EJS */}
      <style>{`
        body { background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%); min-height: 100vh; }
        .orders-header { background: linear-gradient(90deg, #6366f1 0%, #06b6d4 100%); color: #fff; border-radius: 1rem 1rem 0 0; padding: 2rem 1rem 1rem 1rem; box-shadow: 0 4px 12px rgba(99,102,241,0.08); text-align: center; margin-bottom: 2rem; }
        .order-card { border: none; border-radius: 1rem; box-shadow: 0 2px 8px rgba(99,102,241,0.10); margin-bottom: 2rem; background: #fff; transition: transform 0.15s; }
        .order-card:hover { transform: translateY(-4px) scale(1.01); box-shadow: 0 6px 24px rgba(6,182,212,0.13); }
        .order-date { font-size: 1.1rem; font-weight: 500; color: #6366f1; }
        .order-total { font-size: 1.2rem; font-weight: bold; color: #06b6d4; }
        .book-list li { background: #f1f5f9; border-radius: 0.5rem; margin-bottom: 0.5rem; padding: 0.5rem 1rem; color: #334155; font-size: 1rem; }
        @media (max-width: 576px) { .orders-header { font-size: 1.5rem; padding: 1.2rem 0.5rem 0.7rem 0.5rem; } .order-card { padding: 1rem; } }
      `}</style>
    </>
  );
};

export default AdminOrders;
