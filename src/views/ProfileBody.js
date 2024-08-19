import React, { useEffect, useState, useRef } from 'react';
import { getTokenBalance, updateAdditionalData } from '../utils/Solana';
import { pinataUpdateUserBio } from '../utils/Pinata';

import nocenixIcon from '../assets/icons/nocenix.ico';
import defaultProfilePic from '../assets/profile.png';
import followersIcon from '../assets/icons/followers.svg';
import ThematicImage from '../widgets/ThematicImage';
import ChallengeIndicator from '../widgets/ChallengeIndicator';
import ThematicText from '../widgets/ThematicText';
import PrimaryButton from '../widgets/PrimaryButton';
import ThematicIcon from '../widgets/ThematicIcon'; // Importing ThematicIcon
import saveIcon from '../assets/icons/save.svg'; // Save icon

const ProfileBody = ({ user, walletAddress, updateUserBio }) => {
  const [tokenBalance, setTokenBalance] = useState(0);
  const [profilePic, setProfilePic] = useState(defaultProfilePic);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bio, setBio] = useState(user.bio || 'No bio available.');
  const [originalBio, setOriginalBio] = useState(user.bio || 'No bio available.');
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (user.profilePictureUrl) {
      setProfilePic(user.profilePictureUrl);
    }

    if (walletAddress) {
      const fetchTokenBalance = async () => {
        try {
          const balance = await getTokenBalance(walletAddress, 'ENzvUvbTVoyRXxEya33jhTNqqou8mot5os2WNh7ptVPW');
          setTokenBalance(balance);
        } catch (error) {
          console.error('Error fetching token balance:', error);
        }
      };

      fetchTokenBalance();
    }
  }, [walletAddress, user.profilePictureUrl]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const currentMonthIndex = new Date().getMonth();
      const elementWidth = scrollContainerRef.current.scrollWidth / 12;
      scrollContainerRef.current.scrollLeft = elementWidth * currentMonthIndex - (scrollContainerRef.current.clientWidth / 2) + (elementWidth / 2);
    }
  }, []);

  const handleProfilePicClick = () => {
    console.log('Profile picture clicked!');
  };

  const handleUpcoming = () => {
    console.log("Upcoming was pressed for: ", walletAddress);
  };

  const handleEditBioClick = () => {
    console.log('Edit button clicked'); // Debugging statement
    setIsEditingBio(true);
  };

  const handleSaveBioClick = async () => {
    console.log('Save button clicked'); // Debugging statement
    const pinata = await pinataUpdateUserBio(user.additionalData, bio); // Function to save the updated bio
    updateAdditionalData(walletAddress, pinata);
    setIsEditingBio(false);
    setOriginalBio(bio); // Update the original bio with the new bio
  };

  const handleBioChange = (event) => {
    console.log("handleBioChange");
    setBio(event.target.value);
  };

  const handleCancelEdit = () => {
    setIsEditingBio(false);
    setBio(originalBio); // Reset the bio to its original state
  };

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
          <span>{user.followed_by ? user.followed_by.length : 0}</span> {/* Actual followers count */}
        </div>

        {/* Profile Picture */}
        <div onClick={handleProfilePicClick}>
          <ThematicImage className="relative z-10"> {/* Ensure z-index is higher */}
            <img
              src={profilePic}
              alt="Profile"
              className="w-24 h-24 object-cover rounded-full cursor-pointer"
              style={{ zIndex: 10 }} /* Explicitly set z-index if needed */
            />
          </ThematicImage>
        </div>

        {/* Token Balance */}
        <div className="flex flex-col items-center">
          <img src={nocenixIcon} alt="Nocenix Token" className="w-10 h-10 mb-1" />
          <span>{tokenBalance}</span>
        </div>
      </div>

      {/* Username */}
      <ThematicText text={user.username} isActive={true} className="capitalize relative z-10" /> {/* Added margin-top */}

      {/* Buttons */}
      <div className="relative z-10 flex items-center justify-center space-x-4 my-8">
        <PrimaryButton 
          text="Upcoming" 
          className="px-6 py-2" 
          onPressed={handleUpcoming} 
        />
      </div>

      {/* Bio */}
      <div className={`relative z-10 px-4 text-center text-sm bg-black/40 rounded-md py-2 w-full max-w-xs mt-16 ${isEditingBio ? 'border border-white' : ''}`}>
        <div className="flex justify-between items-center">
          {isEditingBio ? (
            <>
              <textarea
                className="w-full p-2 bg-transparent text-white rounded"
                value={bio}
                onChange={handleBioChange}
              />
              <img
                src={saveIcon}
                alt="Save"
                className="w-6 h-6 ml-2 cursor-pointer"
                onClick={handleSaveBioClick}
              />
              <div onClick={handleCancelEdit} className="ml-4">
                <ThematicIcon
                  iconName="pen"
                  isActive={true}
                />
              </div>
            </>
          ) : (
            <p>{bio}</p>
          )}
          {!isEditingBio && (
            <div onClick={handleEditBioClick}>
              <ThematicIcon
                iconName="pen"
                isActive={false}
              />
            </div>
          )}
        </div>
      </div>

      {/* Timed Challenge Counter */}
      <div className="relative z-20 mt-10 text-center w-full">
        <h3 className="text-lg font-semibold">Timed challenge counter</h3>
        <div className="relative z-20 flex overflow-x-auto no-scrollbar w-full px-4" ref={scrollContainerRef} style={{ paddingBottom: '30px' }}>
          {user.monthlyChallenges && user.monthlyChallenges.length > 0 ? (
            user.monthlyChallenges.map((challenge, index) => (
              <div
                key={index}
                className={`w-[200px] flex-shrink-0 flex flex-col items-center justify-center`}
              >
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mt-8 ${index === new Date().getMonth()}`}>
                  <ChallengeIndicator
                    dailyChallenges={user.dailyChallenges}
                    weeklyChallenges={user.weeklyChallenges}
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

export default ProfileBody;
