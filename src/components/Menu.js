import React from 'react';
import PropTypes from 'prop-types';

const Menu = ({ isOpen, onClose, onConnectWallet, walletAddress }) => {
  return (
    <div className={`fixed top-0 left-0 h-full bg-primary-bg text-white w-[60%] transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-50 overflow-hidden`}>
      <div className="flex justify-end p-4">
        <button onClick={onClose} className="text-2xl">✖</button>
      </div>
      <div className="p-4">
        <div className="mt-4 break-words">
          <span>Wallet: {walletAddress ? walletAddress : 'Not connected'}</span>
        </div>
      </div>
    </div>
  );
};

Menu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConnectWallet: PropTypes.func.isRequired,
  walletAddress: PropTypes.string,
};

export default Menu;
