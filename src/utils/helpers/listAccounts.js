const {
  Connection,
  PublicKey
} = require('@solana/web3.js');

const USER_INFO_PROGRAM_ID = 'AEecXKkhUvPGeXedbJnZrzTtCx5NvwpWdhCjABtDqDYx';
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

const listAccounts = async () => {
  const accounts = await connection.getProgramAccounts(new PublicKey(USER_INFO_PROGRAM_ID));
  accounts.forEach((account, index) => {
      console.log(`Account ${index + 1}: ${account.pubkey.toBase58()}`);
      console.log(`Data: ${account.account.data.toString('hex')}`);
      console.log('---');
  });
};

listAccounts().catch(err => {
  console.error('Error fetching accounts:', err);
});
