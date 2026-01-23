import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';
import styled from 'styled-components';

const StatusBar = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <BarContainer>
            <LeftSection>
                <TimeText>
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </TimeText>
            </LeftSection>

            <RightSection>
                <StatusIcon>
                    <Signal size={14} strokeWidth={2.5} />
                </StatusIcon>
                <StatusIcon>
                    <Wifi size={16} strokeWidth={2.5} />
                </StatusIcon>
                <StatusIcon>
                    <Battery size={18} strokeWidth={2.5} />
                </StatusIcon>
            </RightSection>
        </BarContainer>
    );
};

const BarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 44px;
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 50;
  /* Glass effect handled by parent or transparent blend */
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  user-select: none;
`;

const LeftSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;

const TimeText = styled.span`
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.5px;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StatusIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default StatusBar;
