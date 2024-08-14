import React from 'react';

const ThematicImage = ({ children }) => {
  return (
    <div className="relative inline-block">
      <div className="absolute inset-0 border-[1px] border-primary-pink rounded-full transform translate-y-[-3px] z-10"></div>
      <div className="absolute inset-0 border-[1px] border-primary-blue rounded-full transform translate-y-[3px] z-10"></div>
      <div className="relative rounded-full border-[1px] border-white">
        {children}
      </div>
    </div>
  );
};

export default ThematicImage;