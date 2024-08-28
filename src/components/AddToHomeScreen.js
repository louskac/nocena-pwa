import React, { useState, useEffect } from 'react';
import PrimaryButton from '../widgets/PrimaryButton';
import logo from '../assets/logo/logo.png';

const AddToHomeScreen = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI to notify the user they can add to home screen
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleAddToHomeScreen = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    // Optionally, log the outcome
    console.log(`User response to the install prompt: ${outcome}`);
    // Reset the deferred prompt
    setDeferredPrompt(null);
    // Hide the install button
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0A141D] text-white">
      <div className="w-full max-w-md mx-4">
        <div className="text-center mb-4">
          <img src={logo} alt="Logo" className="max-w-full h-auto mx-auto" />
        </div>
        <div className="font-bold text-white text-md font-light mb-4">Welcome to the challenge</div>
        <PrimaryButton text="Let me in" onPressed={handleAddToHomeScreen} />
      </div>
    </div>
  );
};

export default AddToHomeScreen;
