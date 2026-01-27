import React from 'react';
import { motion } from 'framer-motion';
import { useTransition } from '../context/TransitionContext';
import { PAGE_VARIANTS, PAGE_TRANSITION, CARD_EXPAND_VARIANTS, STACK_SLIDE_VARIANTS } from '../styles/animations';

export default function PageTransition({ children, className = "" }) {
    const { transitionState } = useTransition();

    const getVariants = () => {
        switch (transitionState.type) {
            case 'card': return CARD_EXPAND_VARIANTS;
            case 'stack': return STACK_SLIDE_VARIANTS;
            default: return PAGE_VARIANTS;
        }
    };

    return (
        <div style={{ perspective: '1200px', width: '100%', height: '100%' }}>
            <motion.div
                custom={transitionState.direction}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={getVariants()}
                className={`w-full h-full ${className}`}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {children}
            </motion.div>
        </div>
    );
}
