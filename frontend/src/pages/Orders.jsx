import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { authFetch } from './Login';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    authFetch('/api/orders')
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          window.location.href = '/login';
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (!data) return;
        setOrders(Array.isArray(data) ? data : []);
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
        <h2 className="mb-4 fw-bold text-primary text-center animate__animated animate__fadeInDown">
          <i className="bi bi-bag-check-fill me-2"></i>Vos Commandes
        </h2>
        {loading ? (
          <div className="text-center py-5">Chargement...</div>
        ) : error ? (
          <div className="alert alert-danger text-center">{error}</div>
        ) : orders.length === 0 ? (
          <div className="no-orders animate__animated animate__fadeIn" style={{background:'#fef3c7',color:'#b45309',borderRadius:'1.5rem',padding:'2.5rem',textAlign:'center',fontSize:'1.2rem',marginTop:'2rem',boxShadow:'0 2px 12px rgba(255, 186, 8, 0.10)'}}>
            <i className="bi bi-emoji-frown fs-1"></i>
            <p className="mt-3 mb-0">Aucune commande trouvée.<br/>Parcourez notre collection et passez votre première commande !</p>
          </div>
        ) : (
          <div className="row g-4">
            {orders.map(order => (
              <div key={order._id} className="col-md-6">
                <div className="card shadow-lg animate__animated animate__fadeInUp" style={{borderRadius:'1.5rem',boxShadow:'0 6px 32px rgba(99,102,241,0.10)',background:'#fff',padding:'1.5rem'}}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold" style={{color:'#6366f1'}}>Commande #{order._id}</span>
                    <span className="badge bg-gradient-info" style={{background:'linear-gradient(90deg, #06b6d4 0%, #6366f1 100%)',color:'#fff',fontWeight:600}}>{order.books.length} livres</span>
                  </div>
                  <div className="mb-2 text-muted">{new Date(order.createdAt).toLocaleDateString()}</div>
                  <ul className="list-group list-group-flush mb-2">
                    {order.books.map((item, idx) => (
                      <li key={idx} className="list-group-item d-flex justify-content-between align-items-center py-2" style={{background:'transparent',border:'none',fontWeight:500}}>
                        <span>{item.book.title} <span className="text-muted">x{item.quantity}</span></span>
                      </li>
                    ))}
                  </ul>
                  <div className="fw-bold" style={{fontSize:'1.1rem',color:'#f59e42'}}>Total : {order.total} €</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="container mt-5">
        <Footer />
      </div>
    </>
  );
};

export default Orders;
