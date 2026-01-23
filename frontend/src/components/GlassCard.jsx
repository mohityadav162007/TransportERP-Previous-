import { motion } from 'framer-motion';
import { FADE_IN_VARIANTS } from '../styles/animations';

const GlassCard = ({
    children,
    className,
    interactive = false,
    onClick,
    ...messageProps // Pass through other props like variants, initial, animate
}) => {
    return (
        <motion.div
            className={`glass-panel ${interactive ? 'glass-panel-interactive' : ''} ${className || ''}`}
            onClick={onClick}
            style={{ padding: '24px' }}
            initial="hidden"
            animate="visible"
            variants={FADE_IN_VARIANTS}
            {...messageProps}
        >
            {children}
        </motion.div>
    );
};

export default GlassCard;
