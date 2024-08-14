import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSearchUsersInfo } from '../utils/Solana';
import defaultProfilePic from '../assets/profile.png';
import ThematicImage from '../widgets/ThematicImage';
import PrimaryButton from '../widgets/PrimaryButton';
import nocenixIcon from '../assets/icons/nocenix.ico';

const SearchBody = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
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
          console.log("Fetched users data:", usersData);
          setUsers(usersData);
          // Store data in localStorage with a timestamp
          localStorage.setItem('cachedUsers', JSON.stringify(usersData));
          localStorage.setItem('cacheTimestamp', Date.now());
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
  
    fetchUsers();
  }, []);

  const handleUserClick = (walletAddress) => {
    console.log("Navigating to user profile with wallet address:", walletAddress);
    navigate(`/profile/${walletAddress}`);
  };

  const handleFollowClick = (e, walletAddress) => {
    e.stopPropagation(); // Stop the event from bubbling up to the li element
    console.log("Following user with wallet address:", walletAddress);
  };

  return (
    <div className="p-4">
      <ul>
        {users.map((user, index) => {
          console.log("User data:", user);
          return (
            <li 
              key={index} 
              className="grid grid-cols-[auto_1fr_auto] items-center gap-4 my-4 cursor-pointer"
              onClick={() => handleUserClick(user.walletAddress)} 
            >
              <ThematicImage className="">
                <img 
                  src={user.profilePictureUrl || defaultProfilePic} 
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
              <div 
                onClick={(e) => {
                  console.log("Button container clicked");
                  e.stopPropagation();
                  handleFollowClick(e, user.walletAddress)
                }}
              >
                <PrimaryButton 
                  text="Follow" 
                  className="px-4 py-2" 
                  onClick={(e) => handleFollowClick(e, user.walletAddress)} 
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SearchBody;