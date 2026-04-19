import React from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

const LoadingButton = ({ 
  children, 
  isLoading, 
  loadingText = 'Loading...', 
  disabled, 
  variant = 'primary', // primary, secondary, outline, danger
  size = 'md', // sm, md, lg
  style = {},
  ...props 
}) => {
  const getBackground = () => {
    switch (variant) {
      case 'primary': return 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))';
      case 'danger': return 'var(--color-danger)';
      case 'outline': return 'transparent';
      default: return 'var(--color-surface-hover)';
    }
  };

  const getColor = () => {
    if (variant === 'outline') return 'var(--color-primary)';
    return 'white';
  };

  const getBorder = () => {
    if (variant === 'outline') return '1px solid var(--color-primary)';
    return 'none';
  };

  const getPadding = () => {
    switch (size) {
      case 'sm': return 'var(--space-2) var(--space-4)';
      case 'lg': return 'var(--space-4) var(--space-8)';
      default: return 'var(--space-3) var(--space-6)'; // md
    }
  };

  const isDisabled = isLoading || disabled;

  return (
    <motion.button
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      disabled={isDisabled}
      style={{
        background: getBackground(),
        color: getColor(),
        border: getBorder(),
        padding: getPadding(),
        borderRadius: 'var(--radius-md)',
        fontSize: size === 'sm' ? '0.9rem' : size === 'lg' ? '1.1rem' : '1rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        opacity: isDisabled ? 0.7 : 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        transition: 'opacity 0.2s, background 0.2s',
        ...style
      }}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size={size === 'sm' ? 16 : 20} color={getColor()} />
          {loadingText && <span>{loadingText}</span>}
        </>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default LoadingButton;
