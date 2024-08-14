import { 
  Connection, 
  Keypair, 
  PublicKey, 
  SystemProgram, 
  Transaction, 
  TransactionInstruction, 
  sendAndConfirmTransaction
} from '@solana/web3.js';
import * as buffer from 'buffer';
import * as borsh from 'borsh';
import bcrypt from 'bcryptjs';

window.Buffer = buffer.Buffer;

const senderPrivateKeyBytes = Uint8Array.from([
  91,214,66,115,215,20,38,125,62,130,50,46,61,26,31,230,140,35,19,100,111,66,197,31,149,32,230,146,19,143,228,
  103,239,187,40,91,251,36,91,252,32,225,51,9,122,118,173,13,180,88,14,144,138,172,83,197,121,253,137,236,221,5,92,92
]);

// Initialize Solana connection
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const mainAccount = Keypair.fromSecretKey(senderPrivateKeyBytes);

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const USER_INFO_PROGRAM_ID = new PublicKey("6LkspQRnke7w4gnXxGxVzLWDAp9N3FD9i5uY2spCq1Br");
const TOKEN_MINT = new PublicKey("ENzvUvbTVoyRXxEya33jhTNqqou8mot5os2WNh7ptVPW");

class UserInfo {
  constructor(fields = {}) {
    this.username = fields.username || '';
    this.email = fields.email || '';
    this.passwordHash = fields.passwordHash || '';
    this.walletAddress = fields.walletAddress || '';
    this.profilePictureUrl = fields.profilePictureUrl || '';
    this.additionalData = fields.additionalData || '';
    this.bio = fields.bio || ''; // New field for user bio
    this.dailyChallenges = fields.dailyChallenges || Array(365).fill(0); // 365 elements for each day of the year
    this.weeklyChallenges = fields.weeklyChallenges || Array(52).fill(0); // 52 elements for each week of the year
    this.monthlyChallenges = fields.monthlyChallenges || Array(12).fill(0); // 12 elements for each month of the year
    this.public_key = fields.public_key || new Uint8Array(32);
    this.following = fields.following || []; // Array to store following users
    this.followed_by = fields.followed_by || []; // Array to store followed by users
  }
}

const UserInfoSchema = new Map([
  [UserInfo, {
    kind: 'struct',
    fields: [
      ['username', 'string'],
      ['email', 'string'],
      ['passwordHash', 'string'],
      ['walletAddress', 'string'],
      ['profilePictureUrl', 'string'],
      ['additionalData', 'string'],
      ['bio', 'string'], // New field for user bio
      ['dailyChallenges', ['u8']], // 365 days
      ['weeklyChallenges', ['u8']], // 52 weeks
      ['monthlyChallenges', ['u8']], // 12 months
      ['public_key', [32]], // PublicKey as 32 byte array
      ['following', ['array', [32]]], // Array of Pubkeys
      ['followed_by', ['array', [32]]], // Array of Pubkeys
    ],
  }],
]);

export const generateKeypair = () => {
  return Keypair.generate();
};

export const getAirdrop = async (publicKey, amount) => {
  try {
    const airdropSignature = await connection.requestAirdrop(new PublicKey(publicKey), amount * 2); // amount in SOL
    await connection.confirmTransaction(airdropSignature);
    console.log(`Airdropped ${amount} SOL to ${publicKey}`);
  } catch (error) {
    console.error('Airdrop failed:', error);
  }
};

export const storeUserInfo = async (username, email, passwordHash, walletAddress, profilePictureUrl, additionalData, bio, keypair) => {
  const public_key_buffer = keypair.publicKey.toBuffer();

  const userInfo = new UserInfo({ 
    username, 
    email, 
    passwordHash, 
    walletAddress, 
    profilePictureUrl, 
    additionalData,
    bio: bio.substring(0, 256),
    dailyChallenges: Array(365).fill(0), // Initialize for a full year
    weeklyChallenges: Array(52).fill(0), // Initialize for a full year
    monthlyChallenges: Array(12).fill(0), // Initialize for a full year
    public_key: public_key_buffer,
    following: [], // Initialize empty array for following
    followed_by: [] // Initialize empty array for followed by
  });

  const dataBuffer = Buffer.from(borsh.serialize(UserInfoSchema, userInfo));

  const transaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: mainAccount.publicKey,
      newAccountPubkey: keypair.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(dataBuffer.length),
      space: dataBuffer.length, 
      programId: USER_INFO_PROGRAM_ID,
    }),
    new TransactionInstruction({
      keys: [
        { pubkey: keypair.publicKey, isSigner: false, isWritable: true },
      ],
      programId: USER_INFO_PROGRAM_ID,
      data: dataBuffer,
    })
  );

  await sendAndConfirmTransaction(connection, transaction, [mainAccount, keypair]);
  console.log('User info stored successfully');
};

