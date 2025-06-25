import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { authFetch } from '../Login';

const AdminEmprunts = () => {
  const [stats, setStats] = useState(null);
  const [overdue, setOverdue] = useState([]);
  const [emprunts, setEmprunts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch stats
    authFetch('/api/emprunts/stats')
      .then(res => res.json())
      .then(setStats);
    // Fetch overdue
    authFetch('/api/emprunts/overdue')
      .then(res => res.json())
      .then(data => setOverdue(data.emprunts || []));
    // Fetch emprunts
    fetchEmprunts();
  }, []);

  const fetchEmprunts = () => {
    setLoading(true);
    authFetch('/api/admin/emprunts')
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          window.location.href = '/login';
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (!data) return;
        setEmprunts(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Erreur lors du chargement des emprunts.');
        setLoading(false);
      });
  };

  const retournerLivre = async (empruntId) => {
    const res = await authFetch(`/api/emprunts/return/${empruntId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.status === 401 || res.status === 403) {
      window.location.href = '/login';
      return;
    }
    const data = await res.json();
    if (res.ok) {
      alert('Livre retourné avec succès');
      fetchEmprunts();
    } else {
      alert(data.message || 'Erreur lors du retour');
    }
  };

  return (
    <>
      <Navbar />
      <div className="container" style={{ minHeight: '100vh', background: '#f6f8fa', fontFamily: "'Segoe UI', 'Roboto', Arial, sans-serif" }}>
        <h1 className="modern-title" style={{ fontSize: '2.2rem', fontWeight: 700, color: '#2a5d9f', marginBottom: '1.5rem', letterSpacing: '0.01em' }}>Gestion des Emprunts</h1>
        {/* Stats */}
        {stats && (
          <div className="modern-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span className="badge-modern badge-info"><b>Total emprunts :</b> {stats.total}</span>
              <span className="badge-modern badge-warning"><b>En cours :</b> {stats.actifs}</span>
              <span className="badge-modern badge-success"><b>Retournés :</b> {stats.returned}</span>
            </div>
            <div>
              <span className="badge-modern badge-info"><b>Top livres :</b> {stats.topBooks && stats.topBooks.map(b => `${b.title} (${b.count})`).join(', ')}</span>
            </div>
          </div>
        )}
        {/* Overdue */}
        {overdue.length > 0 && (
          <div className="overdue-card">
            <b>Emprunts en retard :</b>
            <ul style={{ margin: '0.5em 0 0 1.2em' }}>
              {overdue.map((e, i) => (
                <li key={e._id || i}><b>{e.user && e.user.name ? e.user.name : 'Utilisateur inconnu'}</b> - <i>{e.book && e.book.title ? e.book.title : 'Livre inconnu'}</i> <span style={{ color: '#a94442' }}>(depuis le {e.dateEmprunt ? new Date(e.dateEmprunt).toLocaleDateString() : ''})</span></li>
              ))}
            </ul>
          </div>
        )}
        {/* Table */}
        <div className="modern-card">
          <table className="table modern-table align-middle">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Livre</th>
                <th>Date d'emprunt</th>
                <th>Date de retour</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5"><div className="alert alert-info text-center">Chargement...</div></td></tr>
              ) : error ? (
                <tr><td colSpan="5"><div className="alert alert-danger text-center">{error}</div></td></tr>
              ) : emprunts.length === 0 ? (
                <tr><td colSpan="5"><div className="alert alert-info text-center">Aucun emprunt trouvé.</div></td></tr>
              ) : (
                emprunts.map(e => (
                  <tr key={e._id}>
                    <td>
                      {e.user ? (
                        <span className="badge-modern badge-info"><i className="bi bi-person-circle"></i> {e.user.name}</span>
                      ) : <span className="badge bg-secondary">Utilisateur inconnu</span>}
                      <br />
                      <small style={{ color: '#6c757d' }}>{e.user && e.user.email}</small>
                    </td>
                    <td><span className="badge-modern badge-info"><i className="bi bi-book"></i> {e.book && e.book.title ? e.book.title : 'Livre inconnu'}</span></td>
                    <td><span className="badge-modern badge-info"><i className="bi bi-calendar-event"></i> {e.dateEmprunt ? new Date(e.dateEmprunt).toLocaleDateString() : ''}</span></td>
                    <td>
                      {e.dateRetour ? (
                        <span className="badge-modern badge-success"><i className="bi bi-check-circle"></i> {new Date(e.dateRetour).toLocaleDateString()}</span>
                      ) : (
                        <span className="badge-modern badge-warning"><i className="bi bi-clock-history"></i> Non retourné</span>
                      )}
                    </td>
                    <td>
                      {!e.dateRetour ? (
                        <button className="btn btn-modern btn-sm" onClick={() => retournerLivre(e._id)}><i className="bi bi-arrow-return-left"></i> Retourner</button>
                      ) : (
                        <span className="badge-modern badge-returned"><i className="bi bi-check2-all"></i> Retourné</span>
                      )}
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
        body { background: #f6f8fa; font-family: 'Segoe UI', 'Roboto', Arial, sans-serif; }
        .modern-card { background: #fff; border-radius: 1.2rem; box-shadow: 0 4px 24px 0 rgba(60,72,88,0.08); padding: 2rem 2.5rem; margin-bottom: 2rem; border: none; }
        .modern-table { background: #fff; border-radius: 1rem; box-shadow: 0 2px 12px 0 rgba(60,72,88,0.06); overflow: hidden; }
        .modern-table th, .modern-table td { border: none; padding: 1rem 1.2rem; vertical-align: middle; }
        .modern-table thead { background: linear-gradient(90deg, #4f8cff 0%, #6dd5ed 100%); color: #fff; font-weight: 600; letter-spacing: 0.03em; }
        .modern-table tbody tr { transition: background 0.2s; }
        .modern-table tbody tr:hover { background: #f0f6ff; }
        .badge-modern { font-size: 0.95em; border-radius: 1rem; padding: 0.5em 1.1em; font-weight: 500; display: inline-flex; align-items: center; gap: 0.4em; }
        .badge-success { background: #e6f9f0; color: #1a7f5a; }
        .badge-warning { background: #fff7e6; color: #b26a00; }
        .badge-info { background: #e6f0fa; color: #2a5d9f; }
        .badge-returned { background: linear-gradient(90deg, #b2f7ef 0%, #e0fcff 100%); color: #1a7f5a; }
        .btn-modern { border-radius: 2rem; padding: 0.5em 1.5em; font-weight: 600; background: linear-gradient(90deg, #4f8cff 0%, #6dd5ed 100%); color: #fff; border: none; transition: background 0.2s, box-shadow 0.2s; box-shadow: 0 2px 8px 0 rgba(79,140,255,0.08); }
        .btn-modern:hover { background: linear-gradient(90deg, #357ae8 0%, #48c6ef 100%); color: #fff; box-shadow: 0 4px 16px 0 rgba(79,140,255,0.15); }
        .overdue-card { background: linear-gradient(90deg, #ffdde1 0%, #ee9ca7 100%); color: #a94442; border-radius: 1rem; padding: 1.2rem 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 2px 8px 0 rgba(238,156,167,0.08); }
        .modern-title { font-size: 2.2rem; font-weight: 700; color: #2a5d9f; margin-bottom: 1.5rem; letter-spacing: 0.01em; }
      `}</style>
    </>
  );
};

export default AdminEmprunts;
