import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Helper to get token
export function getAuthToken() {
  // Session/cookie auth: always return true if a session cookie exists
  return document.cookie.includes('connect.sid');
}

// Helper to add Authorization header
export function authFetch(url, options = {}) {
  // For session/cookie, just add credentials: 'include'
  return fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.headers || {})
    }
  });
}

// Logout utility
export function logout() {
  // For session/cookie, just call /logout and redirect
  fetch('/logout', { method: 'GET', credentials: 'include' })
    .then(() => window.location.href = '/login');
}

const Login = () => {
  const [email, setEmail] = useState('AdminAdmin@gmail.com');
  const [password, setPassword] = useState('Admin1');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({ email, password })
      });
      if (res.redirected) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = res.url;
        }, 1000);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || 'Erreur de connexion.');
        setLoading(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        window.location.href = data.redirectUrl || '/';
      }, 1000);
    } catch (err) {
      setError('Erreur serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container d-flex flex-column justify-content-center align-items-center" style={{flex:1}}>
        <div className="login-card shadow-lg animate__animated animate__fadeIn" style={{background:'#fff',borderRadius:'2rem',boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.2)',padding:'3rem 2.2rem',maxWidth:420,margin:'3rem auto',transition:'box-shadow 0.3s'}}>
          <div className="text-center mb-4">
            <img src="/images/logo.png" alt="Librairie Logo" className="brand-logo" style={{width:70,height:70,objectFit:'contain',marginBottom:'1rem',borderRadius:'50%',boxShadow:'0 2px 12px rgba(106,17,203,0.15)'}} />
            <h2 className="fw-bold" style={{color:'#6a11cb',fontSize:'2.2rem'}}>Bienvenue !</h2>
            <p className="text-muted mb-0">Connectez-vous à votre compte</p>
          </div>
          <form id="loginForm" autoComplete="on" onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label" style={{color:'#2575fc',fontWeight:600}}>Email</label>
              <input type="email" className="form-control form-control-lg" id="email" placeholder="Entrez votre email" value={email} onChange={e => setEmail(e.target.value)} required style={{borderRadius:'1.25rem',boxShadow:'0 2px 8px rgba(99,102,241,0.07)'}} />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label" style={{color:'#2575fc',fontWeight:600}}>Mot de passe</label>
              <input type="password" className="form-control form-control-lg" id="password" placeholder="Entrez votre mot de passe" value={password} onChange={e => setPassword(e.target.value)} required style={{borderRadius:'1.25rem',boxShadow:'0 2px 8px rgba(99,102,241,0.07)'}} />
            </div>
            {error && <div className="alert alert-danger py-2 animate__animated animate__shakeX">{error}</div>}
            {success && <div className="alert alert-success py-2 animate__animated animate__fadeIn">Connexion réussie ! Redirection...</div>}
            <div className="d-grid mb-2">
              <button type="submit" className="btn btn-primary btn-lg" style={{background:'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',border:'none',borderRadius:'1.5rem',fontWeight:700,letterSpacing:'1px',boxShadow:'0 2px 12px rgba(37,117,252,0.10)'}} disabled={loading}>{loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Connexion...</> : 'Se connecter'}</button>
            </div>
          </form>
          <div className="text-center mt-3">
            <span className="text-muted">Pas de compte ?</span>
            <a href="/register" className="register-link" style={{color:'#6a11cb',fontWeight:600,textDecoration:'none',marginLeft:'0.5em'}}>Inscrivez-vous</a>
          </div>
        </div>
      </div>
      <div className="container">
        <Footer />
      </div>
      <style>{`
        body { min-height: 100vh; background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); display: flex; flex-direction: column; }
        .login-card { background: #fff; border-radius: 2rem; box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2); padding: 3rem 2.2rem; max-width: 420px; margin: 3rem auto; transition: box-shadow 0.3s; position: relative; overflow: hidden; }
        .login-card::before { content: ''; position: absolute; top: -40px; right: -40px; width: 120px; height: 120px; background: radial-gradient(circle, #6a11cb33 60%, transparent 100%); z-index: 0; }
        .login-card::after { content: ''; position: absolute; bottom: -40px; left: -40px; width: 120px; height: 120px; background: radial-gradient(circle, #2575fc33 60%, transparent 100%); z-index: 0; }
        .login-card:hover { box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.3); }
        .form-control:focus { border-color: #2575fc; box-shadow: 0 0 0 0.2rem rgba(37,117,252,.25); }
        .btn-primary { background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%); border: none; transition: background 0.3s; }
        .btn-primary:hover { background: linear-gradient(90deg, #2575fc 0%, #6a11cb 100%); }
        .brand-logo { width: 70px; height: 70px; object-fit: contain; margin-bottom: 1rem; border-radius: 50%; box-shadow: 0 2px 12px rgba(106,17,203,0.15); }
        .form-label { color: #2575fc; font-weight: 600; }
        .register-link { color: #6a11cb; font-weight: 600; text-decoration: none; }
        .register-link:hover { text-decoration: underline; color: #2575fc; }
        .alert { border-radius: 1rem; font-size: 1.05rem; }
        .spinner-border { vertical-align: middle; }
        @media (max-width: 576px) { .login-card { padding: 2rem 1rem; margin: 2rem 0.5rem; } }
      `}</style>
    </>
  );
};

export default Login;
