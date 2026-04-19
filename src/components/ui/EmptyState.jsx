import React from 'react';
import { motion } from 'framer-motion';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  message, 
  actionLabel, 
  onAction,
  actionIcon: ActionIcon
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      style={{ 
        textAlign: 'center', 
        padding: 'var(--space-8) var(--space-4)', 
        color: 'var(--color-text-muted)', 
        background: 'rgba(0,0,0,0.2)', 
        borderRadius: 'var(--radius-lg)', 
        border: '1px dashed var(--color-border)', 
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {Icon && (
        <div style={{ 
          width: '80px', 
          height: '80px', 
          borderRadius: '50%', 
          background: 'rgba(56, 189, 248, 0.1)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          <Icon size={40} color="var(--color-primary)" />
        </div>
      )}
      
      <h3 style={{ fontSize: '1.5rem', color: 'white', margin: '0 0 8px 0' }}>{title}</h3>
      <p style={{ maxWidth: '400px', margin: '0 auto 24px', lineHeight: 1.6 }}>{message}</p>
      
      {actionLabel && onAction && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          style={{ 
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', 
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
            boxShadow: '0 8px 30px rgba(56, 189, 248, 0.4)' 
          }}
        >
          {ActionIcon && <ActionIcon size={18} />}
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
};

export default EmptyState;
