const JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI3OWM4NTA0ZS1jZjg1LTQ5NjUtYjZkNC03YzZmOTcxYTU1ZjgiLCJlbWFpbCI6Imx1c3R5a2pha3ViQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJkYjc5NzYwZGRkMWRmYTQ1YmIzYiIsInNjb3BlZEtleVNlY3JldCI6ImI3ZDZlYzljZDY2ZGIxNDM4MWE5NDg3MTc1ZDY2NzBlNTIyYzY5NDQyZjdkYWI0ZGRlMmQ2N2ZlMTkxMzhlOTMiLCJleHAiOjE3NTUyNzYyMTF9.bM4bb57ahwfgJeykCsM0JY8HDYrEYyLkzJrAh4DZnH4";

export const fetchUserDataFromPinata = async (pinataCID) => {
  try {
    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${pinataCID}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user data from Pinata');
    }
    const userData = await response.json();
    console.log("Fetched user data:", userData);
    return userData;
  } catch (error) {
    console.error('Error fetching user data from Pinata:', error);
    throw error;
  }
};

export const pinataCreateUserData = async (walletAddress, profileImage, bio, following, followers) => {
  const userData = {
    profileImage: profileImage,
    bio: bio,
    following: following,
    followers: followers,
    timestamp: new Date().toISOString(), // Unique timestamp to differentiate each JSON
  };

  const jsonBlob = new Blob([JSON.stringify(userData)], { type: "application/json" });
  const file = new File([jsonBlob], `${walletAddress}.json`);
  
  const data = new FormData();
  data.append("file", file);

  const response = await fetch(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${JWT}`,
        "Cache-Control": "no-cache",
      },
      body: data,
    }
  );

  if (!response.ok) {
    console.error(`Error uploading JSON for wallet ${walletAddress}: ${response.statusText}`);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  console.log(`User data uploaded successfully for wallet ${walletAddress}:`, result);
  return result.IpfsHash;
};

export const pinataUpdateUserBio = async (pinataCID, updatedBio) => {
  try {
    // Fetch the existing file from Pinata using the CID
    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${pinataCID}`);
    if (!response.ok) {
      throw new Error('Failed to fetch existing user data');
    }
    const userData = await response.json();
    console.log(userData);

    // Update the bio
    userData.bio = updatedBio;

    // Convert the updated JSON to a Blob (for FormData)
    const jsonBlob = new Blob([JSON.stringify(userData)], { type: "application/json" });
    const file = new File([jsonBlob], `${pinataCID}.json`); // Name the file based on the wallet address or CID

    const data = new FormData();
    data.append("file", file);

    // Upload the updated JSON to Pinata
    const uploadResponse = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${JWT}`,
        "Cache-Control": "no-cache",
      },
      body: data,
    });

    if (!uploadResponse.ok) {
      console.error(`Error updating bio for CID ${pinataCID}: ${uploadResponse.statusText}`);
      throw new Error(`HTTP error! status: ${uploadResponse.status}`);
    }

    const result = await uploadResponse.json();
    console.log(`Bio updated successfully for CID ${pinataCID}:`, result);

    // Optionally, unpin the old CID to remove the old version of the file from Pinata's storage
    await unpinOldFile(pinataCID);

    return result.IpfsHash; // Return the new IPFS hash

  } catch (error) {
    console.error(`Failed to update bio for CID ${pinataCID}:`, error);
  }
};

// Function to unpin the old file (if needed)
const unpinOldFile = async (oldCID) => {
  const unpinResponse = await fetch(`https://api.pinata.cloud/pinning/unpin/${oldCID}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${JWT}`,
    },
  });

  if (!unpinResponse.ok) {
    console.error(`Failed to unpin old CID ${oldCID}: ${unpinResponse.statusText}`);
  } else {
    console.log(`Successfully unpinned old CID ${oldCID}`);
  }
};