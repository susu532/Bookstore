import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Book = () => {
  const [user, setUser] = useState(null);
  const [book, setBook] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(0);
  const [loadingComments, setLoadingComments] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get bookId from URL
  const bookId = window.location.pathname.split('/').pop();

  // Fetch user info
  useEffect(() => {
    fetch('/api/users/me')
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(() => setUser(null));
  }, []);

  // Fetch book details
  useEffect(() => {
    fetch(`/api/books/${bookId}`)
      .then(res => res.json())
      .then(data => setBook(data))
      .catch(() => setError('Erreur lors du chargement du livre.'));
  }, [bookId]);

  // Fetch comments
  useEffect(() => {
    setLoadingComments(true);
    fetch(`/api/books/${bookId}/comments`)
      .then(res => res.json())
      .then(data => {
        setComments(Array.isArray(data) ? data : []);
        setLoadingComments(false);
      })
      .catch(() => {
        setComments([]);
        setLoadingComments(false);
      });
  }, [bookId]);

  // Check if in wishlist
  useEffect(() => {
    if (user && book) {
      setInWishlist(user.wishlist && user.wishlist.includes(book._id));
    }
  }, [user, book]);

  const handleAddToCart = async e => {
    e.preventDefault();
    if (!user) return setError('Connectez-vous pour ajouter au panier.');
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId: book._id, quantity })
    });
    if (res.ok) {
      setSuccess('Ajouté au panier !');
      setTimeout(() => setSuccess(''), 2000);
    } else {
      setError('Erreur lors de l\'ajout au panier.');
    }
  };

  const handleWishlist = async () => {
    if (!user) return setError('Connectez-vous pour gérer la wishlist.');
    const method = inWishlist ? 'DELETE' : 'POST';
    const res = await fetch(`/api/wishlist/${book._id}`, { method });
    if (res.ok) {
      setInWishlist(v => !v);
      setSuccess(inWishlist ? 'Retiré des favoris !' : 'Ajouté aux favoris !');
      setTimeout(() => setSuccess(''), 2000);
    } else {
      setError('Erreur lors de la mise à jour de la wishlist.');
    }
  };

  const handleBorrow = async () => {
    if (!user) return setError('Connectez-vous pour emprunter.');
    const res = await fetch('/api/emprunts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId: book._id })
    });
    if (res.ok) {
      setSuccess('Livre emprunté !');
      setTimeout(() => setSuccess(''), 2000);
    } else {
      setError('Erreur lors de l\'emprunt.');
    }
  };

  const handleCommentSubmit = async e => {
    e.preventDefault();
    if (!user) return setError('Connectez-vous pour commenter.');
    if (!commentText && !rating) return;
    const res = await fetch(`/api/books/${book._id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: commentText, rating })
    });
    if (res.ok) {
      setCommentText('');
      setRating(0);
      setSuccess('Commentaire ajouté !');
      // Refresh comments
      fetch(`/api/books/${bookId}/comments`).then(res => res.json()).then(data => setComments(Array.isArray(data) ? data : []));
      setTimeout(() => setSuccess(''), 2000);
    } else {
      setError('Erreur lors de l\'ajout du commentaire.');
    }
  };

  if (!book) return <div className="container py-5"><Navbar /><div className="alert alert-info">Chargement du livre...</div><Footer /></div>;

  const avgRating = comments.length ? (comments.reduce((a, c) => a + (c.rating || 0), 0) / comments.length).toFixed(1) : '-';

  return (
    <>
      <Navbar />
      <div className="container py-4">
        <div className="row g-5">
          <div className="col-md-5">
            <div className="card shadow-lg animate__animated animate__fadeInLeft" style={{borderRadius:'1.5rem',boxShadow:'0 6px 32px rgba(99,102,241,0.10)',background:'#fff',padding:'2rem',textAlign:'center'}}>
              <img src={book.image || '/images/books/default-cover.png'} alt={book.title} style={{width:'140px',height:'180px',objectFit:'cover',borderRadius:'1.2rem',boxShadow:'0 2px 16px rgba(99,102,241,0.13)',marginBottom:'1.5rem'}} />
              <h2 className="fw-bold mb-2" style={{color:'#6366f1'}}>{book.title}</h2>
              <div className="mb-2 text-muted">{book.author}</div>
              <div className="mb-2"><span className="badge bg-gradient-info" style={{background:'linear-gradient(90deg, #06b6d4 0%, #6366f1 100%)',color:'#fff',fontWeight:600}}>{book.genre}</span></div>
              <div className="mb-3 fw-bold" style={{fontSize:'1.2rem',color:'#f59e42'}}>{book.price} €</div>
              <div className="mb-3">
                <button className={`btn btn-outline-${inWishlist ? 'danger' : 'primary'} w-100`} style={{borderRadius:'1.5rem',fontWeight:700,letterSpacing:'1px'}} onClick={()=>setInWishlist(!inWishlist)}>
                  <i className={`bi ${inWishlist ? 'bi-heart-fill' : 'bi-heart'} me-2`}></i>
                  {inWishlist ? 'Retirer de la wishlist' : 'Ajouter à la wishlist'}
                </button>
              </div>
              <div className="mb-3">
                <input type="number" min={1} max={book.stock} value={quantity} onChange={e=>setQuantity(Number(e.target.value))} className="form-control form-control-lg text-center" style={{borderRadius:'1.5rem',width:'120px',margin:'0 auto',boxShadow:'0 1px 6px rgba(99,102,241,0.06)'}} />
              </div>
              <button className="btn btn-warning w-100 fw-bold" style={{borderRadius:'1.5rem',fontWeight:700,letterSpacing:'1px'}} disabled={book.stock===0} onClick={handleAddToCart}>Ajouter au panier</button>
              {book.stock === 0 && <div className="alert alert-danger mt-3">Rupture de stock</div>}
            </div>
          </div>
          <div className="col-md-7">
            <div className="card shadow-lg animate__animated animate__fadeInRight" style={{borderRadius:'1.5rem',boxShadow:'0 6px 32px rgba(99,102,241,0.10)',background:'#fff',padding:'2rem'}}>
              <h4 className="fw-bold mb-3" style={{color:'#6366f1'}}>Description</h4>
              <p style={{fontSize:'1.1rem'}}>{book.description}</p>
              <div className="mb-4">
                <span className="badge bg-gradient-success me-2" style={{background:'linear-gradient(90deg, #34d399 0%, #06b6d4 100%)',color:'#fff',fontWeight:700,fontSize:'1.1rem',padding:'0.5em 1.2em',borderRadius:'1.5rem'}}>Stock: {book.stock}</span>
              </div>
              <h5 className="fw-bold mb-3" style={{color:'#6366f1'}}>Commentaires</h5>
              <div className="comments-list mb-4" style={{maxHeight:'220px',overflowY:'auto'}}>
                {comments.length === 0 ? (
                  <div className="alert alert-info">Aucun commentaire pour ce livre.</div>
                ) : (
                  comments.map(comment => (
                    <div key={comment._id} className="mb-3 p-3 rounded-4 shadow-sm bg-light animate__animated animate__fadeInUp" style={{borderLeft:'4px solid #6366f1'}}>
                      <div className="d-flex align-items-center mb-2">
                        <img src={comment.avatar || '/images/logo.png'} alt={comment.username} style={{width:'36px',height:'36px',borderRadius:'50%',objectFit:'cover',marginRight:'0.75rem',boxShadow:'0 1px 4px rgba(99,102,241,0.10)'}} />
                        <span className="fw-bold me-2">{comment.username}</span>
                        <span className="badge bg-gradient-info" style={{background:'linear-gradient(90deg, #06b6d4 0%, #6366f1 100%)',color:'#fff',fontWeight:600}}>{comment.rating} ★</span>
                      </div>
                      <div>{comment.text}</div>
                    </div>
                  ))
                )}
                {loadingComments && <div className="text-center py-3"><i className="bi bi-arrow-clockwise spin" style={{fontSize:'1.5rem'}}></i></div>}
              </div>
              <form className="mb-2" onSubmit={handleCommentSubmit}>
                <div className="mb-2">
                  <textarea className="form-control" rows={2} placeholder="Votre commentaire..." value={commentText} onChange={e=>setCommentText(e.target.value)} style={{borderRadius:'1.25rem',boxShadow:'0 1px 6px rgba(99,102,241,0.06)'}} />
                </div>
                <div className="d-flex align-items-center mb-2">
                  <input type="number" min={1} max={5} value={rating} onChange={e=>setRating(Number(e.target.value))} className="form-control form-control-sm me-2" style={{width:'80px',borderRadius:'1.25rem'}} placeholder="Note (1-5)" />
                  <button className="btn btn-primary btn-sm" style={{borderRadius:'1.25rem',fontWeight:700}}>Envoyer</button>
                </div>
                {error && <div className="alert alert-danger py-2">{error}</div>}
                {success && <div className="alert alert-success py-2">{success}</div>}
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <style>{`
        body { background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%); min-height: 100vh; }
        .book-card { border-radius: 1.5rem; box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18); background: rgba(255,255,255,0.95); padding: 2.5rem 2rem; margin-top: 3rem; margin-bottom: 3rem; transition: box-shadow 0.2s; }
        .book-card:hover { box-shadow: 0 16px 48px 0 rgba(31, 38, 135, 0.25); }
        .book-title { color: #4f46e5; font-weight: 700; font-size: 2.5rem; margin-bottom: 1rem; letter-spacing: -1px; }
        .badge-genre { background: linear-gradient(90deg, #6366f1 0%, #06b6d4 100%); color: #fff; font-size: 1rem; border-radius: 0.75rem; padding: 0.5em 1em; margin-left: 0.5em; }
        .price-tag { color: #10b981; font-size: 1.5rem; font-weight: 600; }
        .form-label { font-weight: 500; color: #6366f1; }
        .btn-primary { background: linear-gradient(90deg, #6366f1 0%, #06b6d4 100%); border: none; font-weight: 600; letter-spacing: 0.5px; transition: background 0.2s; }
        .btn-primary:hover { background: linear-gradient(90deg, #06b6d4 0%, #6366f1 100%); }
        @media (max-width: 576px) { .book-card { padding: 1.2rem 0.5rem; } .book-title { font-size: 2rem; } }
      `}</style>
    </>
  );
};

export default Book;
