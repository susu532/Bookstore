import React from 'react';
import './Footer.css';

const Footer = () => (
  <footer className="footer-gradient py-5 mt-5 shadow-lg">
    <div className="container text-center">
      <h5 className="fw-bold mb-2 d-flex align-items-center justify-content-center">
        <svg width="28" height="28" fill="currentColor" className="me-2" viewBox="0 0 16 16"><path d="M2 2v12h12V2H2zm11 11H3V3h10v10z"/><path d="M4 4h8v1H4V4zm0 2h8v1H4V6zm0 2h8v1H4V8zm0 2h5v1H4v-1z"/></svg>
        Books garden™
      </h5>
      <p className="mb-3 fs-6">Votre destination pour les meilleurs livres.</p>
      <div className="d-flex justify-content-center gap-4 mb-3 flex-wrap">
        <a href="/about" className="footer-link">À propos</a>
        <a href="/contact" className="footer-link">Contact</a>
        <a href="/privacy" className="footer-link">Politique de confidentialité</a>
      </div>
      <div className="footer-divider"></div>
      <p className="mb-0 fs-6">&copy; 2025 Books garden™. Tous droits réservés.</p>
    </div>
  </footer>
);

export default Footer;
