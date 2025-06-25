import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { authFetch } from '../Login';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadAllUsers();
  }, []);

  const loadAllUsers = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/admin/users');
      if (res.status === 401 || res.status === 403) {
        window.location.href = '/login';
        return;
      }
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch {
      setError('Erreur lors du chargement des utilisateurs.');
      setLoading(false);
    }
  };

  const deleteUser = async userId => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    try {
      const res = await authFetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (res.status === 401 || res.status === 403) {
        window.location.href = '/login';
        return;
      }
      const data = await res.json();
      if (res.ok) {
        loadAllUsers();
      } else {
        alert(data.message || 'Erreur lors de la suppression');
      }
    } catch {
      alert('Erreur réseau');
    }
  };

  // Filter users by search
  const filteredUsers = users.filter(user => {
    const text = `${user.name} ${user.email}`.toLowerCase();
    return user.role !== 1 && text.includes(search.toLowerCase());
  });

  return (
    <>
      <Navbar />
      <div className="container py-5" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)' }}>
        <div className="row justify-content-center mb-4">
          <div className="col-lg-8">
            <div className="d-flex flex-column flex-md-row align-items-center justify-content-between mb-3">
              <h2 className="fw-bold text-primary mb-3 mb-md-0">
                <i className="bi bi-people-fill me-2"></i>Gestion des Utilisateurs
              </h2>
              <form className="d-flex search-bar" role="search" onSubmit={e => e.preventDefault()}>
                <input className="form-control me-2" type="search" placeholder="Rechercher..." aria-label="Search" value={search} onChange={e => setSearch(e.target.value)} />
                <button className="btn btn-outline-primary" type="button" tabIndex={-1}>
                  <i className="bi bi-search"></i>
                </button>
              </form>
            </div>
            <div className="card p-4">
              <div className="table-responsive">
                <table className="table table-striped align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Rôle</th>
                      <th>Actif</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="5" className="text-center">Chargement...</td></tr>
                    ) : error ? (
                      <tr><td colSpan="5" className="text-center text-danger">{error}</td></tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr><td colSpan="5" className="text-center alert alert-info">Aucun utilisateur trouvé.</td></tr>
                    ) : (
                      filteredUsers.map(user => (
                        <tr key={user._id}>
                          <td className="fw-semibold d-flex align-items-center">
                            {user.avatar ? (
                              <img src={user.avatar} alt="Avatar" className="admin-user-avatar me-2" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              <i className="bi bi-person-circle admin-user-avatar me-2" style={{ fontSize: '2rem' }}></i>
                            )}
                            {user.name}
                          </td>
                          <td>{user.email}</td>
                          <td><span className="badge badge-user">Utilisateur</span></td>
                          <td><span className={`badge ${user.isActive ? 'bg-success' : 'bg-danger'}`}>{user.isActive ? 'Oui' : 'Non'}</span></td>
                          <td><button className="btn btn-sm btn-danger shadow" onClick={() => deleteUser(user._id)}>Supprimer</button></td>
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
      <Footer />
      {/* Inline styles for the page, as in the EJS */}
      <style>{`
        body { background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%); min-height: 100vh; }
        .card { border-radius: 1.25rem; box-shadow: 0 4px 24px rgba(80, 80, 180, 0.08); border: none; }
        .table thead { background: linear-gradient(90deg, #6366f1 0%, #06b6d4 100%); color: #fff; }
        .table-striped > tbody > tr:nth-of-type(odd) { background-color: #f1f5f9; }
        .btn-primary { background: linear-gradient(90deg, #6366f1 0%, #06b6d4 100%); border: none; }
        .btn-primary:hover { background: linear-gradient(90deg, #06b6d4 0%, #6366f1 100%); }
        .badge-admin { background: #6366f1; }
        .badge-user { background: #06b6d4; }
        .search-bar { max-width: 350px; }
        @media (max-width: 768px) { .table-responsive { font-size: 0.95rem; } .card { padding: 0.5rem; } }
      `}</style>
    </>
  );
};

export default AdminUsers;
