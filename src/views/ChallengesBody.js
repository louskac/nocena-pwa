import React, { useEffect, useState } from 'react';
import { getUserInfoWallet } from '../utils/Solana'; 
import { fetchUserDataFromPinata } from '../utils/Pinata';
import ThematicImage from '../widgets/ThematicImage';
import ThematicText from '../widgets/ThematicText';
import nocenixIcon from '../assets/icons/nocenix.ico';
import defaultProfilePic from '../assets/profile.png';

const ChallengesBody = () => {
  const [challenges, setChallenges] = useState([]);
  const [userInfo, setUserInfo] = useState(null);

  const fetchChallenges = async () => {
    try {
      const walletAddress = localStorage.getItem('walletAddress');
      const info = await getUserInfoWallet(walletAddress);
      setUserInfo(info);

      const userData = await fetchUserDataFromPinata(info.additionalData);
      const challengesData = Array.isArray(userData.challenges) ? userData.challenges : [];
      setChallenges(challengesData);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      setChallenges([]); // Ensure challenges is an empty array on error
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleChallengeClick = (challenge) => {
    console.log('Challenge selected:', challenge.title);
    // Add logic for when a challenge is clicked, e.g., navigating to a detailed view
  };

  return (
    <div className="p-4">
      {challenges.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {challenges.map((challenge, index) => (
            <li
              key={index}
              className="relative flex flex-col justify-between p-4 rounded-[15px] overflow-hidden cursor-pointer"
              onClick={() => handleChallengeClick(challenge)}
            >
              {/* Background Layer */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/0 backdrop-blur-lg z-0"></div>

              {/* Ellipse Layer */}
              <div
                className={`absolute top-1/2 left-[70%] w-[80%] h-[80%] transform -translate-x-1/2 -translate-y-1/2 rounded-full z-0`}
                style={{
                  background: challenge.challengeType === 'private'
                    ? 'radial-gradient(circle, rgba(253,78,245,1) 0%, rgba(253,78,245,0) 70%)'
                    : 'radial-gradient(circle, rgba(0,123,255,1) 0%, rgba(0,123,255,0) 70%)',
                  filter: 'blur(30px)',
                }}
              />

              {/* Content Layer */}
              <div className="relative z-10 flex-1">
                {/* Title */}
                <div className="font-bold text-white text-md font-light mb-4">{challenge.title}</div>
                
                {/* Bottom Row: Price on the left, Username and Profile on the right */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-white">
                    <img src={nocenixIcon} alt="Nocenix Token" className="w-12 h-12 mr-2 filter" />
                    <span>{challenge.price}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <ThematicText text={challenge.loggedUsername || 'Unknown'} isActive={true} className="capitalize" />
                    <ThematicImage>
                      <img src={defaultProfilePic} alt="Profile picture of the challenger" className="w-8 h-8 object-cover rounded-full" />
                    </ThematicImage>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-white">No challenges available.</p>
      )}
    </div>
  );
};

export default ChallengesBody;
