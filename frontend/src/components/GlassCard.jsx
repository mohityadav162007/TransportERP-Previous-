import { motion } from 'framer-motion';


const GlassCard = ({
    children,
    className,
    interactive = false,
    onClick,
    layoutId,
    ...messageProps
}) => {
    return (
        <motion.div
            className={`glass-panel ${interactive ? 'glass-panel-interactive' : ''} ${className || ''}`}
            onClick={onClick}
            style={{ padding: '24px' }}
            layoutId={layoutId} // Key for continuity transition
            {...messageProps}
        >
            {children}
        </motion.div>
    );
};

export default GlassCard;
