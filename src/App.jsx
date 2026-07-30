import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import SideMenu from './components/SideMenu';
import MasterDashboard from './pages/MasterDashboard';
import MembersPage from './pages/MembersPage';
import ViolenceDistrictPage from './pages/ViolenceDistrictPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import MemberProfilePage from './pages/MemberProfilePage';
import PageTransition from './components/PageTransition';
import './App.css';

// Protected Route Component
function ProtectedRoute({ children }) {
  const userId = localStorage.getItem('testingUserId');
  if (!userId) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <PageTransition><MasterDashboard /></PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/members" 
          element={
            <ProtectedRoute>
              <PageTransition><MembersPage /></PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/member/:id" 
          element={
            <ProtectedRoute>
              <PageTransition><MemberProfilePage /></PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/violence" 
          element={
            <ProtectedRoute>
              <PageTransition><ViolenceDistrictPage /></PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function MainLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="app-container">
      {!isLoginPage && <SideMenu />}
      <AnimatedRoutes />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}

export default App;
