import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle size={20} color="var(--color-success)" />;
      case 'error': return <XCircle size={20} color="var(--color-danger)" />;
      case 'warning': return <AlertTriangle size={20} color="var(--color-warning)" />;
      case 'info':
      default: return <Info size={20} color="var(--color-primary)" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'success': return 'rgba(16, 185, 129, 0.4)';
      case 'error': return 'rgba(239, 68, 68, 0.4)';
      case 'warning': return 'rgba(245, 158, 11, 0.4)';
      case 'info':
      default: return 'rgba(56, 189, 248, 0.4)';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      zIndex: 9999,
      pointerEvents: 'none' // Let clicks pass through empty space
    }}>
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            style={{
              pointerEvents: 'auto',
              background: 'rgba(30, 41, 59, 0.9)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${getBorderColor(notif.type)}`,
              padding: '16px',
              borderRadius: '12px',
              minWidth: '300px',
              maxWidth: '400px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              position: 'relative'
            }}
          >
            <div style={{ marginTop: '2px' }}>
              {getIcon(notif.type)}
            </div>
            <div style={{ flex: 1, color: 'white', fontSize: '0.95rem', lineHeight: 1.4 }}>
              {notif.message}
            </div>
            <button
              onClick={() => removeNotification(notif.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationContainer;
