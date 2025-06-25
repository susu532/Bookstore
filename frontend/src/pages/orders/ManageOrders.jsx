import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Erreur lors du chargement des commandes.');
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <div className="row g-4">
          <div className="row mt-5">
            <div className="col-12">
              <div className="card shadow-sm p-4">
                <h3 className="mb-4 text-secondary"><i className="bi bi-clock-history"></i> Historique des Commandes</h3>
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>ID Commande</th>
                        <th>Date</th>
                        <th>Total (€)</th>
                        <th>Livres</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="4" className="text-center text-secondary">Chargement...</td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td colSpan="4" className="text-center text-danger">{error}</td>
                        </tr>
                      ) : orders.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center text-secondary">Aucune commande passée.</td>
                        </tr>
                      ) : (
                        orders.map(order => (
                          <tr key={order._id}>
                            <td><span className="order-id"><i className="bi bi-hash"></i> {order._id}</span></td>
                            <td><span className="order-date"><i className="bi bi-calendar-event"></i> {new Date(order.createdAt).toLocaleDateString()}</span></td>
                            <td><span className="order-total"><i className="bi bi-currency-euro"></i> {order.total.toFixed(2)}</span></td>
                            <td>
                              {order.books.map(item => (
                                <span key={item.book._id} className="badge bg-info text-dark mb-1">
                                  <i className="bi bi-book"></i> {item.book.title} <span className="text-primary">(x{item.quantity})</span><br />
                                </span>
                              ))}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container mt-5">
        <Footer />
      </div>
      {/* Inline styles for the page, as in the EJS */}
      <style>{`
        body { background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%); min-height: 100vh; }
        .card { border-radius: 1.2rem; box-shadow: 0 4px 24px rgba(0,0,0,0.07); }
        .form-label { font-weight: 500; color: #6366f1; }
        .table thead { background: #6366f1; color: #fff; }
        .btn-primary, .btn-success { border-radius: 2rem; font-weight: 600; letter-spacing: 0.03em; }
        .badge { font-size: 1em; border-radius: 0.7em; }
        .order-id { font-family: monospace; font-size: 0.95em; color: #6366f1; }
        .order-date { font-size: 0.95em; color: #64748b; }
        .order-total { font-weight: bold; color: #16a34a; }
        .cart-table td, .cart-table th { vertical-align: middle; }
        @media (max-width: 768px) {
          .card { margin-bottom: 2rem; }
          .table-responsive { font-size: 0.97em; }
        }
      `}</style>
    </>
  );
};

export default ManageOrders;
