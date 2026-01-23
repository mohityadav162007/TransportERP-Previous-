export const IOS_SPRING = {
    type: "spring",
    stiffness: 260,
    damping: 20,
    mass: 1
};

export const SPRING_GENTLE = {
    type: "spring",
    stiffness: 100,
    damping: 20,
    mass: 1
};

export const PAGE_VARIANTS = {
    initial: {
        opacity: 0,
        scale: 0.96,
        rotateY: 15, // Subtle 3D rotation start
        transformOrigin: "50% 50%"
    },
    animate: {
        opacity: 1,
        scale: 1,
        rotateY: 0,
        transition: {
            duration: 0.5,
            ease: [0.25, 1, 0.5, 1], // Apple-like ease
            type: "spring",
            stiffness: 100,
            damping: 20
        }
    },
    exit: {
        opacity: 0,
        scale: 0.96,
        rotateY: -15, // Rotate out the other way
        transition: {
            duration: 0.4,
            ease: [0.25, 1, 0.5, 1]
        }
    }
};

export const PAGE_TRANSITION = {
    // Transition defined inside variants for cleaner control per-state
};

export const FADE_IN_VARIANTS = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: IOS_SPRING }
};

export const STAGGER_CONTAINER = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

export const LIST_ITEM_VARIANTS = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 24 }
    }
};

export const MODAL_BACKDROP = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
};

export const MODAL_CONTENT = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: IOS_SPRING
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: 10,
        transition: { duration: 0.15 }
    }
};

export const BUTTON_TAP = {
    scale: 0.96,
    transition: { duration: 0.1 }
};
