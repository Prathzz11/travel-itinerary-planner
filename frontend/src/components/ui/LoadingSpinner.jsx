import React from 'react';

const LoadingSpinner = ({ size = 24, color = 'var(--color-primary)' }) => {
  return (
    <div
      className="spinner-border"
      role="status"
      style={{
        width: size,
        height: size,
        borderWidth: '2px',
        color: color,
        display: 'inline-block'
      }}
    >
      <span className="visually-hidden">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
