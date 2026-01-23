import React, { useEffect } from 'react';
import styled from 'styled-components';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const GlassModal = ({ isOpen, onClose, title, children, maxWidth = '600px' }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <Overlay onClick={onClose}>
            <ModalContainer
                className="glass-modal fade-in"
                maxWidth={maxWidth}
                onClick={(e) => e.stopPropagation()}
            >
                <Header>
                    <Title>{title}</Title>
                    <CloseButton onClick={onClose}>
                        <X size={20} />
                    </CloseButton>
                </Header>
                <Content>
                    {children}
                </Content>
            </ModalContainer>
        </Overlay>,
        document.getElementById('root') || document.body
    );
};

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.3s ease;
`;

const ModalContainer = styled.div`
  width: 100%;
  max-width: ${props => props.maxWidth};
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const Header = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-glass);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: white;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

const Content = styled.div`
  padding: 24px;
  overflow-y: auto;
`;

export default GlassModal;
