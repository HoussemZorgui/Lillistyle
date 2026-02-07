'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function AnimatedSection({
    children,
    className,
    style,
    delay = 0
}: {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    delay?: number;
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 100, scale: 0.95, filter: 'blur(10px)' }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' } : { opacity: 0, y: 100, scale: 0.95, filter: 'blur(10px)' }}
            transition={{
                duration: 1.2,
                ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for a "premium" feel
                delay
            }}
            className={className}
            style={style}
        >
            {children}
        </motion.div>
    );
}
