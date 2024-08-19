const { PublicKey, Transaction, TransactionInstruction } = require('@solana/web3.js');
const { getUserInfoWallet, sendAndConfirmTransaction, connection, USER_INFO_PROGRAM_ID } = require('../Solana');
const { UserInfoSchema } = require('./UserInfo');

const resetUserFollowData = async (walletAddress) => {
  try {
    // Retrieve the user data
    const userData = await getUserInfoWallet(walletAddress);
    const userPublicKey = new PublicKey(userData.public_key);

    console.log('User data before reset:', userData);

    // Reset the 'following' and 'followed_by' arrays
    userData.following = [];
    userData.followed_by = [];

    console.log('User data after reset:', userData);

    // Serialize the reset user data
    const updatedDataBuffer = Buffer.from(borsh.serialize(UserInfoSchema, userData));

    // Create a transaction to update the reset user data on the blockchain
    const transaction = new Transaction().add(
      new TransactionInstruction({
        keys: [{ pubkey: userPublicKey, isSigner: false, isWritable: true }],
        programId: USER_INFO_PROGRAM_ID,
        data: updatedDataBuffer,
      })
    );

    console.log('Prepared transaction for resetting follow data');
    await sendAndConfirmTransaction(connection, transaction, [mainAccount]);

    console.log('User follow data reset successfully for wallet:', walletAddress);
  } catch (error) {
    console.error('Error resetting user follow data:', error);
  }
};

// Replace 'walletAddress' with the actual wallet address of the user you want to reset
const walletAddress = 'YourWalletAddressHere';
resetUserFollowData(walletAddress);
