import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ThematicImage from '../widgets/ThematicImage';
import PrimaryButton from '../widgets/PrimaryButton';
import styled from 'styled-components';
import defaultProfilePic from '../assets/profile.png';
import { getTokenBalance } from '../utils/Solana';

const RoundedInput = styled.input`
  border-radius: 15px;
`;

const RoundedTextarea = styled.textarea`
  border-radius: 15px;
`;

const CreateChallenge = () => {
  const location = useLocation();
  const {
    walletAddress,
    userInfo,
    tokenBalance,
    profilePic = defaultProfilePic,
    bio,
    followers,
    username,
    challengeType
  } = location.state || {};

  const userWalletAddress = localStorage.getItem('walletAddress');
  const [price, setPrice] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [userTokenBalance, setUserTokenBalance] = useState(0);

  useEffect(() => {
    let isMounted = true; // To prevent setting state on unmounted component

    const fetchTokenBalance = async () => {
      try {
        if (userWalletAddress) {
          const balance = await getTokenBalance(userWalletAddress, 'ENzvUvbTVoyRXxEya33jhTNqqou8mot5os2WNh7ptVPW');
          if (isMounted) setUserTokenBalance(balance);
        } else {
          console.error('No wallet address found in localStorage.');
        }
      } catch (error) {
        console.error('Error fetching token balance:', error);
      }
    };

    // Debounce to avoid multiple rapid calls
    const timeoutId = setTimeout(() => {
      fetchTokenBalance();
    }, 1000); // Adjust the delay as necessary

    return () => {
      isMounted = false;
      clearTimeout(timeoutId); // Cleanup the timeout if the component unmounts
    };
  }, [userWalletAddress]);

  console.log('User Token Balance:', userTokenBalance); // This will log the actual token balance

  const validateForm = () => {
    const newErrors = {};
    const priceMin = challengeType === 'private' ? 10 : 1000;

    if (!title) newErrors.title = 'Title is required';
    if (!price || isNaN(price) || price < priceMin)
      newErrors.price = `Price must be a number and at least ${priceMin} tokens`;
    if (price > userTokenBalance) newErrors.price = `You don't have enough token to send. Go earn it or buy some in the menu.`;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      console.log('Challenge created:', { challengeType, price, title, description });
    }
  };

  return (
    <div className="flex items-center justify-center bg-[#0A141D] text-white">
      <div className="w-full max-w-md mx-4">
        <div className="text-center mb-4">
          <ThematicImage className="relative">
            <img
              src={profilePic}
              alt={`${username}'s profile picture`}
              className="w-24 h-24 object-cover rounded-full mx-auto"
            />
          </ThematicImage>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div className="mb-3">
            <label htmlFor="formTitle" className="block mb-1">
              Title
            </label>
            <RoundedInput
              type="text"
              id="formTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Name of the challenge"
              className={`w-full py-2 px-4 bg-white border text-black ${errors.title ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div className="mb-3">
            <label htmlFor="formPrice" className="block mb-1">
              Price
            </label>
            <RoundedInput
              type="number"
              id="formPrice"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={`Minimum ${challengeType === 'private' ? 10 : 1000} tokens`}
              className={`w-full py-2 px-4 bg-white border text-black ${errors.price ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>

          <div className="mb-6">
            <label htmlFor="formDescription" className="block mb-1">
              Description (optional)
            </label>
            <RoundedTextarea
              id="formDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full py-2 px-4 bg-white text-black border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="mb-3">
            <PrimaryButton
              text={challengeType === 'private' ? 'Challenge me' : 'Create public challenge'}
              className="w-full"
              onPressed={handleSubmit}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChallenge;