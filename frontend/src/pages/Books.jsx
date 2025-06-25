import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Books = () => {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user info
  useEffect(() => {
    fetch('/api/users/me')
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(() => setUser(null));
  }, []);

  // Fetch books and filter options
  useEffect(() => {
    setLoading(true);
    fetch('/api/books')
      .then(res => res.json())
      .then(data => {
        setBooks(Array.isArray(data) ? data : []);
        setAuthors([...new Set(data.map(b => b.author))]);
        setGenres([...new Set(data.map(b => b.genre))]);
        setLoading(false);
      })
      .catch(() => {
        setError('Erreur lors du chargement des livres.');
        setLoading(false);
      });
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    setLoading(true);
    let url = '/api/books?';
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (author) url += `author=${encodeURIComponent(author)}&`;
    if (genre) url += `genre=${encodeURIComponent(genre)}&`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setBooks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError('Erreur lors de la recherche.');
        setLoading(false);
      });
  };

  return (
    <>
      <Navbar />
      <div className="container py-4">
        {user && (
          <div className="mb-4 p-3 rounded shadow-sm bg-white d-flex align-items-center gap-4" style={{borderLeft:'6px solid #6366f1',background:'linear-gradient(90deg, #e0e7ff 0%, #fff 100%)',boxShadow:'0 2px 16px rgba(99,102,241,0.07)',borderRadius:'1.25rem',fontWeight:600}}>
            <div>
              <span className="badge bg-gradient-primary me-2" style={{background:'linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)',color:'#fff',fontWeight:700,fontSize:'1.1rem',padding:'0.5em 1.2em',borderRadius:'1.5rem'}}>Points: {user.points}</span>
              <span className="badge bg-gradient-warning me-2" style={{background:'linear-gradient(90deg, #facc15 0%, #f472b6 100%)',color:'#fff',fontWeight:700,fontSize:'1.1rem',padding:'0.5em 1.2em',borderRadius:'1.5rem'}}>Niveau: {user.level}</span>
              {user.badges && user.badges.map(badge => (
                <span key={badge} className="badge bg-gradient-success me-2" style={{background:'linear-gradient(90deg, #34d399 0%, #06b6d4 100%)',color:'#fff',fontWeight:700,fontSize:'1.1rem',padding:'0.5em 1.2em',borderRadius:'1.5rem'}}>{badge}</span>
              ))}
            </div>
          </div>
        )}
        <div className="books-header mb-4" style={{background:'linear-gradient(90deg, #2575fc 0%, #6a11cb 100%)',color:'#fff',borderRadius:'1rem',boxShadow:'0 4px 24px rgba(80,80,200,0.08)',padding:'2rem 1rem 1.5rem 1rem',marginBottom:'2rem',textAlign:'center'}}>
          <h2 className="mb-2 d-flex align-items-center justify-content-center">
            <svg width="32" height="32" fill="currentColor" className="me-2" viewBox="0 0 16 16"><path d="M2 2v12h12V2H2zm11 11H3V3h10v10z"/><path d="M4 4h8v1H4V4zm0 2h8v1H4V6zm0 2h8v1H4V8zm0 2h5v1H4v-1z"/></svg>
            Nos Livres
          </h2>
          <p className="mb-0 fs-5">Découvrez notre collection variée et trouvez votre prochain coup de cœur.</p>
        </div>
        <form className="row g-3 mb-4 p-4 shadow-sm bg-white rounded-4" style={{boxShadow:'0 2px 16px rgba(99,102,241,0.07)',borderRadius:'1.25rem'}} onSubmit={handleSearch}>
          <div className="col-md-4">
            <input type="text" className="form-control form-control-lg" placeholder="Rechercher un livre..." value={search} onChange={e => setSearch(e.target.value)} style={{borderRadius:'1.5rem',boxShadow:'0 1px 6px rgba(99,102,241,0.06)'}} />
          </div>
          <div className="col-md-3">
            <select className="form-select form-select-lg" value={author} onChange={e => setAuthor(e.target.value)} style={{borderRadius:'1.5rem',boxShadow:'0 1px 6px rgba(99,102,241,0.06)'}}>
              <option value="">Tous les auteurs</option>
              {authors.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select form-select-lg" value={genre} onChange={e => setGenre(e.target.value)} style={{borderRadius:'1.5rem',boxShadow:'0 1px 6px rgba(99,102,241,0.06)'}}>
              <option value="">Tous les genres</option>
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="col-md-2 d-grid">
            <button type="submit" className="btn btn-primary btn-lg" style={{borderRadius:'1.5rem',fontWeight:700,letterSpacing:'1px'}}>Rechercher</button>
          </div>
        </form>
        {loading ? (
          <div className="text-center py-5">Chargement...</div>
        ) : error ? (
          <div className="alert alert-danger text-center">{error}</div>
        ) : (
          <div className="row g-4">
            {books.map(book => (
              <div key={book._id} className="col-md-4">
                <div className="card h-100 shadow-lg animate__animated animate__fadeInUp" style={{borderRadius:'1.5rem',boxShadow:'0 6px 32px rgba(99,102,241,0.10)',background:'#fff',transition:'transform 0.2s'}}>
                  <div className="card-body text-center">
                    <div className="mb-3">
                      <img src={book.image || '/images/books/default-cover.png'} alt={book.title} style={{width:'90px',height:'120px',objectFit:'cover',borderRadius:'1rem',boxShadow:'0 2px 12px rgba(99,102,241,0.10)'}} />
                    </div>
                    <h5 className="card-title fw-bold mb-1" style={{color:'#6366f1'}}>{book.title}</h5>
                    <div className="mb-2 text-muted">{book.author}</div>
                    <div className="mb-2"><span className="badge bg-gradient-info" style={{background:'linear-gradient(90deg, #06b6d4 0%, #6366f1 100%)',color:'#fff',fontWeight:600}}>{book.genre}</span></div>
                    <div className="mb-3 fw-bold" style={{fontSize:'1.15rem',color:'#f59e42'}}>{book.price} €</div>
                    <a href={`/book/${book._id}`} className="btn btn-warning w-100 fw-bold" style={{borderRadius:'1.5rem',fontWeight:700,letterSpacing:'1px'}}>Voir le livre</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
      <style>{`
        body { background: linear-gradient(120deg, #f8fafc 0%, #e0e7ff 100%); min-height: 100vh; }
        .books-header { background: linear-gradient(90deg, #2575fc 0%, #6a11cb 100%); color: #fff; border-radius: 1rem; box-shadow: 0 4px 24px rgba(80,80,200,0.08); padding: 2rem 1rem 1.5rem 1rem; margin-bottom: 2rem; text-align: center; }
        .card { border: none; border-radius: 1rem; box-shadow: 0 2px 16px rgba(80,80,200,0.10); transition: transform 0.15s, box-shadow 0.15s; background: linear-gradient(135deg, #fff 70%, #e0e7ff 100%); }
        .card:hover { transform: translateY(-4px) scale(1.03); box-shadow: 0 8px 32px rgba(80,80,200,0.18); }
        .card-title { color: #2575fc; font-weight: 700; letter-spacing: 0.5px; }
        .btn-primary { background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%); border: none; font-weight: 600; letter-spacing: 0.5px; transition: background 0.2s; }
        .btn-primary:hover { background: linear-gradient(90deg, #2575fc 0%, #6a11cb 100%); }
        .search-bar { box-shadow: 0 2px 12px rgba(80,80,200,0.08); border-radius: 2rem; overflow: hidden; background: #fff; }
        @media (max-width: 767px) { .books-header { padding: 1.2rem 0.5rem 1rem 0.5rem; } .card { margin-bottom: 1.5rem; } }
      `}</style>
    </>
  );
};

export default Books;
