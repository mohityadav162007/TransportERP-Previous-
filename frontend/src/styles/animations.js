export const IOS_SPRING = {
    type: "spring",
    stiffness: 260,
    damping: 20,
    mass: 1
};

export const SPRING_GENTLE = {
    type: "spring",
    stiffness: 100,
    damping: 15
};

export const BUTTON_TAP = {
    scale: 0.96,
    transition: { duration: 0.1 }
};

export const PAGE_VARIANTS = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } }
};

export const STAGGER_CONTAINER = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1
        }
    }
};

export const LIST_ITEM_VARIANTS = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: IOS_SPRING }
};

export const MODAL_BACKDROP = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
};

export const MODAL_CONTENT = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: IOS_SPRING },
    exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2 } }
};

export const CARD_EXPAND_VARIANTS = {
    collapsed: { scale: 1 },
    expanded: { scale: 1.02 }
};

export const STACK_SLIDE_VARIANTS = {
    initial: { x: 50, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: IOS_SPRING },
    exit: { x: 50, opacity: 0 }
};

export const FORM_STEP_VARIANTS = {
    initial: (direction) => ({
        x: direction === 'forward' ? 50 : -50,
        opacity: 0
    }),
    animate: {
        x: 0,
        opacity: 1
    },
    exit: (direction) => ({
        x: direction === 'forward' ? -50 : 50,
        opacity: 0
    })
};

export const FADE_IN_VARIANTS = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
};
