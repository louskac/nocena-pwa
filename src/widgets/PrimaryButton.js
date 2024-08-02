// src/widgets/PrimaryButton.js

import React from 'react';
import styled from 'styled-components';

const ButtonContainer = styled.div`
  width: 100%; // Make it take full width
  height: 45px;
  border-radius: 15px; // More rounded corners
  background: linear-gradient(90deg, #10CAFF 0%, #FD4EF5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledButton = styled.button`
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 15px; // More rounded corners
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
    outline: none;
  }
`;

const PrimaryButton = ({ text, onPressed }) => {
  return (
    <ButtonContainer>
      <StyledButton onClick={onPressed}>
        {text}
      </StyledButton>
    </ButtonContainer>
  );
};

export default PrimaryButton;
