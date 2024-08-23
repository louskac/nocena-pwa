import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PrimaryButton from '../widgets/PrimaryButton';
import { transferSplToken, updateChallengeData } from '../utils/Solana';

const CompleteChallenge = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { challengeType, reward } = location.state || { challengeType: 'daily', reward: 1 };
  const tokenMintAddress = 'ENzvUvbTVoyRXxEya33jhTNqqou8mot5os2WNh7ptVPW';

  const getChallengeIndex = () => {
    const today = new Date();
    
    // Calculate the day of the year
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = today - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24; // Milliseconds in a day
    const dayOfYear = Math.floor(diff / oneDay);
    
    if (challengeType === 'daily') {
      return dayOfYear - 1; // 0-based index for days
    } else if (challengeType === 'weekly') {
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
      const adjustedDate = today.getDate() + firstDayOfMonth - 1;
      return Math.floor(adjustedDate / 7); // 0-based index for weeks
    } else if (challengeType === 'monthly') {
      return today.getMonth(); // 0-based index for months
    }
    
    return 0; // Default case, should not occur
  };

  const challengeIndex = getChallengeIndex();
  
  const handleFinish = async () => {
    const recipientAddress = localStorage.getItem('walletAddress');
  
    if (!recipientAddress) {
      console.error('Recipient address not found');
      return;
    }
  
    try {
      if (isNaN(reward)) {
        console.error('Invalid reward amount');
        return;
      }
  
      // Transfer SPL Token as reward
      await transferSplToken(recipientAddress, tokenMintAddress, reward);
      console.log(`Calling Solana function to save data to: ${recipientAddress} for ${challengeType} on index ${challengeIndex}`);
      
      // Update challenge data on the blockchain
      await updateChallengeData(recipientAddress, challengeType, challengeIndex);
  
      // Retrieve current user data from localStorage
      const storedUserData = JSON.parse(localStorage.getItem('user'));
      
      if (storedUserData) {
        // Update the relevant challenge array
        if (challengeType === 'daily') {
          storedUserData.dailyChallenges[challengeIndex] = 1; // Mark the challenge as completed
        } else if (challengeType === 'weekly') {
          storedUserData.weeklyChallenges[challengeIndex] = 1; // Mark the challenge as completed
        } else if (challengeType === 'monthly') {
          storedUserData.monthlyChallenges[challengeIndex] = 1; // Mark the challenge as completed
        }
  
        // Save the updated user data back to localStorage
        localStorage.setItem('user', JSON.stringify(storedUserData));
  
        console.log('Updated user data stored in localStorage:', storedUserData);
      } else {
        console.error('User data not found in localStorage');
      }
  
      navigate('/home');
    } catch (error) {
      console.error('Error completing challenge:', error);
    }
  };

  return (
    <div className="bg-[#0A141D] text-white p-4 min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-2xl mb-4">Challenge Completed!</h2>
      <p className="mb-6">Congratulations on completing the challenge!</p>
      <PrimaryButton text="Go Back Home" onPressed={handleFinish} />
    </div>
  );
};

export default CompleteChallenge;
