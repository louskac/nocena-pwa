const { Connection, Keypair, PublicKey } = require('@solana/web3.js');

// Initialize Solana connection
// Use a different endpoint if necessary
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Generate a new keypair
const generateKeypair = () => {
    return Keypair.generate();
};

const getTokenBalance = async (walletAddress, tokenMint) => {
  try {
      const ownerAddress = new PublicKey(walletAddress);
      const mintPublicKey = new PublicKey(tokenMint);

      const parsedTokenAccounts = await connection.getParsedTokenAccountsByOwner(
          ownerAddress,
          { mint: mintPublicKey }
      );

      let balance = 0;

      if (parsedTokenAccounts.value && parsedTokenAccounts.value.length > 0) {
          // Find the token account that matches both the owner and the mint
          const tokenAccount = parsedTokenAccounts.value.find(account => {
              return account.account.data.parsed.info.mint.toString() === mintPublicKey.toString();
          });

          if (tokenAccount) {
              // Retrieve the actual balance from the token account
              const tokenAmountInfo = tokenAccount.account.data.parsed.info.tokenAmount;
              balance = parseInt(tokenAmountInfo.amount) / Math.pow(10, tokenAmountInfo.decimals);
          }
      }

      return balance;
  } catch (error) {
      console.error('Error fetching token balance:', error);
      return 0; // Return 0 in case of an error
  }
};

module.exports = {
    generateKeypair,
    getTokenBalance
};
