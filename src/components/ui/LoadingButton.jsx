import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const LoadingButton = ({ 
  children, 
  isLoading, 
  loadingText = 'Loading...', 
  disabled, 
  variant = 'primary',
  size = 'md',
  style = {},
  ...props 
}) => {
  const isDisabled = isLoading || disabled;

  const bsSize = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  const bsVariant = variant === 'danger' ? 'btn-danger' 
    : variant === 'outline' ? 'btn-outline-primary' 
    : variant === 'secondary' ? 'btn-secondary' 
    : 'btn-primary';

  return (
    <button
      className={`btn ${bsVariant} ${bsSize} d-flex align-items-center justify-content-center gap-2`}
      disabled={isDisabled}
      style={{ fontWeight: 600, ...style }}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size={size === 'sm' ? 16 : 20} color="currentColor" />
          {loadingText && <span>{loadingText}</span>}
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default LoadingButton;
