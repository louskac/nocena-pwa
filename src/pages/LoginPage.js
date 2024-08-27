import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import PrimaryButton from '../widgets/PrimaryButton';
import logo from '../assets/logo/logo.png';
import { getUserInfo, comparePassword } from '../utils/Solana';
import { fetchUserDataFromPinata } from '../utils/Pinata';

const RoundedInput = styled.input`
  border-radius: 15px;
`;

const LoginPage = ({ handleLogin }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // State to handle errors

  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Reset error state on new login attempt
    console.log('ajo')
  
    try {
      const storedUser = await getUserInfo(identifier);
      console.log('stored user' + storedUser);
  
      if (!storedUser) {
        setError('No user found with the provided username or email');
        setShowForgotPassword(true);
        return; // Return early to prevent further execution
      }
  
      const isValidPassword = comparePassword(password, storedUser.passwordHash);
      if (isValidPassword) {
        const pinataCID = storedUser.additionalData;
        const pinataData = await fetchUserDataFromPinata(pinataCID);
  
        const userData = {
          username: storedUser.username,
          email: storedUser.email,
          passwordHash: storedUser.passwordHash,
          walletAddress: storedUser.walletAddress,
          profilePictureUrl: storedUser.profilePictureUrl,
          additionalData: storedUser.additionalData,
          bio: pinataData.bio || storedUser.bio,
          dailyChallenges: storedUser.dailyChallenges,
          weeklyChallenges: storedUser.weeklyChallenges,
          monthlyChallenges: storedUser.monthlyChallenges,
          public_key: storedUser.public_key,
          following: pinataData.following || storedUser.following,
          followed_by: pinataData.followed_by || storedUser.followed_by
        };
  
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('walletAddress', userData.walletAddress);
        localStorage.setItem('username', userData.username);
  
        handleLogin(userData);
        navigate('/home');
      } else {
        setError('Incorrect password');
        setShowForgotPassword(true);
      }
    } catch (e) {
      console.log('Error during login:', e);
      setError('User not found');
    } finally {
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

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>} {/* Display error message */}

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
