import 'animate.css';
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Emprunts = () => {
  const [emprunts, setEmprunts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/emprunts')
      .then(res => res.json())
      .then(data => {
        // If admin: data.emprunts, else: data.emprunts or data
        setEmprunts(data.emprunts || data);
        setLoading(false);
      })
      .catch(() => {
        setError('Erreur lors du chargement des emprunts.');
        setLoading(false);
      });
  }, []);

  const retournerLivre = async (empruntId) => {
    try {
      const response = await fetch(`/api/emprunts/return/${empruntId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        // Update emprunt in state with returned date from backend
        const data = await response.json();
        setEmprunts(emprunts => emprunts.map(e => e._id === empruntId ? { ...e, dateRetour: data.emprunt.dateRetour } : e));
      } else {
        const errData = await response.json();
        alert(errData.message || 'Erreur lors du retour du livre.');
      }
    } catch {
      alert('Erreur lors du retour du livre.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card shadow-lg p-4 mb-5 rounded-4 border-0 animate__animated animate__fadeInUp" style={{ background: 'rgba(255,255,255,0.96)' }}>
              <div className="d-flex align-items-center mb-4">
                <i className="bi bi-journal-bookmark-fill fs-2 text-primary me-3 animate__animated animate__bounceIn"></i>
                <h1 className="mb-0 fw-bold text-gradient" style={{fontSize:'2.2rem',background:'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Mes Emprunts</h1>
              </div>
              {loading ? (
                <div className="text-center py-5">Chargement...</div>
              ) : error ? (
                <div className="alert alert-danger">{error}</div>
              ) : emprunts.length === 0 ? (
                <div className="alert alert-warning text-center" style={{borderRadius:'1rem',background:'#fef3c7',color:'#b45309',fontWeight:600,boxShadow:'0 2px 12px rgba(255, 186, 8, 0.10)'}}>
                  <i className="bi bi-emoji-frown fs-1"></i>
                  <p className="mt-3 mb-0">Aucun emprunt trouvé.<br/>Empruntez un livre pour commencer !</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle rounded-4 overflow-hidden" style={{borderRadius:'1rem',background:'#fff',boxShadow:'0 2px 12px rgba(99,102,241,0.07)'}}>
                    <thead className="table-light">
                      <tr>
                        <th>Livre</th>
                        <th>Date d'emprunt</th>
                        <th>Date de retour</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emprunts.map(emprunt => (
                        <tr key={emprunt._id} className="animate__animated animate__fadeInUp">
                          <td>{emprunt.book ? emprunt.book.title : emprunt.bookTitle}</td>
                          <td>{new Date(emprunt.dateEmprunt).toLocaleDateString()}</td>
                          <td>{emprunt.dateRetour ? new Date(emprunt.dateRetour).toLocaleDateString() : <span className="badge bg-warning">En cours</span>}</td>
                          <td>
                            {!emprunt.dateRetour && (
                              <button className="btn btn-success btn-sm" style={{borderRadius:'1.25rem',fontWeight:700}} onClick={()=>retournerLivre(emprunt._id)}>Retourner</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
      {/* Custom gradient animation for title */}
      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .text-gradient {
          background-size: 200% 200%;
          animation: gradientMove 3s infinite alternate;
        }
      `}</style>
    </>
  );
};

export default Emprunts;
