// src/widgets/ThematicText.js

import React from 'react';
import PropTypes from 'prop-types';

const ThematicText = ({ text, isActive }) => {
  const primaryStyle = 'text-white';
  const secondaryStyle = 'text-[#FD4EF5] absolute';
  const tertiaryStyle = 'text-[#10CAFF] absolute';

  return (
    <div className="relative inline-block">
      {isActive && (
        <>
          <span
            className={`${secondaryStyle}`}
            style={{ top: '-2px', position: 'absolute', left: '0' }}
          >
            {text}
          </span>
          <span
            className={`${tertiaryStyle}`}
            style={{ top: '2px', position: 'absolute', left: '0' }}
          >
            {text}
          </span>
        </>
      )}
      <span className={`${primaryStyle}`} style={{ position: 'relative' }}>
        {text}
      </span>
    </div>
  );
};

ThematicText.propTypes = {
  text: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
};

ThematicText.defaultProps = {
  isActive: false,
};

export default ThematicText;
