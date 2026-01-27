import React, { createContext, useContext, useState } from 'react';

const TransitionContext = createContext();

export function TransitionProvider({ children }) {
    // direction: 'forward' | 'backward'
    // type: 'default' | 'card' | 'stack' | 'modal'
    const [transitionState, setTransitionState] = useState({
        direction: 'forward',
        type: 'default'
    });

    const setDirection = (direction) => {
        setTransitionState(prev => ({ ...prev, direction }));
    };

    const setType = (type) => {
        setTransitionState(prev => ({ ...prev, type }));
    };

    const resetTransition = () => {
        setTransitionState({ direction: 'forward', type: 'default' });
    };

    return (
        <TransitionContext.Provider value={{ transitionState, setDirection, setType, resetTransition }}>
            {children}
        </TransitionContext.Provider>
    );
}

export function useTransition() {
    return useContext(TransitionContext);
}
