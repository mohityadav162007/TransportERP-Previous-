import React from 'react';
import { motion } from 'framer-motion';
import { PAGE_VARIANTS, PAGE_TRANSITION } from '../styles/animations';

export default function PageTransition({ children, className = "" }) {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={PAGE_VARIANTS}
            transition={PAGE_TRANSITION}
            className={`w-full h-full ${className}`}
        >
            {children}
        </motion.div>
    );
}
