import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <span className="footer-brand">ONEPIECE PORTAL</span>
        <span className="footer-copy">© {new Date().getFullYear()} — Built by the Crew</span>
      </div>
    </footer>
  );
}
