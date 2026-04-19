import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorState = ({ 
  title = 'Something went wrong', 
  message = 'We encountered an error while trying to process your request.', 
  onRetry
}) => {
  return (
    <motion.div 
      role="alert"
      aria-live="assertive"
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      style={{ 
        textAlign: 'center', 
        padding: 'var(--space-8) var(--space-4)', 
        color: 'var(--color-text-muted)', 
        background: 'rgba(239, 68, 68, 0.1)', 
        borderRadius: 'var(--radius-lg)', 
        border: '1px solid rgba(239, 68, 68, 0.3)', 
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div style={{ 
        width: '64px', 
        height: '64px', 
        borderRadius: '50%', 
        background: 'rgba(239, 68, 68, 0.2)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginBottom: '24px'
      }}>
        <AlertCircle size={32} color="var(--color-danger)" />
      </div>
      
      <h3 style={{ fontSize: '1.5rem', color: 'var(--color-danger)', margin: '0 0 8px 0' }}>{title}</h3>
      <p style={{ maxWidth: '400px', margin: '0 auto 24px', lineHeight: 1.6 }}>{message}</p>
      
      {onRetry && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          style={{ 
            background: 'var(--color-danger)', 
            color: 'white', 
            border: 'none', 
            padding: '12px 24px', 
            borderRadius: 'var(--radius-full)', 
            fontSize: '1rem', 
            fontWeight: 'bold', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
          }}
        >
          <RefreshCw size={18} />
          Try Again
        </motion.button>
      )}
    </motion.div>
  );
};

export default ErrorState;
