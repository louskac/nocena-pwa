// src/utils/solana.js

const {
  Connection,
  PublicKey,
  clusterApiUrl,
  Keypair,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  TransactionInstruction
} = require('@solana/web3.js');

// Initialize Solana connection
// Use a different endpoint if necessary
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Generate a new keypair
const generateKeypair = () => {
  return Keypair.generate();
};

// Get balance of a public key
const getBalance = async (publicKey) => {
  const balance = await connection.getBalance(new PublicKey(publicKey));
  return balance / LAMPORTS_PER_SOL; // Convert lamports to SOL
};

// Create and send a transaction
const sendTransaction = async (transaction, signers) => {
  const { blockhash } = await connection.getRecentBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = signers[0].publicKey;
  
  const signedTransaction = await signers[0].signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signedTransaction.serialize());
  await connection.confirmTransaction(signature);
};

// Generate a new Keypair for the account to store the challenges
const challengeAccount = Keypair.generate();

const storeChallengesOnSolana = async (challenges, walletAddress) => {
  const challengesData = {
    challenges,
    walletAddress,
  };

  const challengesString = JSON.stringify(challengesData);
  const challengesBuffer = Buffer.from(challengesString);

  const airdropSignature = await connection.requestAirdrop(
    challengeAccount.publicKey,
    2 * LAMPORTS_PER_SOL
  );

  await connection.confirmTransaction(airdropSignature);

  const transaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: challengeAccount.publicKey,
      newAccountPubkey: challengeAccount.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(challengesBuffer.length),
      space: challengesBuffer.length,
      programId: SystemProgram.programId,
    }),
    new TransactionInstruction({
      keys: [{ pubkey: challengeAccount.publicKey, isSigner: true, isWritable: true }],
      programId: SystemProgram.programId,
      data: challengesBuffer,
    })
  );

  const signature = await connection.sendTransaction(transaction, [challengeAccount]);
  await connection.confirmTransaction(signature);

  return challengeAccount.publicKey.toBase58();
};

module.exports = {
  generateKeypair,
  getBalance,
  sendTransaction,
  storeChallengesOnSolana,
};
