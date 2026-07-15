import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '5vw',
      background: '#FAFAFA',
      textAlign: 'center'
    }}>
      <div style={{
        fontFamily: 'var(--mono)',
        fontSize: '14px',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: '#666',
        marginBottom: '1.5rem'
      }}>
        404 — PAGE NOT FOUND
      </div>
      <h1 style={{
        fontSize: '64px',
        fontWeight: 700,
        color: '#111',
        margin: '0 0 1rem 0',
        letterSpacing: '-0.03em',
        lineHeight: 1
      }}>
        Lost at Sea
      </h1>
      <p style={{
        fontSize: '18px',
        color: '#666',
        marginBottom: '2rem',
        maxWidth: '400px',
        lineHeight: 1.6
      }}>
        Even the best navigators lose their way sometimes. Let's get you back on course.
      </p>
      <Link to="/" style={{
        display: 'inline-block',
        padding: '12px 24px',
        backgroundColor: '#111',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '8px',
        fontFamily: 'var(--sans)',
        fontSize: '16px',
        fontWeight: 500,
        transition: 'background-color 0.2s ease'
      }}>
        Back to Overview
      </Link>
    </div>
  );
}
