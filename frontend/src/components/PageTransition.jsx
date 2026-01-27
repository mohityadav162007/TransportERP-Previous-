import React from 'react';
import { motion } from "framer-motion";
import { PAGE_VARIANTS } from "../styles/animations";

const PageTransition = ({ children }) => {
    return (
        <motion.div
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ width: "100%" }}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
