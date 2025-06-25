import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Home = () => (
  <>
    <Navbar />
    <div className="container py-4">
      <section className="hero-section mb-5 animate__animated animate__fadeIn" style={{
        background: 'linear-gradient(120deg, #6366f1 0%, #60a5fa 100%)',
        color: '#fff',
        borderRadius: '2rem',
        boxShadow: '0 8px 40px rgba(99,102,241,0.18)',
        padding: '4rem 2.5rem 3rem 2.5rem',
        marginBottom: '3rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: 'radial-gradient(circle at 80% 20%, #facc15 0%, transparent 60%), linear-gradient(120deg, #6366f1 0%, #60a5fa 100%)'
      }}>
        <h1 style={{fontSize:'3.2rem',fontWeight:800,letterSpacing:'-1.5px',marginBottom:'1.2rem',zIndex:1,position:'relative',textShadow:'0 2px 16px rgba(0,0,0,0.10)'}}>Bienvenue à la Librairie en ligne</h1>
        <p style={{fontSize:'1.35rem',marginBottom:'2rem',zIndex:1,position:'relative',fontWeight:500}}>Découvrez une vaste sélection de livres pour tous les goûts, dans une expérience moderne et intuitive.</p>
        <div className="d-flex flex-wrap justify-content-center gap-3">
          <a href="/books" className="btn btn-lg btn-warning fw-bold shadow-sm px-4 py-2 animate__animated animate__pulse animate__infinite" style={{fontSize:'1.15rem',borderRadius:'2rem',boxShadow:'0 4px 24px rgba(250,204,21,0.13)'}}>
            <i className="bi bi-book-half me-2"></i>Voir les livres
          </a>
          <a href="http://localhost:3000/" className="btn btn-lg btn-primary fw-bold shadow-sm px-4 py-2 animate__animated animate__pulse animate__infinite" style={{fontSize:'1.15rem',borderRadius:'2rem',boxShadow:'0 4px 24px rgba(99,102,241,0.13)'}} target="_blank" rel="noopener noreferrer">
            <i className="bi bi-box-arrow-up-right me-2"></i>Home Page
          </a>
        </div>
        <div style={{position:'absolute',top:0,right:0,width:'180px',height:'180px',background:'radial-gradient(circle at 60% 40%, #f472b6 0%, transparent 70%)',zIndex:0,opacity:0.7}}></div>
        <div style={{position:'absolute',bottom:0,left:0,width:'160px',height:'160px',background:'radial-gradient(circle at 40% 60%, #facc15 0%, transparent 70%)',zIndex:0,opacity:0.7}}></div>
      </section>
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="card feature-card h-100 text-center p-4 animate__animated animate__fadeInUp" style={{border:'none',borderRadius:'1.5rem',boxShadow:'0 4px 24px rgba(96,165,250,0.13)',background:'#fff',transition:'transform 0.2s'}}>
            <div className="feature-icon mb-2" style={{fontSize:'2.7rem',color:'#6366f1'}}><i className="bi bi-search"></i></div>
            <h5 className="card-title fw-bold">Recherche Facile</h5>
            <p className="card-text">Trouvez rapidement vos livres préférés grâce à notre moteur de recherche performant.</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card feature-card h-100 text-center p-4 animate__animated animate__fadeInUp animate__delay-1s" style={{border:'none',borderRadius:'1.5rem',boxShadow:'0 4px 24px rgba(96,165,250,0.13)',background:'#fff',transition:'transform 0.2s'}}>
            <div className="feature-icon mb-2" style={{fontSize:'2.7rem',color:'#6366f1'}}><i className="bi bi-bag-check"></i></div>
            <h5 className="card-title fw-bold">Achat Sécurisé</h5>
            <p className="card-text">Profitez d'une expérience d'achat fluide et sécurisée, adaptée à tous les appareils.</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card feature-card h-100 text-center p-4 animate__animated animate__fadeInUp animate__delay-2s" style={{border:'none',borderRadius:'1.5rem',boxShadow:'0 4px 24px rgba(96,165,250,0.13)',background:'#fff',transition:'transform 0.2s'}}>
            <div className="feature-icon mb-2" style={{fontSize:'2.7rem',color:'#6366f1'}}><i className="bi bi-people"></i></div>
            <h5 className="card-title fw-bold">Communauté Active</h5>
            <p className="card-text">Rejoignez une communauté de lecteurs passionnés et partagez vos avis sur les livres.</p>
          </div>
        </div>
      </div>
      <div className="admin-info animate__animated animate__fadeIn" style={{background:'linear-gradient(90deg, #f472b6 0%, #facc15 100%)',color:'#fff',borderRadius:'1.25rem',padding:'1.2rem 2rem',marginBottom:'2rem',fontSize:'1.08rem',fontWeight:600,boxShadow:'0 2px 12px rgba(250,204,21,0.10)'}}>
        <i className="bi bi-info-circle-fill me-2"></i>
        {"Pour accéder au tableau de bord admin, utilisez : "}
        <strong>Email:</strong> AdminAdmin@gmail.com, <strong>Mot de passe:</strong> Admin1
      </div>
    </div>
    <Footer />
  </>
);

export default Home;
