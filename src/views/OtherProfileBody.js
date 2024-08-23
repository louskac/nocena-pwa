import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserInfoWallet, getTokenBalance } from '../utils/Solana'; 
import { fetchUserDataFromPinata } from '../utils/Pinata';
import defaultProfilePic from '../assets/profile.png';
import nocenixIcon from '../assets/icons/nocenix.ico';
import followersIcon from '../assets/icons/followers.svg';
import ThematicImage from '../widgets/ThematicImage';
import ChallengeIndicator from '../widgets/ChallengeIndicator';
import ThematicText from '../widgets/ThematicText';
import PrimaryButton from '../widgets/PrimaryButton';
import SecondaryButton from '../widgets/SecondaryButton';

const OtherProfileBody = () => {
  const { walletAddress } = useParams(); 
  const [userInfo, setUserInfo] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [profilePic, setProfilePic] = useState(defaultProfilePic);
  const [bio, setBio] = useState('This user has not set a bio.');
  const [followers, setFollowers] = useState(0);
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const info = await getUserInfoWallet(walletAddress);
        setUserInfo(info);

        if (info.additionalData) {
          const pinataData = await fetchUserDataFromPinata(info.additionalData);

          if (pinataData.profileImage) {
            setProfilePic(pinataData.profileImage);
          }
          if (pinataData.bio) {
            setBio(pinataData.bio);
          }
          if (pinataData.followers) {
            setFollowers(pinataData.followers.length);
          }
        }

        const balance = await getTokenBalance(walletAddress, 'ENzvUvbTVoyRXxEya33jhTNqqou8mot5os2WNh7ptVPW');
        setTokenBalance(balance);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, [walletAddress]);

  useEffect(() => {
    if (scrollContainerRef.current && userInfo) {
      const currentMonthIndex = new Date().getMonth();
      const elementWidth = scrollContainerRef.current.scrollWidth / 12;
      scrollContainerRef.current.scrollLeft = elementWidth * currentMonthIndex - (scrollContainerRef.current.clientWidth / 2) + (elementWidth / 2);
    }
  }, [userInfo]);

  const handleChallengeMe = () => {
    console.log("profile pic:" + profilePic);
    navigate('/createchallenge', { 
      state: { 
        walletAddress,
        userInfo,
        tokenBalance,
        profilePic: profilePic,
        bio,
        followers,
        username: userInfo.username,
        challengeType: 'private'  // or 'public', depending on your context
      }
    });
    console.log("Challenge me was pressed for: ", walletAddress);
  };

  const handleUpcoming = (walletAddress) => {
    console.log("Upcoming was pressed for: ", walletAddress);
  };

  if (!userInfo) {
    return <div>Loading...</div>;
  }

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="flex flex-col items-center text-white relative min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute -top-50 right-0 transform translate-x-1/4 w-[400px] h-[400px] bg-primary-blue rounded-full opacity-10 blur-lg"></div>
        <div className="absolute -bottom-40 left-0 transform -translate-x-1/3 w-[500px] h-[500px] bg-primary-pink rounded-full opacity-10 blur-lg"></div>
      </div>
      
      {/* Profile Picture and Stats Row */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-xs my-8">
        {/* Followers Count */}
        <div className="flex flex-col items-center">
          <img src={followersIcon} alt="Followers" className="w-8 h-8 mb-1" />
          <span>{followers}</span> {/* Updated to show followers from Pinata */}
        </div>

        {/* Profile Picture */}
        <ThematicImage className="relative">
          <img
            src={profilePic}
            alt={`${userInfo.username}'s profile`}
            className="w-24 h-24 object-cover rounded-full"
          />
        </ThematicImage>

        {/* Token Balance */}
        <div className="flex flex-col items-center">
          <img src={nocenixIcon} alt="Nocenix Token" className="w-10 h-10 mb-1" />
          <span>{tokenBalance}</span>
        </div>
      </div>

      {/* Username */}
      <ThematicText text={userInfo.username} isActive={true} className="capitalize relative z-10 mt-4" />

      {/* Buttons */}
      <div className="relative z-10 flex items-center justify-center space-x-4 my-8">
        <SecondaryButton 
          text="Upcoming" 
          className="px-6 py-2" 
          onPressed={handleUpcoming} 
        />
        <PrimaryButton 
          text="Challenge&nbsp;me" 
          className="px-6 py-2" 
          onPressed={() => handleChallengeMe(walletAddress)} 
        />
      </div>

      {/* Bio */}
      <div className="relative z-10 px-4 text-center text-sm bg-black/40 rounded-md py-2 w-full max-w-xs mt-8">
        <p>{bio}</p> {/* Updated to show bio from Pinata */}
      </div>

      {/* Timed Challenge Counter */}
      <div className="relative z-20 mt-10 text-center w-full">
        <h3 className="text-lg font-semibold">Timed challenge counter</h3>
        <div className="relative z-20 flex overflow-x-auto no-scrollbar w-full px-4" ref={scrollContainerRef} style={{ paddingBottom: '30px' }}>
          {userInfo.monthlyChallenges && userInfo.monthlyChallenges.length > 0 ? (
            userInfo.monthlyChallenges.map((challenge, index) => (
              <div
                key={index}
                className={`w-[200px] flex-shrink-0 flex flex-col items-center justify-center`}
              >
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mt-8`}>
                  <ChallengeIndicator
                    dailyChallenges={userInfo.dailyChallenges}
                    weeklyChallenges={userInfo.weeklyChallenges}
                    monthlyChallenge={challenge}
                    month={index}
                  />
                </div>
                <span className="text-sm mt-4">{monthNames[index]}</span>
              </div>
            ))
          ) : (
            <p>No challenges available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OtherProfileBody;
