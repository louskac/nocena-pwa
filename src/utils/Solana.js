// src/utils/solana.js

const {
  Connection,
  Keypair,
} = require('@solana/web3.js');

// Initialize Solana connection
// Use a different endpoint if necessary
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Generate a new keypair
const generateKeypair = () => {
  return Keypair.generate();
};

const getTokenBalance = () => {
  return 100;
}

module.exports = {
  generateKeypair,
  getTokenBalance
};
