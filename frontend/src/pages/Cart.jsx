import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { authFetch } from './Login';

const Cart = () => {
  const [cart, setCart] = useState({ books: [] });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    shippingAddress: '',
    deliveryMethod: 'standard',
    promoCode: '',
    paymentMethod: 'card',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch cart from backend
  useEffect(() => {
    setLoading(true);
    authFetch('/api/cart')
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          window.location.href = '/login';
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (!data) return;
        setCart(data || { books: [] });
        setLoading(false);
      })
      .catch(() => {
        setCart({ books: [] });
        setLoading(false);
      });
  }, []);

  const handleInput = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Remove item from cart
  const handleRemove = async (bookId) => {
    await authFetch(`/api/cart/${bookId}`, { method: 'DELETE' });
    // Refresh cart
    authFetch('/api/cart')
      .then(res => res.json())
      .then(data => setCart(data || { books: [] }));
  };

  // Update quantity
  const handleQuantity = async (bookId, quantity) => {
    if (quantity < 1) return;
    await authFetch(`/api/cart/${bookId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity })
    });
    authFetch('/api/cart')
      .then(res => res.json())
      .then(data => setCart(data || { books: [] }));
  };

  // Checkout
  const handleCheckout = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const res = await authFetch('/api/orders/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setSubmitting(false);
      alert('Commande confirmée ! Un email de confirmation a été envoyé.');
      window.location.href = '/orders';
    } else {
      setError('Erreur lors de la commande.');
      setSubmitting(false);
    }
  };

  const total = cart.books.reduce((sum, item) => sum + item.book.price * item.quantity, 0);

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-7 col-md-9">
            <div className="cart-card" style={{borderRadius:'1rem',boxShadow:'0 6px 32px rgba(0,0,0,0.07)',background:'#fff',marginBottom:'2rem',overflow:'hidden'}}>
              <div className="cart-header text-center" style={{background:'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)',color:'#fff',borderRadius:'1rem 1rem 0 0',padding:'2rem 1.5rem 1rem 1.5rem',boxShadow:'0 4px 24px rgba(99,102,241,0.08)'}}>
                <h2 className="fw-bold mb-1" style={{fontSize:'2.2rem',letterSpacing:'-1px'}}>Votre Panier</h2>
                <p className="mb-0" style={{fontWeight:500}}>Vérifiez vos livres et passez commande en toute simplicité.</p>
              </div>
              <div className="cart-body p-4">
                {loading ? (
                  <div className="text-center py-5">Chargement...</div>
                ) : cart.books.length === 0 ? (
                  <div className="alert alert-warning text-center" style={{borderRadius:'1rem',background:'#fef3c7',color:'#b45309',fontWeight:600,boxShadow:'0 2px 12px rgba(255, 186, 8, 0.08)'}}>
                    <i className="bi bi-emoji-frown fs-1"></i>
                    <p className="mt-3 mb-0">Votre panier est vide.<br/>Ajoutez des livres pour commencer !</p>
                  </div>
                ) : (
                  <ul className="list-group list-group-flush mb-4">
                    {cart.books.map((item, idx) => (
                      <li key={idx} className="list-group-item d-flex justify-content-between align-items-center py-3" style={{background:'transparent',border:'none',borderBottom:'1px solid #e0e7ff',fontWeight:500}}>
                        <span>{item.book.title} <span className="text-muted">x{item.quantity}</span></span>
                        <span className="fw-bold" style={{color:'#6366f1'}}>{(item.book.price * item.quantity).toFixed(2)} €</span>
                        <div className="d-flex align-items-center gap-2">
                          <input type="number" min={1} value={item.quantity} onChange={e => handleQuantity(item.book._id, Number(e.target.value))} style={{width:'60px',borderRadius:'0.75rem',textAlign:'center'}} />
                          <button className="btn btn-danger btn-sm" style={{borderRadius:'1rem'}} onClick={() => handleRemove(item.book._id)}><i className="bi bi-trash"></i></button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="cart-footer bg-light p-4 rounded-bottom-4" style={{background:'linear-gradient(90deg, #e0e7ff 0%, #fff 100%)',borderRadius:'0 0 1rem 1rem',boxShadow:'0 -2px 12px rgba(99,102,241,0.06)'}}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fw-bold" style={{fontSize:'1.15rem'}}>Total :</span>
                  <span className="fw-bold" style={{fontSize:'1.25rem',color:'#6366f1'}}>{total.toFixed(2)} €</span>
                </div>
                <button className="btn btn-primary w-100 py-2" style={{borderRadius:'1.5rem',fontWeight:700,letterSpacing:'1px'}} onClick={()=>setShowModal(true)} disabled={cart.books.length===0}>Passer la commande</button>
                {error && <div className="alert alert-danger mt-3">{error}</div>}
              </div>
            </div>
            {/* Modal for checkout form can be added here if needed */}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Cart;
