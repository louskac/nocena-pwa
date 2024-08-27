// src/widgets/PrimaryButton.js

import React from 'react';
import styled from 'styled-components';

const ButtonContainer = styled.div`
  width: 100%;
  height: 48px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledButton = styled.button`
  width: 100%;
  height: 100%;
  border: 0.5px solid;
  border-radius: 15px;
  background: transparent;
  color: white;
  font-size: 16px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:focus {
    outline: white solid 0.5px;
  }
`;

const SecondaryButton = ({ text, onPressed }) => {
  return (
    <ButtonContainer>
      <StyledButton onClick={onPressed} className='px-8'>
        {text}
      </StyledButton>
    </ButtonContainer>
  );
};

export default SecondaryButton;
