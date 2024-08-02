// src/pages/RegisterPage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import PrimaryButton from '../widgets/PrimaryButton';
import logo from '../assets/logo/logo.png';
import { generateKeypair } from '../utils/Solana';

const RoundedInput = styled.input`
  border-radius: 20px;
`;

const RegisterPage = ({ handleRegister }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegisterClick = async () => {
    setLoading(true);
    try {
      // Generate a new keypair for the user
      const keypair = generateKeypair();
      console.log('Generated Keypair:', keypair);

      // Store user data in localStorage
      const userData = {
        username,
        email,
        password,
        publicKey: keypair.publicKey.toString(),
        secretKey: keypair.secretKey.toString(),
      };
      localStorage.setItem('user', JSON.stringify(userData));

      console.log('Storing user data in localStorage...');
      console.log(userData);

      setLoading(false);
      handleRegister(userData);
    } catch (e) {
      console.log('Error during registration:', e);
      setLoading(false);
    }
  };

  const handleShowLoginPage = () => {
    navigate('/login');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0A141D] text-white">
      <div className="w-full max-w-md mx-4">
        <div className="text-center mb-4">
          <img src={logo} alt="Logo" className="max-w-full h-auto mx-auto" />
        </div>
        <form>
          <div className="mb-3">
            <label htmlFor="formUsername" className="block mb-1">
              Username
            </label>
            <RoundedInput
              type="text"
              id="formUsername"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full py-2 px-4 bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="formEmail" className="block mb-1">
              Email
            </label>
            <RoundedInput
              type="email"
              id="formEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
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

          <div className="mb-3">
            <PrimaryButton text="Register" onPressed={handleRegisterClick} />
          </div>

          <div className="text-center mb-3">
            <span>Already have a profile?</span>{' '}
            <a href="#" onClick={handleShowLoginPage} className="text-primary-blue">
              Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
