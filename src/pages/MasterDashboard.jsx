import React, { useEffect } from 'react';
import Home from './Home';
import ChallengePage from './ChallengePage';
import QuizPage from './QuizPage';
import LeaderboardPage from './LeaderboardPage';
import Footer from '../components/Footer';
import './MasterDashboard.css';

export default function MasterDashboard() {
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    }
  }, []);

  return (
    <div className="master-dashboard-container">
      <section id="home" className="master-section">
        <Home />
      </section>
      
      <section id="challenge" className="master-section">
        <ChallengePage />
      </section>
      
      <section id="quiz" className="master-section">
        <QuizPage />
      </section>
      
      <section id="leaderboard" className="master-section">
        <LeaderboardPage />
      </section>

      <Footer />
    </div>
  );
}
