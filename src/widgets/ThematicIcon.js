import React from 'react';
import PropTypes from 'prop-types';

import homeIconWhite from '../assets/icons/home.svg';
import homeIconPink from '../assets/icons/home-pink.svg';
import homeIconBlue from '../assets/icons/home-blue.svg';
import mapIconWhite from '../assets/icons/map.svg';
import mapIconPink from '../assets/icons/map-pink.svg';
import mapIconBlue from '../assets/icons/map-blue.svg';
import challengesIconWhite from '../assets/icons/challenges.svg';
import challengesIconPink from '../assets/icons/challenges-pink.svg';
import challengesIconBlue from '../assets/icons/challenges-blue.svg';
import searchIconWhite from '../assets/icons/search.svg';
import searchIconPink from '../assets/icons/search-pink.svg';
import searchIconBlue from '../assets/icons/search-blue.svg';
import profileIconWhite from '../assets/icons/profile.svg';
import profileIconPink from '../assets/icons/profile-pink.svg';
import profileIconBlue from '../assets/icons/profile-blue.svg';
import menuIconWhite from '../assets/icons/menu.svg';
import menuIconPink from '../assets/icons/menu-pink.svg';
import menuIconBlue from '../assets/icons/menu-blue.svg';
import penIconWhite from '../assets/icons/pen.svg';
import penIconPink from '../assets/icons/pen-pink.svg';
import penIconBlue from '../assets/icons/pen-blue.svg';

const iconMap = {
  home: {
    white: homeIconWhite,
    pink: homeIconPink,
    blue: homeIconBlue,
  },
  map: {
    white: mapIconWhite,
    pink: mapIconPink,
    blue: mapIconBlue,
  },
  challenges: {
    white: challengesIconWhite,
    pink: challengesIconPink,
    blue: challengesIconBlue,
  },
  search: {
    white: searchIconWhite,
    pink: searchIconPink,
    blue: searchIconBlue,
  },
  profile: {
    white: profileIconWhite,
    pink: profileIconPink,
    blue: profileIconBlue,
  },
  menu: {
    white: menuIconWhite,
    pink: menuIconPink,
    blue: menuIconBlue,
  },
  pen: {
    white: penIconWhite,
    pink: penIconPink,
    blue: penIconBlue,
  },
};

const ThematicIcon = ({ iconName, isActive }) => {
  const primaryIcon = isActive ? iconMap[iconName].white : iconMap[iconName].white;
  const secondaryIcon = iconMap[iconName].pink;
  const tertiaryIcon = iconMap[iconName].blue;

  return (
    <div className="relative flex items-center justify-center">
      {isActive && (
        <>
          <img
            src={secondaryIcon}
            alt={`${iconName}-pink`}
            className="absolute"
            style={{ top: '-4px', position: 'absolute' }}
          />
          <img
            src={tertiaryIcon}
            alt={`${iconName}-blue`}
            className="absolute"
            style={{ top: '4px', position: 'absolute' }}
          />
        </>
      )}
      <img
        src={primaryIcon}
        alt={iconName}
        className={isActive ? '' : 'opacity-100'}
        style={{ position: 'relative' }}
      />
    </div>
  );
};

ThematicIcon.propTypes = {
  iconName: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
};

ThematicIcon.defaultProps = {
  isActive: false,
};

export default ThematicIcon;
