import React from 'react';
import './Navbar.css';
import { logout, getAuthToken } from '../pages/Login';

const Navbar = () => {
  const isLoggedIn = !!getAuthToken();
  return (
    <nav className="navbar navbar-expand-lg shadow">
      <div className="container-fluid">
        {isLoggedIn ? (
          <>
            <button className="btn btn-outline-danger btn-sm ms-auto" onClick={logout} style={{borderRadius:'1.25rem',fontWeight:600}}>
              <i className="bi bi-box-arrow-right me-1"></i>Déconnexion
            </button>
          </>
        ) : null}
        {/* Add your brand/logo and navigation links here */}
        <a className="navbar-brand fw-bold ms-2" href="/">Librairie</a>
        <div className="d-flex align-items-center ms-auto gap-2">
          {/* ...other nav links... */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