export const getUserInfo = async (username) => {
  console.log("getUserInfo triggered for username: " + username);

  // Find the stored account by iterating over all accounts
  const accounts = await connection.getProgramAccounts(USER_INFO_PROGRAM_ID);

  for (let account of accounts) {
    try {
      const accountInfo = account.account.data;
      const userInfo = borsh.deserialize(UserInfoSchema, UserInfo, accountInfo);
      console.log('All of the user data:', userInfo);

      // Check if the username matches the one stored
      if (userInfo.username === username) {
        console.log('Found User Info with PublicKey:', account.pubkey.toString());

        return userInfo;
      }
    } catch (error) {
      console.error('Error deserializing account data:', error);
    }
  }

  throw new Error('User info not found');
};


export const hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

export const comparePassword = (password, hash) => {
  return bcrypt.compareSync(password, hash);
};

export const getTokenBalance = async (walletAddress, tokenMint, retries = 3) => {
  try {
    const ownerAddress = new PublicKey(walletAddress);
    const mintPublicKey = new PublicKey(tokenMint);

    const parsedTokenAccounts = await connection.getParsedTokenAccountsByOwner(
      ownerAddress,
      { mint: mintPublicKey }
    );

    let balance = 0;

    if (parsedTokenAccounts.value && parsedTokenAccounts.value.length > 0) {
      const tokenAccount = parsedTokenAccounts.value.find(account => {
        return account.account.data.parsed.info.mint.toString() === mintPublicKey.toString();
      });

      if (tokenAccount) {
        const tokenAmountInfo = tokenAccount.account.data.parsed.info.tokenAmount;
        balance = parseInt(tokenAmountInfo.amount) / Math.pow(10, tokenAmountInfo.decimals);
      }
    }

    return balance;
  } catch (error) {
    if (retries > 0) {
      console.warn(`Retrying getTokenBalance due to error: ${error.message}. Retries left: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, 3 - retries)));
      return getTokenBalance(walletAddress, tokenMint, retries - 1);
    } else {
      console.error('Error fetching token balance:', error);
      return 0;
    }
  }
};

const createTransferInstruction = (from, to, owner, amount) => {
  const dataLayout = buffer.Buffer.alloc(8);
  dataLayout.writeBigUInt64LE(BigInt(amount));

  return new TransactionInstruction({
    keys: [
      { pubkey: from, isSigner: false, isWritable: true },
      { pubkey: to, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: false },
    ],
    programId: TOKEN_PROGRAM_ID,
    data: Buffer.concat([Buffer.from([3]), dataLayout]),
  });
};

const getAssociatedTokenAddress = async (mint, owner) => {
  try {
    console.log("Mint PublicKey in getAssociatedTokenAddress:", mint.toBase58());
    console.log("Owner PublicKey in getAssociatedTokenAddress:", owner.toBase58());

    const [address, bumpSeed] = PublicKey.findProgramAddressSync(
      [
        owner.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        mint.toBuffer()
      ],
      new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL") // Associated Token Program ID
    );

    console.log("Derived address:", address.toBase58());
    console.log("Bump seed:", bumpSeed);

    return address;
  } catch (error) {
    console.error("Error in getAssociatedTokenAddress:", error);
    throw error;
  }
};

const createAssociatedTokenAccount = async (connection, payer, mint, owner) => {
  const associatedTokenAddress = await getAssociatedTokenAddress(mint, owner);
  
  const transaction = new Transaction().add(
    new TransactionInstruction({
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
        { pubkey: owner, isSigner: false, isWritable: false },
        { pubkey: mint, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"), isSigner: false, isWritable: false }
      ],
      programId: new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
      data: Buffer.alloc(0)
    })
  );

  await sendAndConfirmTransaction(connection, transaction, [payer]);

  return associatedTokenAddress;
};

export const transferSplToken = async (recipientAddress, tokenMintAddress, amount) => {
  try {
    console.log('Raw recipient address:', recipientAddress);
    console.log('Raw token mint address:', tokenMintAddress);

    const recipientPublicKey = new PublicKey(recipientAddress);
    const mintPublicKey = new PublicKey(tokenMintAddress);

    console.log('Correct Public Keys');
    console.log('Mint Public Key:', mintPublicKey.toBase58());
    console.log('Main Account Public Key:', mainAccount.publicKey.toBase58());

    // Get the main account's associated token account
    const senderTokenAccountPubkey = await getAssociatedTokenAddress(mintPublicKey, mainAccount.publicKey);
    console.log('Sender token account:', senderTokenAccountPubkey.toBase58());

    // Get the recipient's associated token account
    let recipientTokenAccountPubkey = await getAssociatedTokenAddress(mintPublicKey, recipientPublicKey);
    console.log('Recipient token account:', senderTokenAccountPubkey);

    // Check if the recipient's token account exists; if not, create it
    const recipientTokenAccountInfo = await connection.getAccountInfo(recipientTokenAccountPubkey);
    if (recipientTokenAccountInfo === null) {
      console.log('Recipient token account does not exist. Creating one...');
      await createAssociatedTokenAccount(connection, mainAccount, mintPublicKey, recipientPublicKey);
      console.log('Created recipient token account:', recipientTokenAccountPubkey.toBase58());
    }
    console.log("recipentTokenAccountInfo");

    // Create the transfer instruction
    const transferInstruction = createTransferInstruction(
      senderTokenAccountPubkey,
      recipientTokenAccountPubkey,
      mainAccount.publicKey,
      amount * Math.pow(10, 9) // Adjusting for decimals if necessary (assuming 9 decimals)
    );

    // Create the transaction and add the instruction
    const transaction = new Transaction().add(transferInstruction);
    transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
    transaction.sign(mainAccount); // The main account signs the transaction

    // Send and confirm the transaction
    const signature = await sendAndConfirmTransaction(connection, transaction, [mainAccount]);

    console.log(`Transferred ${amount} tokens from main account to ${recipientAddress}. Transaction signature: ${signature}`);
  } catch (error) {
    console.error('Error transferring tokens:', error);
  }
};

export const updateChallengeData = async (walletAddress, challengeType, index) => {
  console.log("updateChallenge triggered");
  try {
    // Retrieve the current user data
    const userData = await getUserInfoWallet(walletAddress);
    const userPublicKey = new PublicKey(userData.public_key); // Corrected to match field name

    console.log("userPublicKey: " + userPublicKey);

    // Update the appropriate challenge data
    if (challengeType === 'daily') {
      console.log("daily");
      userData.dailyChallenges[index] = 1;
      console.log(index);
      console.log(userData.dailyChallenges[index]);
    } else if (challengeType === 'weekly') {
      userData.weeklyChallenges[index] = 1;
    } else if (challengeType === 'monthly') {
      userData.monthlyChallenges[index] = 1;
    }
    console.log("Updated challenge data", userData.dailyChallenges, userData.weeklyChallenges, userData.monthlyChallenges);
    
    // Serialize the updated user data
    const updatedDataBuffer = Buffer.from(borsh.serialize(UserInfoSchema, userData));
    console.log("Serialized updated user data");

    // Create a transaction to update the user data on the blockchain
    const transaction = new Transaction().add(
      new TransactionInstruction({
        keys: [
          { pubkey: userPublicKey, isSigner: false, isWritable: true },
        ],
        programId: USER_INFO_PROGRAM_ID,
        data: updatedDataBuffer,
      })
    );

    console.log('Prepared transaction for updating challenge data');
    await sendAndConfirmTransaction(connection, transaction, [mainAccount]);

    console.log('Challenge data updated successfully');
    
    return userData;
  } catch (error) {
    console.error('Error updating challenge data:', error);
    throw error;
  }
};

export const getUserInfoWallet = async (walletAddress) => {
  console.log("getUserInfoWallet triggered for walletAddress: " + walletAddress);

  // Find the stored account by iterating over all accounts
  const accounts = await connection.getProgramAccounts(USER_INFO_PROGRAM_ID);

  for (let account of accounts) {
    try {
      const accountInfo = account.account.data;
      const userInfo = borsh.deserialize(UserInfoSchema, UserInfo, accountInfo);
      console.log('All of the user data:', userInfo);

      // Check if the username matches the one stored
      if (userInfo.walletAddress === walletAddress) {
        console.log('Found User Info with PublicKey:', account.pubkey.toString());

        return userInfo;
      }
    } catch (error) {
      console.error('Error deserializing account data:', error);
    }
  }

  throw new Error('User info not found');
};

export const getSearchUsersInfo = async () => {
  const accounts = await connection.getProgramAccounts(USER_INFO_PROGRAM_ID);
  const users = [];

  for (let account of accounts) {
    try {
      const accountInfo = account.account.data;
      const userInfo = borsh.deserialize(UserInfoSchema, UserInfo, accountInfo);

      // Get token balance for the user's wallet address
      const tokenBalance = await getTokenBalance(userInfo.walletAddress, TOKEN_MINT);

      users.push({
        username: userInfo.username,
        profilePictureUrl: userInfo.profilePictureUrl,
        walletAddress: userInfo.walletAddress,
        tokenBalance: tokenBalance
      });
    } catch (error) {
      console.error('Error deserializing account data:', error);
    }
  }

  return users;
};