// src/pages/LoginPage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import PrimaryButton from '../widgets/PrimaryButton';
import logo from '../assets/logo/logo.png';
import solanaLogo from '../assets/solana.png';

const RoundedInput = styled.input`
  border-radius: 20px;
`;

const LoginPage = ({ handleLogin }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        const isValidUser =
          (storedUser.username === identifier || storedUser.email === identifier) &&
          storedUser.password === password;

        if (isValidUser) {
          handleLogin(storedUser);
        } else {
          console.log('Invalid username/email or password');
          setShowForgotPassword(true);
        }
      } else {
        console.log('No user found');
        setShowForgotPassword(true);
      }
      setLoading(false);
    } catch (e) {
      console.log('Error:', e);
      setShowForgotPassword(true);
      setLoading(false);
    }
  };

  const handleConnectWithSolana = async () => {
    console.log('Connect with Solana');
  };

  const handleShowRegisterPage = () => {
    navigate('/register');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0A141D] text-white">
      <div className="w-full max-w-md mx-4">
        <div className="text-center mb-4">
          <img src={logo} alt="Logo" className="max-w-full h-auto mx-auto" />
        </div>
        <form>
          <div className="mb-3">
            <label htmlFor="formIdentifier" className="block mb-1">
              Username or Email
            </label>
            <RoundedInput
              type="text"
              id="formIdentifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter username or email"
              className="w-full py-2 px-4 bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="formPassword" className="block mb-1">
              Password
            </label>
            <RoundedInput
              type="password"
              id="formPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full py-2 px-4 bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {showForgotPassword && (
            <div className="text-right mb-3">
              <a href="/forgot-password" className="text-blue-400">
                Forgot password?
              </a>
            </div>
          )}

          <div className="mb-3">
            <PrimaryButton text="Login" onPressed={handleSignIn} />
          </div>

          <div className="text-center mb-3">
            <span>Don't have a profile yet?</span>{' '}
            <a href="#" onClick={handleShowRegisterPage} className="text-primary-blue">
              Sign up
            </a>
          </div>

          <div className="text-center">
            <p>For a truly Web3 experience log in with Solana</p>
            <img
              src={solanaLogo}
              alt="Solana Logo"
              className="cursor-pointer max-w-[90px] h-auto mx-auto"
              onClick={handleConnectWithSolana}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
