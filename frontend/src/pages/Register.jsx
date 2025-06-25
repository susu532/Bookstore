import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!name || !email || !password) {
      setError('Veuillez remplir tous les champs.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError((data.errors && data.errors[0]?.msg) || data.message || 'Erreur lors de l\'inscription.');
        setLoading(false);
        return;
      }
      // Optionally store user info/token here if backend returns it
      window.location.href = data.redirectUrl || '/login';
    } catch (err) {
      setError('Erreur serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container d-flex align-items-center justify-content-center min-vh-100">
        <div className="register-card w-100 shadow-lg animate__animated animate__fadeInDown" style={{background:'#fff',borderRadius:'2rem',boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.2)',padding:'3rem 2.2rem',maxWidth:440,margin:'3rem auto',transition:'box-shadow 0.3s'}}>
          <div className="register-title mb-4" style={{fontSize:'2.2rem',fontWeight:800,color:'#6a11cb',marginBottom:'1.5rem',textAlign:'center',letterSpacing:'1px'}}>
            <i className="bi bi-person-plus-fill me-2" style={{color:'#2575fc'}}></i>
            Inscription
          </div>
          <form id="registerForm" autoComplete="off" onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label" style={{fontWeight:700,color:'#2575fc'}}>Nom</label>
              <input type="text" className="form-control form-control-lg" id="name" placeholder="Votre nom complet" value={name} onChange={e => setName(e.target.value)} required style={{borderRadius:'1.25rem'}} />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label" style={{fontWeight:700,color:'#2575fc'}}>Email</label>
              <input type="email" className="form-control form-control-lg" id="email" placeholder="exemple@email.com" value={email} onChange={e => setEmail(e.target.value)} required style={{borderRadius:'1.25rem'}} />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label" style={{fontWeight:700,color:'#2575fc'}}>Mot de passe</label>
              <input type="password" className="form-control form-control-lg" id="password" placeholder="Créez un mot de passe" value={password} onChange={e => setPassword(e.target.value)} required style={{borderRadius:'1.25rem'}} />
            </div>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <button type="submit" className="btn btn-primary w-100 py-2 mt-2" style={{background:'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',border:'none',fontWeight:700,letterSpacing:'1px',borderRadius:'1.5rem'}} disabled={loading}>{loading ? "Inscription..." : "S'inscrire"}</button>
          </form>
          <p className="mt-4 text-center">
            Déjà un compte ?
            <a href="/login" className="register-link" style={{color:'#2575fc',fontWeight:600,textDecoration:'underline',transition:'color 0.2s',marginLeft:'0.5em'}}>Connectez-vous</a>
          </p>
        </div>
      </div>
      <div className="container">
        <Footer />
      </div>
      <style>{`
        body { background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); min-height: 100vh; font-family: 'Segoe UI', 'Roboto', Arial, sans-serif; }
        .register-card { background: #fff; border-radius: 2rem; box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2); padding: 3rem 2.2rem; max-width: 440px; margin: 3rem auto; transition: box-shadow 0.3s; }
        .register-card:hover { box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.25); }
        .form-label { font-weight: 700; color: #2575fc; }
        .form-control { border-radius: 1.25rem; }
        .form-control:focus { border-color: #6a11cb; box-shadow: 0 0 0 0.2rem rgba(106,17,203,.15); }
        .btn-primary { background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%); border: none; font-weight: 700; letter-spacing: 1px; transition: background 0.2s; border-radius: 1.5rem; }
        .btn-primary:hover { background: linear-gradient(90deg, #2575fc 0%, #6a11cb 100%); }
        .register-title { font-size: 2.2rem; font-weight: 800; color: #6a11cb; margin-bottom: 1.5rem; text-align: center; letter-spacing: 1px; }
        .register-link { color: #2575fc; font-weight: 600; text-decoration: underline; transition: color 0.2s; }
        .register-link:hover { color: #6a11cb; text-decoration: none; }
        @media (max-width: 576px) { .register-card { padding: 1.5rem 0.8rem; max-width: 98vw; } .register-title { font-size: 1.5rem; } }
      `}</style>
    </>
  );
};

export default Register;
