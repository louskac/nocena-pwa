import React, { useState, useEffect } from 'react';
import { useNavigate, Route, Routes, useLocation } from 'react-router-dom';
import HomeBody from '../views/HomeBody';
import MapBody from '../views/MapBody';
import ChallengesBody from '../views/ChallengesBody';
import SearchBody from '../views/SearchBody';
import ProfileBody from '../views/ProfileBody';
import CompletingBody from '../views/CompletingBody';
import Menu from './Menu';
import ThematicIcon from '../widgets/ThematicIcon';
import ThematicText from '../widgets/ThematicText';
import OtherProfileBody from '../views/OtherProfileBody';
import CreateChallengeBody from '../views/CreateChallengeBody';

const AppLayout = ({ user, handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    // Determine the current index based on the path
    if (location.pathname.startsWith('/home')) {
      setCurrentIndex(0);
    } else if (location.pathname.startsWith('/map')) {
      setCurrentIndex(1);
    } else if (location.pathname.startsWith('/challenges')) {
      setCurrentIndex(2);
    } else if (location.pathname.startsWith('/search')) {
      setCurrentIndex(3);
    } else if (location.pathname === '/profile') {
      setCurrentIndex(4);
    } else if (location.pathname === '/completing') {
      setCurrentIndex(5);
    } else if (location.pathname.startsWith('/profile/')) {
      setCurrentIndex(6);
    } else if (location.pathname.startsWith('/createchallenge')) {
        setCurrentIndex(7);
    } else {
      setCurrentIndex(0);
    }

    const storedWalletAddress = localStorage.getItem('walletAddress');
    if (storedWalletAddress) {
      setWalletAddress(storedWalletAddress);
    }
  }, [location]);

  const handleNavClick = (index) => {
    setCurrentIndex(index);

    switch (index) {
      case 0:
        navigate('/home');
        break;
      case 1:
        navigate('/map');
        break;
      case 2:
        navigate('/challenges');
        break;
      case 3:
        navigate('/search');
        break;
      case 4:
        navigate('/profile');
        break;
      default:
        navigate('/home');
    }
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const handleConnectWallet = async () => {
    try {
      const { solana } = window;
      if (solana && solana.isPhantom) {
        const response = await solana.connect();
        const walletAddress = response.publicKey.toString();
        setWalletAddress(walletAddress);
        localStorage.setItem('walletAddress', walletAddress);
      } else {
        alert('Solana wallet not found! Get a Phantom Wallet 👻');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getPageTitle = () => {
    switch (currentIndex) {
      case 0:
        return 'HOME';
      case 1:
        return 'MAP';
      case 2:
        return 'CHALLENGES';
      case 3:
        return 'SEARCH';
      case 4:
        return 'PROFILE';
      case 5:
        return 'COMPLETING CHALLENGE';
      case 6:
        return 'USER PROFILE';
      case 7:
        return 'CREATE CHALLENGE';
      default:
        return 'HOME';
    }
  };

  return (
    <div className="app-container bg-primary-bg min-h-screen w-full text-white">
      <div className="navbar-top flex justify-between items-center px-3 py-2 fixed top-0 left-0 right-0 z-50 bg-primary-bg">
        <div className="flex items-center">
          <button onClick={handleMenuToggle} className="p-0">
            <ThematicIcon iconName="menu" isActive={isMenuOpen} />
          </button>
        </div>
        <div className="flex-grow text-center">
          <ThematicText text={getPageTitle()} isActive />
        </div>
        <div className="flex items-center">
          <button onClick={() => handleNavClick(4)} className="p-0">
            <ThematicIcon iconName="profile" isActive={currentIndex === 4} />
          </button>
        </div>
      </div>
      <Menu
        isOpen={isMenuOpen}
        onClose={handleMenuClose}
        onConnectWallet={handleConnectWallet}
        walletAddress={walletAddress}
        onLogout={handleLogout}
      />
      <div className="flex-grow mt-12 pt-3">
        <Routes>
          <Route path="/home" element={<HomeBody />} />
          <Route path="/map" element={<MapBody />} />
          <Route path="/challenges" element={<ChallengesBody />} />
          <Route path="/createchallenge" element={<CreateChallengeBody />} />
          <Route path="/search" element={<SearchBody />} />
          <Route path="/profile" element={<ProfileBody user={user} walletAddress={walletAddress} />} />
          <Route path="/completing" element={<CompletingBody />} />
          <Route path="/" element={<HomeBody />} />
          <Route path="/profile/:walletAddress" element={<OtherProfileBody />} />
        </Routes>
      </div>
      <div className="navbar-bottom fixed bottom-0 left-0 right-0 py-4 flex justify-around bg-primary-bg z-50">
        <button onClick={() => handleNavClick(0)} className="text-center flex-grow text-white">
          <ThematicIcon iconName="home" isActive={currentIndex === 0} />
          <div className="mt-1">Home</div>
        </button>
        <button onClick={() => handleNavClick(1)} className="text-center flex-grow text-white">
          <ThematicIcon iconName="map" isActive={currentIndex === 1} />
          <div className="mt-1">Map</div>
        </button>
        <button onClick={() => handleNavClick(2)} className="text-center flex-grow text-white">
          <ThematicIcon iconName="challenges" isActive={currentIndex === 2} />
          <div className="mt-1">Challenges</div>
        </button>
        <button onClick={() => handleNavClick(3)} className="text-center flex-grow text-white">
          <ThematicIcon iconName="search" isActive={currentIndex === 3} />
          <div className="mt-1">Search</div>
        </button>
      </div>
    </div>
  );
};

export default AppLayout;
