import { useSpring, animated } from '@react-spring/web';

interface AnimatedNumberProps {
    value: number | string;
    roundOff: number;
    duration?: number;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, roundOff, duration = 1000 }) => {
    // Extract prefix, numeric value, and suffix
    const match = typeof value === 'string' ? value.match(/([-₹$€£]*)([\d,.]+)([%]*)/) : null;
    const prefix = match?.[1] || ''; // Currency or sign
    const numericPart = match ? parseFloat(match[2].replace(/,/g, '')) || 0 : (typeof value === 'number' ? value : 0);
    const suffix = match?.[3] || ''; // Percentage or other suffix

    // Always call useSpring to avoid breaking rules of hooks
    const { number } = useSpring({
        from: { number: 0 },
        to: { number: numericPart },
        config: { duration: duration },
        immediate: numericPart === 0, // No animation if numericPart is 0
    });

    return (
        <span>
            {prefix}
            {numericPart === 0 ? (
                numericPart.toFixed(roundOff) // Directly show the value if 0
            ) : (
                <animated.span>
                    {number.to((n) => n.toFixed(roundOff))}
                </animated.span>
            )}
            {suffix}
        </span>
    );
};

export default AnimatedNumber;
