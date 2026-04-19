import React from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle size={20} color="var(--color-success)" />;
      case 'error': return <XCircle size={20} color="var(--color-danger)" />;
      case 'warning': return <AlertTriangle size={20} color="#f59e0b" />;
      case 'info':
      default: return <Info size={20} color="var(--color-primary)" />;
    }
  };

  const getBsClass = (type) => {
    switch (type) {
      case 'success': return 'border-success';
      case 'error': return 'border-danger';
      case 'warning': return 'border-warning';
      default: return 'border-info';
    }
  };

  return (
    <div className="position-fixed bottom-0 end-0 p-3 d-flex flex-column gap-2" style={{ zIndex: 9999, pointerEvents: 'none' }}>
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`d-flex align-items-start gap-2 p-3 rounded-3 border animate-slide-left ${getBsClass(notif.type)}`}
          style={{
            pointerEvents: 'auto',
            background: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(10px)',
            minWidth: 300,
            maxWidth: 400,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}
        >
          <div className="mt-1">{getIcon(notif.type)}</div>
          <div className="flex-grow-1 small" style={{ lineHeight: 1.4 }}>{notif.message}</div>
          <button className="btn-close btn-close-white" style={{ fontSize: '0.6rem' }} onClick={() => removeNotification(notif.id)} aria-label="Dismiss"></button>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
