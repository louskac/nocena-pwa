// src/pages/RegisterPage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import PrimaryButton from '../widgets/PrimaryButton';
import logo from '../assets/logo/logo.png';
import { Keypair, PublicKey } from '@solana/web3.js';
import { storeUserInfo, hashPassword, updateAdditionalData } from '../utils/Solana';
import { pinataCreateUserData } from '../utils/Pinata';


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
    const newAccount = Keypair.generate();
  
    try {
      const userData = {
        username,
        email,
        passwordHash: hashPassword(password),
        walletAddress: newAccount.publicKey.toString(),
        profilePictureUrl: 'https://gateway.pinata.cloud/ipfs/QmRdCkhQB6NMDUQ87U1oPjXzcmayfk64xq56rp5xz6uJfV', //L: Default picture
        additionalData: 'QmXnSEMQhHPvAFSqYf2Cb2Pz4QSppw94EiVkwi8CZWa1nk', //L: Just a placeholder for later update
        dailyChallenges: Array(365).fill(0), // Initializing with zeroes
        weeklyChallenges: Array(52).fill(0), // Initializing with zeroes
        monthlyChallenges: Array(12).fill(0), // Corrected from monthlyChallenge to monthlyChallenges
        public_key: newAccount.publicKey.toBuffer(), // Store the public key as a buffer/byte array
      };
  
      // Save user data on the blockchain
      await storeUserInfo(
        userData.username, 
        userData.email, 
        userData.passwordHash, 
        userData.walletAddress, 
        userData.profilePictureUrl, 
        userData.additionalData, 
        userData.dailyChallenges,
        userData.weeklyChallenges,
        userData.monthlyChallenges,
        userData.public_key,
        newAccount
      );
  
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('walletAddress', newAccount.publicKey.toString());
  
      console.log('Storing user data in localStorage...');
      console.log(userData);
  
      setLoading(false);
      const pinata = await pinataCreateUserData(userData.walletAddress, 'https://gateway.pinata.cloud/ipfs/QmRdCkhQB6NMDUQ87U1oPjXzcmayfk64xq56rp5xz6uJfV', 'No bio yet', [], [], [], []);
      console.log(pinata);
      userData.additionalData = pinata;
      updateAdditionalData(userData.walletAddress, pinata);
      handleRegister(userData);
      navigate('/profile'); // Redirect to profile after registration
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
        <div>
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
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
