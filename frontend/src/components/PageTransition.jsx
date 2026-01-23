import React from 'react';
import { motion } from 'framer-motion';
import { PAGE_VARIANTS, PAGE_TRANSITION } from '../styles/animations';

export default function PageTransition({ children, className = "" }) {
    return (
        <div style={{ perspective: '1200px', width: '100%', height: '100%' }}>
            <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={PAGE_VARIANTS}
                transition={PAGE_TRANSITION}
                className={`w-full h-full ${className}`}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {children}
            </motion.div>
        </div>
    );
}
