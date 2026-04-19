import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 24, color = 'var(--color-primary)', strokeWidth = 3 }) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      style={{ display: 'inline-block' }}
    >
      <motion.circle
        cx="25"
        cy="25"
        r="20"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="transparent"
        initial={{ strokeDasharray: '1, 150', strokeDashoffset: 0 }}
        animate={{
          strokeDasharray: ['90, 150', '90, 150'],
          strokeDashoffset: [0, -120],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.svg>
  );
};

export default LoadingSpinner;
