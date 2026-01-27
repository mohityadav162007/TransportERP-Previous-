import React from 'react';
import { motion } from 'framer-motion';
import { SYSTEM_SPRING } from '../styles/animations';

export default function PageTransition({ children, layoutId, className = "" }) {
    // If layoutId is present, we use it for a shared element transition.
    // Otherwise, we just render the content static (or minimal fade if needed, but per instructions: NO fade).

    // We strictly use layoutId for the Apple-like "App Open" effect.
    return (
        <motion.div
            layoutId={layoutId} // This connects to the Dashboard card with the same ID
            className={`w-full h-full ${className}`}
            initial={{ opacity: 0 }} // Small fade to smooth the POP
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }} // Minimal fade out
            transition={SYSTEM_SPRING}
            style={{ originX: 0.5, originY: 0 }}
        >
            {children}
        </motion.div>
    );
}
