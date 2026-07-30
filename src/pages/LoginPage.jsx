import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticateWithCode } from '../lib/supabase';
import TextPressure from '../components/TextPressure';
import './LoginPage.css';

export default function LoginPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (code.length !== 4) {
      setError('Please enter a 4-digit code.');
      return;
    }

    setLoading(true);
    const user = await authenticateWithCode(code);
    setLoading(false);

    if (user) {
      // Store user ID in localStorage to keep them logged in
      localStorage.setItem('testingUserId', user.id.toString());
      navigate('/');
    } else {
      setError('Invalid code. The World Government does not recognize you.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <TextPressure
            text="A C C E S S"
            flex={true}
            alpha={false}
            stroke={false}
            width={true}
            weight={true}
            italic={true}
            sizeFactor={1.2}
            textColor="#000000"
            strokeColor="#000000"
            minFontSize={36}
          />
        </div>
        <p className="login-subtitle">Enter your 4-digit crew code to access the terminal.</p>
        
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="text"
            maxLength={4}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="0000"
            className="login-input"
            autoFocus
          />
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Verifying...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}
