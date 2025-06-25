import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { authFetch } from './Login';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    authFetch('/api/users/me')
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          window.location.href = '/login';
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (!data) return;
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Erreur lors du chargement du profil utilisateur.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="container py-5"><Navbar /><div className="alert alert-info">Chargement...</div><Footer /></div>;
  if (error) return <div className="container py-5"><Navbar /><div className="alert alert-danger">{error}</div><Footer /></div>;
  if (!user) return <div className="container py-5"><Navbar /><div className="alert alert-warning">Utilisateur non connecté.</div><Footer /></div>;

  const isAdmin = user.role === 1;

  return (
    <>
      <Navbar />
      <div className={isAdmin ? 'main-content' : 'container py-5'} style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)' }}>
        <div className="dashboard-hero mb-5 animate__animated animate__fadeInDown" style={{ background: 'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)', color: '#fff', borderRadius: '2rem', boxShadow: '0 8px 40px rgba(99,102,241,0.18)', padding: '3rem 2.5rem 2.5rem 2.5rem', marginBottom: '3rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <h2 style={{ fontWeight: 800, fontSize: '2.7rem', marginBottom: '0.7rem', zIndex: 1, position: 'relative', textShadow: '0 2px 16px rgba(0,0,0,0.10)' }}>Bienvenue, {user.name} !</h2>
          <p style={{ fontSize: '1.25rem', zIndex: 1, position: 'relative', fontWeight: 500 }}>Ceci est votre tableau de bord utilisateur. Gérez vos livres, commandes et panier facilement.</p>
        </div>
        <div className="dashboard-cards" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
          {isAdmin && (
            <>
              <div className="dashboard-card shadow-lg animate__animated animate__fadeInUp" style={{borderRadius:'1.5rem',background:'#fff',padding:'2rem',minWidth:'260px',boxShadow:'0 6px 32px rgba(99,102,241,0.10)'}}>
                <div className="icon bg-gradient mb-3" style={{fontSize:'2.2rem',color:'#6366f1'}}><i className="bi bi-journal-text"></i></div>
                <h5 className="mt-3 mb-2 fw-bold">Gestion des livres</h5>
                <p>Ajoutez, modifiez ou supprimez des livres dans la bibliothèque.</p>
                <a href="/books/manage" className="btn btn-warning w-100 fw-bold" style={{borderRadius:'1.5rem'}}>Gérer les livres</a>
              </div>
              <div className="dashboard-card shadow-lg animate__animated animate__fadeInUp animate__delay-1s" style={{borderRadius:'1.5rem',background:'#fff',padding:'2rem',minWidth:'260px',boxShadow:'0 6px 32px rgba(99,102,241,0.10)'}}>
                <div className="icon bg-gradient mb-3" style={{fontSize:'2.2rem',color:'#6366f1'}}><i className="bi bi-people"></i></div>
                <h5 className="mt-3 mb-2 fw-bold">Gestion des utilisateurs</h5>
                <p>Consultez et gérez les utilisateurs de la bibliothèque.</p>
                <a href="/admin/users" className="btn btn-secondary w-100 fw-bold" style={{borderRadius:'1.5rem'}}>Gérer les utilisateurs</a>
              </div>
              <div className="dashboard-card shadow-lg animate__animated animate__fadeInUp animate__delay-2s" style={{borderRadius:'1.5rem',background:'#fff',padding:'2rem',minWidth:'260px',boxShadow:'0 6px 32px rgba(99,102,241,0.10)'}}>
                <div className="icon bg-gradient mb-3" style={{fontSize:'2.2rem',color:'#6366f1'}}><i className="bi bi-bag-check"></i></div>
                <h5 className="mt-3 mb-2 fw-bold">Historique des commandes</h5>
                <p>Gérez toutes les commandes passées par les utilisateurs.</p>
                <a href="/admin/orders" className="btn btn-success w-100 fw-bold" style={{borderRadius:'1.5rem'}}>Gérer les commandes</a>
              </div>
              <div className="dashboard-card shadow-lg animate__animated animate__fadeInUp animate__delay-3s" style={{borderRadius:'1.5rem',background:'#fff',padding:'2rem',minWidth:'260px',boxShadow:'0 6px 32px rgba(99,102,241,0.10)'}}>
                <div className="icon bg-gradient mb-3" style={{fontSize:'2.2rem',color:'#6366f1'}}><i className="bi bi-clock-history"></i></div>
                <h5 className="mt-3 mb-2 fw-bold">Gestion des emprunts</h5>
                <p>Suivez et gérez les emprunts de livres.</p>
                <a href="/admin/emprunts" className="btn btn-info w-100 text-white fw-bold" style={{borderRadius:'1.5rem'}}>Gérer les emprunts</a>
              </div>
              <div className="dashboard-card shadow-lg animate__animated animate__fadeInUp animate__delay-4s" style={{borderRadius:'1.5rem',background:'#fff',padding:'2rem',minWidth:'260px',boxShadow:'0 6px 32px rgba(99,102,241,0.10)'}}>
                <div className="icon bg-gradient mb-3" style={{fontSize:'2.2rem',color:'#6366f1'}}><i className="bi bi-box-seam"></i></div>
                <h5 className="mt-3 mb-2 fw-bold">Stock</h5>
                <p>Gérez le stock de livres disponibles.</p>
                <a href="/admin/stock" className="btn btn-primary w-100 fw-bold" style={{borderRadius:'1.5rem'}}>Voir le stock</a>
              </div>
            </>
          )}
          <div className="dashboard-card shadow-sm">
            <div className="icon bg-gradient"><i className="bi bi-book-half"></i></div>
            {!isAdmin ? (
              <>
                <h5 className="mt-3 mb-2">Voir mon panier</h5>
                <p>Consultez et gérez les livres que vous souhaitez emprunter ou acheter.</p>
                <a href="/cart" className="btn btn-info w-100 text-white">Mon panier</a>
              </>
            ) : (
              <>
                <h5 className="mt-3 mb-2">Voir mon panier</h5>
                <p>Consultez et gérez les livres que vous souhaitez emprunter ou acheter.</p>
                <a href="/cart" className="btn btn-info w-100 text-white">Mon panier</a>
              </>
            )}
          </div>
          <div className="dashboard-card shadow-sm">
            <div className="icon bg-gradient"><i className="bi bi-clock-history"></i></div>
            <h5 className="mt-3 mb-2">Historique des commandes</h5>
            <p>Retrouvez toutes vos commandes et suivez leur statut en temps réel.</p>
            <a href="/orders" className="btn btn-success w-100">Historique</a>
          </div>
          <div className="dashboard-card shadow-sm dashboard-card-gamification">
            <div className="icon bg-gradient"><i className="bi bi-trophy"></i></div>
            <h5 className="mt-3 mb-2">🎮 Gamification</h5>
            <div className="d-flex flex-wrap align-items-center gap-3 justify-content-center mb-2" style={{ rowGap: '1rem' }}>
              <span className="badge bg-success d-flex align-items-center" style={{ fontSize: '1.3rem', minWidth: 120, justifyContent: 'center' }}>
                <i className="bi bi-star-fill me-1"></i> Points : <span id="userPoints" className="ms-1">{user.points}</span>
              </span>
              <span className="badge bg-warning text-dark d-flex align-items-center" style={{ fontSize: '1.3rem', minWidth: 120, justifyContent: 'center' }}>
                <i className="bi bi-bar-chart-steps me-1"></i> Niveau : <span id="userLevel" className="ms-1">{user.level}</span>
              </span>
              <span className="badge bg-info text-dark d-flex align-items-center" style={{ fontSize: '1.3rem', minWidth: 120, justifyContent: 'center' }}>
                <i className="bi bi-award me-1"></i> Badges : <span id="userBadges" className="ms-1">{Array.isArray(user.badges) ? user.badges.join(', ') : user.badges}</span>
              </span>
            </div>
            <div className="progress mt-2 mb-1" style={{ height: 12, maxWidth: 400, margin: 'auto' }}>
              <div className="progress-bar bg-primary" id="levelProgress" role="progressbar" style={{ width: `${Math.min(100, Math.round((user.points / 100) * 100))}%` }}></div>
            </div>
            <small className="text-muted d-block mt-2" style={{ fontSize: '1.1rem' }}>Gagnez des points en commentant, empruntant ou notant des livres !</small>
          </div>
        </div>
      </div>
      <Footer />
      {/* Inline styles for the page, as in the EJS */}
      <style>{`
        body { background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%); min-height: 100vh; }
        .sidebar { min-height: 100vh; background: linear-gradient(180deg, #6366f1 0%, #06b6d4 100%); color: #fff; padding: 2rem 1rem 2rem 1rem; position: fixed; top: 0; left: 0; width: 240px; z-index: 100; box-shadow: 2px 0 16px rgba(99,102,241,0.10); display: flex; flex-direction: column; gap: 2rem; }
        .sidebar .sidebar-logo { font-size: 1.5rem; font-weight: 700; margin-bottom: 2rem; text-align: center; letter-spacing: 0.05em; }
        .sidebar .nav-link { color: #fff; font-size: 1.1rem; margin-bottom: 1rem; border-radius: 0.75rem; padding: 0.7rem 1rem; transition: background 0.15s; display: flex; align-items: center; gap: 0.7rem; }
        .sidebar .nav-link.active, .sidebar .nav-link:hover { background: rgba(255,255,255,0.12); color: #fff; text-decoration: none; }
        .main-content { margin-left: 260px; padding: 2.5rem 2rem 2rem 2rem; }
        @media (max-width: 991px) { .sidebar { position: static; width: 100%; min-height: auto; flex-direction: row; gap: 1rem; padding: 1rem; } .main-content { margin-left: 0; padding: 1.5rem 0.5rem; } }
        .dashboard-hero { background: linear-gradient(90deg, #6366f1 0%, #06b6d4 100%); color: #fff; border-radius: 1.5rem; box-shadow: 0 4px 24px rgba(99,102,241,0.15); padding: 2.5rem 2rem 2rem 2rem; margin-bottom: 2.5rem; text-align: center; position: relative; overflow: hidden; }
        .dashboard-hero::after { content: ''; position: absolute; right: -60px; bottom: -60px; width: 180px; height: 180px; background: rgba(255,255,255,0.08); border-radius: 50%; z-index: 0; }
        .dashboard-hero h2 { font-weight: 700; font-size: 2.5rem; marginBottom: 0.5rem; zIndex: 1, position: 'relative' }
        .dashboard-hero p { fontSize: '1.2rem', zIndex: 1, position: 'relative' }
        .dashboard-cards { display: flex; flex-wrap: wrap; gap: 2rem; justify-content: center; }
        .dashboard-card { flex: 1 1 260px; max-width: 340px; min-width: 240px; background: #fff; border-radius: 1.25rem; box-shadow: 0 2px 16px rgba(0,0,0,0.07); padding: 2rem 1.5rem; text-align: center; transition: transform 0.15s, box-shadow 0.15s; position: relative; overflow: hidden; border: none; }
        .dashboard-card:hover { transform: translateY(-6px) scale(1.03); box-shadow: 0 8px 32px rgba(99,102,241,0.18); }
        .dashboard-card .icon { font-size: 2.5rem; margin-bottom: 1rem; color: #6366f1; background: linear-gradient(135deg, #a5b4fc 0%, #67e8f9 100%); border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; margin-left: auto; margin-right: auto; box-shadow: 0 2px 8px rgba(99,102,241,0.10); }
        .dashboard-card .btn { margin-top: 1.2rem; font-weight: 600; letter-spacing: 0.03em; border-radius: 2rem; padding: 0.6rem 1.5rem; font-size: 1.1rem; }
        .dashboard-card-gamification { max-width: 700px; min-width: 380px; width: 100%; padding: 3.5rem 3rem 3rem 3rem; font-size: 0.8rem; box-shadow: 0 6px 40px rgba(99,102,241,0.22); border: 3px solid #6366f1; }
        .dashboard-card-gamification .badge { font-size: 0.75rem !important; padding: 0.3em 0.7em; }
        .dashboard-card-gamification .progress { height: 12px !important; max-width: 300px !important; }
        .dashboard-card-gamification small { font-size: 0.7rem !important; }
        @media (max-width: 991px) { .dashboard-cards { flex-direction: column; gap: 1.5rem; } .dashboard-card-gamification { max-width: 100%; min-width: 0; padding: 2rem 1rem; } }
      `}</style>
    </>
  );
};

export default Dashboard;
