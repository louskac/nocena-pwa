import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { transferSplToken, updateChallengeData } from '../utils/Solana';
import { uploadDailyChallengeMedia } from '../utils/Pinata';

import ThematicImage from '../widgets/ThematicImage';
import PrimaryButton from '../widgets/PrimaryButton';
import SecondaryButton from '../widgets/SecondaryButton';

import AIProfilePic from '../assets/AI.png';
import nocenixIcon from '../assets/icons/nocenix.ico';

const CompleteChallenge = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { challengeType, reward, title, description, image } = location.state || { 
    challengeType: 'daily', 
    reward: 1, 
    title: 'Unknown Challenge', 
    description: 'No description available', 
    image: AIProfilePic 
  };
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

  const captureMedia = async () => {
    // Check if getUserMedia is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('getUserMedia is not supported on this browser or device.');
      return;
    }
  
    const constraints = {
      video: true,
      audio: false,
    };
  
    const captureImage = (stream) => {
      return new Promise((resolve) => {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();
  
        video.onloadeddata = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          stream.getTracks().forEach((track) => track.stop());
          resolve(canvas.toDataURL('image/png'));
        };
      });
    };
  
    const captureVideo = (stream, duration = 2000) => {
      return new Promise((resolve) => {
        const mediaRecorder = new MediaRecorder(stream);
        const chunks = [];
  
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
          const videoBlob = new Blob(chunks, { type: 'video/mp4' });
          const videoUrl = URL.createObjectURL(videoBlob);
          resolve(videoUrl);
        };
  
        mediaRecorder.start();
        setTimeout(() => {
          mediaRecorder.stop();
        }, duration);
      });
    };
  
    try {
      // Capture video stream for front and back cameras
      const frontStream = await navigator.mediaDevices.getUserMedia({ ...constraints, video: { facingMode: 'user' } });
      const backStream = await navigator.mediaDevices.getUserMedia({ ...constraints, video: { facingMode: { exact: 'environment' } } });
  
      // Capture front and back images
      const frontImage = await captureImage(frontStream);
      const backImage = await captureImage(backStream);
  
      // Capture video (using frontStream for example, but you could choose backStream)
      const videoUrl = await captureVideo(frontStream);
  
      return { frontImage, backImage, videoUrl };
    } catch (error) {
      alert('Error capturing media: ' + error.message);
      throw error;
    }
  };

  const handleFinish = async () => {
    const recipientAddress = localStorage.getItem('walletAddress');

    if (!recipientAddress) {
      alert('Recipient address not found');
      return;
    }

    try {
      if (isNaN(reward)) {
        alert('Invalid reward amount');
        return;
      }

      // Capture media
      const { frontImage, backImage, videoUrl } = await captureMedia();

      // Convert data URLs to Blob for upload
      const frontImageBlob = await fetch(frontImage).then(res => res.blob());
      const backImageBlob = await fetch(backImage).then(res => res.blob());

      // Upload media to Pinata using the correct function
      const dailyChallengeCID = await uploadDailyChallengeMedia(recipientAddress, frontImageBlob, backImageBlob);

      // Transfer SPL Token as reward
      await transferSplToken(recipientAddress, tokenMintAddress, reward);
      console.log(`Calling Solana function to save data to: ${recipientAddress} for ${challengeType} on index ${challengeIndex}`);

      // Update challenge data on the blockchain
      await updateChallengeData(recipientAddress, challengeType, challengeIndex, { dailyChallengeCID });

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
      alert('Error completing challenge: ' + error.message);
      console.error('Error completing challenge:', error);
    }
  };

  return (
    <div className="bg-[#0A141D] text-white p-4 flex flex-col items-center justify-center">
      <ThematicImage>
        <img
          src={image === 'AI.png' ? AIProfilePic : image}
          alt="Challenge Image"
          className="w-24 h-24 object-cover rounded-full cursor-pointer"
        />
      </ThematicImage>
      <div className="flex items-center justify-center mt-8">
        <img src={nocenixIcon} alt="Nocenix Icon" className="mr-2" width={36} height={36} />
        <span>{reward}</span>
      </div>
      <h2 className="text-2xl my-8 text-center font-font-primary">{title}</h2>
      <p className="mb-8 text-center">{description}</p>
      <div className="flex items-center space-x-4 w-full">
        <SecondaryButton text="Upload file" />
        <PrimaryButton text="Finish now" onPressed={handleFinish} />
      </div>
    </div>
  );
};

export default CompleteChallenge;