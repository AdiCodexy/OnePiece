import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import SideMenu from './components/SideMenu';
import MasterDashboard from './pages/MasterDashboard';
import MembersPage from './pages/MembersPage';
import NotFoundPage from './pages/NotFoundPage';
import PageTransition from './components/PageTransition';
import './App.css';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><MasterDashboard /></PageTransition>} />
        <Route path="/members" element={<PageTransition><MembersPage /></PageTransition>} />
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
