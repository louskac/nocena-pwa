import { v4 as uuidv4 } from 'uuid';
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

export const pinataCreateUserData = async (walletAddress, profileImage, bio, following, followers, challenges, completed_challenges) => {
  const userData = {
    profileImage: profileImage,
    bio: bio,
    following: following,
    followers: followers,
    challenges: [],
    completed_challenges: [],
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

export const pinataUpdateProfileImage = async (pinataCID, file) => {
  try {
    // Step 1: Upload the profile image to Pinata
    const data = new FormData();
    data.append("file", file);

    const uploadResponse = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${JWT}`,
        "Cache-Control": "no-cache",
      },
      body: data,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload image to Pinata: ${uploadResponse.statusText}`);
    }

    const uploadResult = await uploadResponse.json();
    const profileImageHash = uploadResult.IpfsHash;
    console.log(`Profile image uploaded successfully:`, profileImageHash);

    // Step 2: Fetch the existing user data from Pinata
    const userData = await fetchUserDataFromPinata(pinataCID);
    const oldCID = pinataCID;

    // Step 3: Update the profileImage field with the new IPFS hash
    userData.profileImage = `https://gateway.pinata.cloud/ipfs/${profileImageHash}`;

    // Step 4: Serialize and upload the updated user data back to Pinata
    const jsonBlob = new Blob([JSON.stringify(userData)], { type: "application/json" });
    const updatedFile = new File([jsonBlob], `${pinataCID}.json`);

    const updateData = new FormData();
    updateData.append("file", updatedFile);

    const updateResponse = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${JWT}`,
        "Cache-Control": "no-cache",
      },
      body: updateData,
    });

    if (!updateResponse.ok) {
      console.error(`Error updating profile image for CID ${pinataCID}: ${updateResponse.statusText}`);
      throw new Error(`HTTP error! status: ${updateResponse.status}`);
    }

    const updateResult = await updateResponse.json();
    console.log(`Profile image updated successfully for CID ${pinataCID}:`, updateResult);

    // Step 5: Unpin the old profile image file
    await unpinOldFile(oldCID);

    return updateResult.IpfsHash; // Return the new IPFS hash of the updated user data

  } catch (error) {
    console.error('Error updating profile image and user data:', error);
    throw error;
  }
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

    await unpinOldFile(pinataCID);
    return result.IpfsHash; // Return the new IPFS hash
  } catch (error) {
    console.error(`Failed to update bio for CID ${pinataCID}:`, error);
  }
};

export const pinataAddChallenge = async (pinataCID, newChallenge) => {
  try {
    // Fetch the existing user data from Pinata using the CID
    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${pinataCID}`);
    if (!response.ok) {
      throw new Error('Failed to fetch existing user data');
    }
    const userData = await response.json();
    console.log("Fetched user data:", userData);

    // Add the new challenge to the challenges array
    userData.challenges.push(newChallenge);

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
      console.error(`Error updating challenges for CID ${pinataCID}: ${uploadResponse.statusText}`);
      throw new Error(`HTTP error! status: ${uploadResponse.status}`);
    }

    const result = await uploadResponse.json();
    console.log(`Challenge added successfully for CID ${pinataCID}:`, result);

    await unpinOldFile(pinataCID);
    return result.IpfsHash; // Return the new IPFS hash with the updated challenges
  } catch (error) {
    console.error(`Failed to add challenge for CID ${pinataCID}:`, error);
    throw error;
  }
};

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

export const uploadDailyChallengeMedia = async (walletAddress, frontImageBlob, backImageBlob) => {
  try {
    // Generate unique identifiers for each file
    const uniqueId = uuidv4();
    const date = new Date().toISOString().split('T')[0]; // Save the date as YYYY-MM-DD

    // Step 1: Upload the front image to Pinata
    const frontImageCID = await uploadImageToPinata(frontImageBlob, `${walletAddress}_front_${date}_${uniqueId}.png`);
    
    // Step 2: Upload the back image to Pinata
    const backImageCID = await uploadImageToPinata(backImageBlob, `${walletAddress}_back_${date}_${uniqueId}.png`);

    // Step 3: Prepare the data structure to save daily challenge information
    const dailyChallengeData = {
      walletAddress: walletAddress,
      date: date, // Date in YYYY-MM-DD format
      frontImageCID: frontImageCID,
      backImageCID: backImageCID,
      uniqueId: uniqueId, // Add unique ID for reference
    };

    // Step 4: Convert the daily challenge data to a Blob (for FormData)
    const jsonBlob = new Blob([JSON.stringify(dailyChallengeData)], { type: "application/json" });
    const fileName = `${walletAddress}_daily_challenge_${date}_${uniqueId}.json`;
    const file = new File([jsonBlob], fileName);

    // Step 5: Upload the JSON file to Pinata
    const jsonCID = await uploadFileToPinata(file);

    console.log(`Daily challenge data uploaded successfully for wallet ${walletAddress}:`, jsonCID);
    return jsonCID;

  } catch (error) {
    console.error('Error uploading daily challenge media:', error);
    throw error;
  }
};

// Helper function to upload an image to Pinata
const uploadImageToPinata = async (imageBlob, fileName) => {
  const data = new FormData();
  data.append("file", new File([imageBlob], fileName));

  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${JWT}`,
      "Cache-Control": "no-cache",
    },
    body: data,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload image to Pinata: ${response.statusText}`);
  }

  const result = await response.json();
  console.log(`Image uploaded successfully:`, result.IpfsHash);
  return result.IpfsHash; // Return the CID of the uploaded image
};

// Helper function to upload a file (JSON) to Pinata
const uploadFileToPinata = async (file) => {
  const data = new FormData();
  data.append("file", file);

  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${JWT}`,
      "Cache-Control": "no-cache",
    },
    body: data,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload file to Pinata: ${response.statusText}`);
  }

  const result = await response.json();
  console.log(`File uploaded successfully:`, result.IpfsHash);
  return result.IpfsHash; // Return the CID of the uploaded JSON file
};