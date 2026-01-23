import React from 'react';
import styled from 'styled-components';

const GlassCard = ({
    children,
    className,
    interactive = false,
    onClick
}) => {
    return (
        <div
            className={`glass-panel ${interactive ? 'glass-panel-interactive' : ''} ${className || ''}`}
            onClick={onClick}
            style={{ padding: '24px' }} // Default comfortable padding
        >
            {children}
        </div>
    );
};

export default GlassCard;
