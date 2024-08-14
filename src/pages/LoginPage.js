// src/pages/LoginPage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import PrimaryButton from '../widgets/PrimaryButton';
import logo from '../assets/logo/logo.png';
import { getUserInfo, comparePassword } from '../utils/Solana';

const RoundedInput = styled.input`
  border-radius: 20px;
`;

const LoginPage = ({ handleLogin }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();  // Prevent the default form submission behavior
    setLoading(true);
    console.log('SignIn initiated...');
    
    try {
      // Fetch user data from the blockchain
      console.log("identifier: " + identifier);
      const storedUser = await getUserInfo(identifier);
      console.log('Stored user:', storedUser);
  
      if (storedUser) {
        const isValidPassword = comparePassword(password, storedUser.passwordHash);
  
        if (isValidPassword) {
          // Ensure all fields from UserInfo are included when storing in localStorage
          const userData = {
            username: storedUser.username,
            email: storedUser.email,
            passwordHash: storedUser.passwordHash,
            walletAddress: storedUser.walletAddress,
            profilePictureUrl: storedUser.profilePictureUrl || '',
            additionalData: storedUser.additionalData || '',
            bio: storedUser.bio || 'No bio yet',
            dailyChallenges: storedUser.dailyChallenges || Array(365).fill(0),
            weeklyChallenges: storedUser.weeklyChallenges || Array(52).fill(0),
            monthlyChallenges: storedUser.monthlyChallenges || Array(12).fill(0),
            public_key: storedUser.public_key || new Uint8Array(32),
            following: storedUser.following || [],
            followed_by: storedUser.followed_by || []
          };
  
          // Store the entire user object in localStorage
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('walletAddress', userData.walletAddress);
  
          console.log('User data stored in localStorage:', userData);
  
          // Handle successful login
          handleLogin(userData);
          console.log('Login successful, navigating to home...');
          navigate('/home');  // Redirect to home page after login
        } else {
          console.log('Invalid password');
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
  
  const handleShowRegisterPage = () => {
    navigate('/register');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0A141D] text-white">
      <div className="w-full max-w-md mx-4">
        <div className="text-center mb-4">
          <img src={logo} alt="Logo" className="max-w-full h-auto mx-auto" />
        </div>
        <form onSubmit={handleSignIn}>
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
              <a href="/forgot-password" className="text-primary-blue">
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
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
