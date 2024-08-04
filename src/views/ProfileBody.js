import React, { useEffect, useState } from 'react';
import { getTokenBalance } from '../utils/Solana';
import nocenixIcon from '../assets/icons/nocenix.ico';

const ProfileBody = ({ user, walletAddress }) => {
  console.log(walletAddress);
  const [tokenBalance, setTokenBalance] = useState(0);

  useEffect(() => {
    if (walletAddress) {
      const fetchTokenBalance = async () => {
        try {
          const balance = await getTokenBalance(walletAddress, 'ENzvUvbTVoyRXxEya33jhTNqqou8mot5os2WNh7ptVPW'); // Replace with your token mint address
          setTokenBalance(balance);
        } catch (error) {
          console.error('Error fetching token balance:', error);
        }
      };

      fetchTokenBalance();
    }
  }, [walletAddress]);

  return (
    <div>
      <h2>Profile Page</h2>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Wallet:</strong> {walletAddress ? walletAddress : 'Not connected'}</p>
      {walletAddress && (
        <p>
          <strong>Nocenix Balance:</strong>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <img src={nocenixIcon} alt="Nocenix Token" width={36} height={36} />
            {tokenBalance}
          </span>
        </p>
      )}
    </div>
  );
};

export default ProfileBody;
