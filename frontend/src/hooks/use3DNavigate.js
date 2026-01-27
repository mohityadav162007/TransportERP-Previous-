import { useNavigate as useRrDomNavigate } from 'react-router-dom';
import { useTransition } from '../context/TransitionContext';

export function use3DNavigate() {
    const navigate = useRrDomNavigate();
    const { setDirection, setType } = useTransition();

    const navigate3D = (to, options = {}) => {
        const { transition = 'default', direction = 'forward', ...navOptions } = options;

        setType(transition);
        setDirection(direction);

        navigate(to, navOptions);
    };

    const back = () => {
        setDirection('backward'); // Usually we want to reverse the animation
        // We might want to persist the 'type' of the previous transition to reverse it correctly
        // For now, let's assume 'default' or reliance on the component to handle 'exit' animations appropriately
        navigate(-1);
    };

    return { navigate: navigate3D, back };
}
