import React from "react";
import styled from "styled-components";

const GlassBox = ({ children }) => {
  return (
    <StyledWrapper>
      <div className="container">
        <div className="box">
          {children}
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .container .box {
    width: 100%;
    height: 100%;
    padding: 1rem;
    background-color: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.22);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 12px;
    transition: all 0.3s ease;
    color: white;
  }

  .container .box:hover {
    box-shadow: 0 0 20px 1px rgba(0, 0, 0, 0.15);
    border-color: rgba(255, 255, 255, 0.45);
  }
`;

export default GlassBox;
