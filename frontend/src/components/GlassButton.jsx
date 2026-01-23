import React from 'react';
import styled, { css } from 'styled-components';

const GlassButton = ({
    children,
    variant = 'primary',
    onClick,
    className,
    disabled = false,
    type = 'button'
}) => {
    return (
        <StyledButton
            className={`${className || ''} btn-glass-${variant}`}
            onClick={onClick}
            disabled={disabled}
            type={type}
        >
            {children}
        </StyledButton>
    );
};

// While we use global CSS classes for performance and consistency, 
// we can use styled-components for unique positioning or complex states if needed.
// Here we primarily rely on the global classes defined in index.css
const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    filter: grayscale(1);
    transform: none !important;
  }
`;

export default GlassButton;
