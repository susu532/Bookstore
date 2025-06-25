import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { authFetch } from './Login';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef();

  // Fetch user info
  useEffect(() => {
    setLoading(true);
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
        setName(data.name || '');
        setEmail(data.email || '');
        setAvatar(data.avatar || '');
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setAvatar(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      if (password) formData.append('password', password);
      if (avatarFile) formData.append('avatar', avatarFile);
      const res = await authFetch('/api/users/me', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Erreur lors de la mise à jour du profil');
      setSuccess(true);
      // Refresh user info
      const updated = await res.json();
      setUser(updated);
      setAvatar(updated.avatar || avatar);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) return <div className="container py-5"><Navbar /><div className="alert alert-info">Chargement du profil...</div><Footer /></div>;

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow-lg p-5 mb-5 rounded-4 border-0 animate__animated animate__fadeIn" style={{ background: 'rgba(255,255,255,0.97)' }}>
              <div className="text-center mb-4">
                <img src={avatar || '/images/logo.png'} alt="Avatar" className="rounded-circle shadow" style={{width:'90px',height:'90px',objectFit:'cover',marginBottom:'1rem',border:'4px solid #6366f1'}} />
                <h2 className="fw-bold mb-1" style={{color:'#6366f1'}}>{name}</h2>
                <div className="text-muted mb-2">{email}</div>
              </div>
              <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="name" className="form-label fw-bold" style={{color:'#2575fc'}}>Nom</label>
                  <input type="text" className="form-control form-control-lg" id="name" value={name} onChange={e => setName(e.target.value)} style={{borderRadius:'1.25rem'}} />
                </div>
                <div className="col-md-6">
                  <label htmlFor="email" className="form-label fw-bold" style={{color:'#2575fc'}}>Email</label>
                  <input type="email" className="form-control form-control-lg" id="email" value={email} onChange={e => setEmail(e.target.value)} style={{borderRadius:'1.25rem'}} />
                </div>
                <div className="col-md-6">
                  <label htmlFor="password" className="form-label fw-bold" style={{color:'#2575fc'}}>Mot de passe</label>
                  <input type="password" className="form-control form-control-lg" id="password" value={password} onChange={e => setPassword(e.target.value)} style={{borderRadius:'1.25rem'}} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold" style={{color:'#2575fc'}}>Avatar</label>
                  <input type="file" className="form-control" accept="image/*" onChange={handleAvatarChange} ref={fileInputRef} style={{borderRadius:'1.25rem'}} />
                </div>
                <div className="col-12 d-grid mt-3">
                  <button type="submit" className="btn btn-primary btn-lg" style={{borderRadius:'1.5rem',fontWeight:700,letterSpacing:'1px'}} disabled={loading}>Mettre à jour</button>
                </div>
                {success && <div className="alert alert-success mt-3">Profil mis à jour avec succès !</div>}
                {error && <div className="alert alert-danger mt-3">{error}</div>}
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
