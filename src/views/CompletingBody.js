
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from '../widgets/PrimaryButton';

const CompleteChallenge = () => {
  const navigate = useNavigate();

  const handleFinish = () => {
    navigate('/home');
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