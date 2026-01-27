import { motion } from 'framer-motion';
import { FADE_IN_VARIANTS } from '../styles/animations';

const GlassCard = ({
    children,
    className,
    interactive = false,
    onClick,
    initial = "hidden",
    animate = "visible",
    variants = FADE_IN_VARIANTS,
    ...messageProps
}) => {
    return (
        <motion.div
            className={`glass-panel ${interactive ? 'glass-panel-interactive' : ''} ${className || ''}`}
            onClick={onClick}
            style={{ padding: '24px' }}
            initial={initial}
            animate={animate}
            variants={variants}
            {...messageProps}
        >
            {children}
        </motion.div>
    );
};

export default GlassCard;
