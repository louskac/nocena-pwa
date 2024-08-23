import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSearchUsersInfo, getTokenBalance } from '../utils/Solana';
import { fetchUserDataFromPinata } from '../utils/Pinata';
import defaultProfilePic from '../assets/profile.png';
import ThematicImage from '../widgets/ThematicImage';
import PrimaryButton from '../widgets/PrimaryButton';
import SecondaryButton from '../widgets/SecondaryButton'; // Assuming you have a SecondaryButton component
import nocenixIcon from '../assets/icons/nocenix.ico';

const SearchBody = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const [retryDelay, setRetryDelay] = useState(500); // Initial delay of 500ms

  // Get the logged user's wallet address from local storage
  const loggedUserWalletAddress = localStorage.getItem('walletAddress');

  const fetchUsers = async (retry = 0) => {
    try {
      const cachedUsers = localStorage.getItem('cachedUsers');
      const cacheTimestamp = localStorage.getItem('cacheTimestamp');
      const cacheExpiration = 1000 * 60 * 10; // 10 minutes
      const isCacheValid = cacheTimestamp && (Date.now() - cacheTimestamp < cacheExpiration);

      if (cachedUsers && isCacheValid) {
        console.log("Loading users from cache");
        setUsers(JSON.parse(cachedUsers));
      } else {
        console.log("Fetching users from backend");
        const usersData = await getSearchUsersInfo();

        const usersWithDetails = await Promise.all(usersData.map(async (user) => {
          try {
            const tokenBalance = await getTokenBalance(user.walletAddress, 'ENzvUvbTVoyRXxEya33jhTNqqou8mot5os2WNh7ptVPW');
            const pinataData = await fetchUserDataFromPinata(user.additionalData);

            console.log("image: " + pinataData.profileImage);
            const profilePictureUrl = pinataData.profileImage;

            const isFollowing = pinataData.following 
              ? pinataData.following.includes(loggedUserWalletAddress) 
              : false;

            return {
              username: user.username,
              walletAddress: user.walletAddress,
              tokenBalance: tokenBalance,
              profilePictureUrl: profilePictureUrl,
              isFollowing: isFollowing
            };
          } catch (error) {
            console.error(`Error fetching user data for wallet ${user.walletAddress}:`, error);
            return {
              username: user.username,
              additionalData: user.additionalData,
              walletAddress: user.walletAddress,
              tokenBalance: 0,
              profilePictureUrl: defaultProfilePic,
              isFollowing: false
            };
          }
        }));

        console.log("Fetched users data with details:", usersWithDetails);
        setUsers(usersWithDetails);
        // Store data in localStorage with a timestamp
        localStorage.setItem('cachedUsers', JSON.stringify(usersWithDetails));
        localStorage.setItem('cacheTimestamp', Date.now());
      }
    } catch (error) {
      if (error.response && error.response.status === 429) {
        console.error(`Error 429: Too Many Requests. Retrying after ${retryDelay}ms...`);
        setTimeout(() => fetchUsers(retry + 1), retryDelay);
        setRetryDelay(retryDelay * 2); // Exponential backoff
      } else {
        console.error('Error fetching users:', error);
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserClick = (walletAddress) => {
    console.log("Navigating to user profile with wallet address:", walletAddress);
    navigate(`/profile/${walletAddress}`);
  };

  const handleFollowClick = (e, walletAddress, isFollowing) => {
    e.stopPropagation(); // Stop the event from bubbling up to the li element
    if (isFollowing) {
      console.log("Unfollowing user with wallet address:", walletAddress);
      // Add logic to unfollow the user
    } else {
      console.log("Following user with wallet address:", walletAddress);
      // Add logic to follow the user
    }
  };

  return (
    <div className="p-4">
      <ul>
        {users.map((user, index) => {
          console.log("User data:", user);

          // Hide the button if the user's wallet address matches the logged-in user's wallet address
          const showFollowButton = user.walletAddress !== loggedUserWalletAddress;

          return (
            <li 
              key={index} 
              className="grid grid-cols-[auto_1fr_auto] items-center gap-4 my-4 cursor-pointer"
              onClick={() => handleUserClick(user.walletAddress)} 
            >
              <ThematicImage className="">
                <img 
                  src={user.profilePictureUrl} 
                  alt={`${user.username}'s profile`} 
                  className="w-12 h-12 object-cover rounded-full"
                />
              </ThematicImage>
              <div className="">
                <div className="font-bold text-white">{user.username}</div>
                <div className="flex items-center text-white mt-1">
                  <img src={nocenixIcon} alt="Nocenix Token" className="w-5 h-5 mr-2" />
                  {user.tokenBalance}
                </div>
              </div>
              {showFollowButton && (
                <div 
                  onClick={(e) => {
                    console.log("Button container clicked");
                    e.stopPropagation();
                    handleFollowClick(e, user.walletAddress, user.isFollowing)
                  }}
                >
                  {user.isFollowing ? (
                    <SecondaryButton 
                      text="Following" 
                      className="px-4 py-2" 
                      onClick={(e) => handleFollowClick(e, user.walletAddress, user.isFollowing)} 
                    />
                  ) : (
                    <PrimaryButton 
                      text="Follow" 
                      className="px-4 py-2" 
                      onClick={(e) => handleFollowClick(e, user.walletAddress, user.isFollowing)} 
                    />
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SearchBody;
