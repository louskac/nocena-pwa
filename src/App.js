// src/App.js

import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AppLayout from './components/AppLayout';

function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);

  const showRegisterPage = () => {
    setShowLogin(false);
  };

  const showLoginPage = () => {
    setShowLogin(true);
  };

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('walletAddress', userData.walletAddress);
    localStorage.setItem('publicKey', userData.publicKey);
    localStorage.setItem('additionalData', userData.additionalData);
    setUser(userData);
    setShowLogin(false);
  };

  const handleRegister = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('publicKey');
    localStorage.removeItem('additionalData');
    setUser(null);
    setShowLogin(true);
  };

  return (
    <Router>
      <Routes>
        {user ? (
          <Route path="/*" element={<AppLayout user={user} handleLogout={handleLogout} />} />
        ) : (
          <>
            <Route path="/login" element={<LoginPage showRegisterPage={showRegisterPage} handleLogin={handleLogin} />} />
            <Route path="/register" element={<RegisterPage showLoginPage={showLoginPage} handleRegister={handleRegister} />} />
            <Route path="/*" element={<LoginPage showRegisterPage={showRegisterPage} handleLogin={handleLogin} />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
