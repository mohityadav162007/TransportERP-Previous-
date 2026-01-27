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

export const SPRING_SMOOTH = {
    type: "spring",
    stiffness: 120,
    damping: 20,
    mass: 1
};

export const PAGE_VARIANTS = {
    initial: (direction = 'forward') => ({
        opacity: 0,
        scale: 0.96,
        rotateY: direction === 'forward' ? 15 : -15,
        transformOrigin: "50% 50%",
        z: -100 // Start slightly back in Z space
    }),
    animate: {
        opacity: 1,
        scale: 1,
        rotateY: 0,
        z: 0,
        transition: {
            duration: 0.4,
            ease: [0.25, 1, 0.5, 1],
            type: "spring",
            stiffness: 100,
            damping: 20
        }
    },
    exit: (direction = 'forward') => ({
        opacity: 0,
        scale: 0.96,
        rotateY: direction === 'forward' ? -15 : 15,
        z: -100,
        transition: {
            duration: 0.3,
            ease: [0.25, 1, 0.5, 1]
        }
    })
};

// 1. Dashboard -> Module (Card Expansion)
export const CARD_EXPAND_VARIANTS = {
    initial: {
        opacity: 0,
        scale: 0.8,
        y: 20,
    },
    animate: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { ...SPRING_SMOOTH, delay: 0.1 }
    },
    exit: {
        opacity: 0,
        scale: 0.9,
        transition: { duration: 0.2 }
    }
};

// 2. List -> Detail View (Stacked Layer)
export const STACK_SLIDE_VARIANTS = {
    enter: (direction) => ({
        x: direction === 'forward' ? '100%' : '-20%', // Slide in from right if forward
        opacity: direction === 'forward' ? 1 : 0, // Fade in if coming back? Actually if reversing, we want the "previous" page (now active) to just be there.
        zIndex: direction === 'forward' ? 10 : 0,
        scale: 1,
    }),
    center: {
        x: 0,
        opacity: 1,
        scale: 1,
        zIndex: 1,
        transition: {
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
        }
    },
    exit: (direction) => ({
        x: direction === 'forward' ? '-20%' : '100%', // If moving forward, slide slightly left. If moving back, slide all the way right.
        opacity: direction === 'forward' ? 0.8 : 1, // Dim slightly if moving to back
        scale: direction === 'forward' ? 0.95 : 1, // Shrink slightly if moving to back
        zIndex: 0,
        transition: {
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
            scale: { duration: 0.4 }
        }
    })
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

// 3. Multi-step Forms (Z-axis Shared Transition)
export const FORM_STEP_VARIANTS = {
    initial: (direction) => ({
        opacity: 0,
        scale: direction === 'forward' ? 1.1 : 0.9, // If forward, new step comes from "front" (1.1). If back, comes from "back" (0.9)
        z: direction === 'forward' ? 100 : -100,
        rotateX: direction === 'forward' ? 5 : -5, // Subtle perspective
    }),
    animate: {
        opacity: 1,
        scale: 1,
        z: 0,
        rotateX: 0,
        transition: {
            duration: 0.4,
            ease: "easeOut",
            type: "spring",
            stiffness: 100,
            damping: 20
        }
    },
    exit: (direction) => ({
        opacity: 0,
        scale: direction === 'forward' ? 0.9 : 1.1, // If moving forward, current step goes "back" (0.9). If moving back, current goes "front" (1.1)
        z: direction === 'forward' ? -100 : 100,
        rotateX: direction === 'forward' ? -5 : 5,
        transition: {
            duration: 0.3,
            ease: "easeIn"
        }
    })
};
