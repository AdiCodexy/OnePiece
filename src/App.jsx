import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import SideMenu from './components/SideMenu';
import Home from './pages/Home';
import MembersPage from './pages/MembersPage';
import ChallengePage from './pages/ChallengePage';
import QuizPage from './pages/QuizPage';
import LeaderboardPage from './pages/LeaderboardPage';
import MemberProfilePage from './pages/MemberProfilePage';
import PirateShipsPage from './pages/PirateShipsPage';
import NotFoundPage from './pages/NotFoundPage';
import PageTransition from './components/PageTransition';
import './App.css';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/members" element={<PageTransition><MembersPage /></PageTransition>} />
        <Route path="/challenge" element={<PageTransition><ChallengePage /></PageTransition>} />
        <Route path="/quiz" element={<PageTransition><QuizPage /></PageTransition>} />
        <Route path="/leaderboard" element={<PageTransition><LeaderboardPage /></PageTransition>} />
        <Route path="/ships" element={<PageTransition><PirateShipsPage /></PageTransition>} />
        <Route path="/member/:id" element={<PageTransition><MemberProfilePage /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <SideMenu />
        <AnimatedRoutes />
      </div>
    </BrowserRouter>
  );
}

export default App;
