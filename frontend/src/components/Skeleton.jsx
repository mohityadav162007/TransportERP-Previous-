import React from 'react';
import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const SkeletonBase = styled.div`
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 25%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite linear;
  border-radius: ${props => props.circle ? '50%' : '8px'};
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '20px'};
  margin-bottom: ${props => props.mb || '0'};
`;

const Skeleton = ({ width, height, circle, className, count = 1, style }) => {
    if (count > 1) {
        return (
            <div className={className} style={style}>
                {[...Array(count)].map((_, i) => (
                    <SkeletonBase
                        key={i}
                        width={width}
                        height={height}
                        circle={circle}
                        mb="8px"
                    />
                ))}
            </div>
        );
    }

    return (
        <SkeletonBase
            width={width}
            height={height}
            circle={circle}
            className={className}
            style={style}
        />
    );
};

export default Skeleton;
