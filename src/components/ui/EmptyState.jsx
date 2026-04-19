import React from 'react';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  message, 
  actionLabel, 
  onAction,
  actionIcon: ActionIcon
}) => {
  return (
    <div className="text-center animate-fade-in p-5 rounded-3 w-100" style={{ background: 'rgba(0,0,0,0.2)', border: '1px dashed var(--color-border)' }}>
      {Icon && (
        <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4" style={{ width: 80, height: 80, background: 'rgba(56, 189, 248, 0.1)' }}>
          <Icon size={40} color="var(--color-primary)" />
        </div>
      )}
      
      <h3 className="fs-4 fw-semibold mb-2">{title}</h3>
      <p className="text-muted mx-auto mb-4" style={{ maxWidth: 400, lineHeight: 1.6 }}>{message}</p>
      
      {actionLabel && onAction && (
        <button className="btn btn-primary d-inline-flex align-items-center gap-2" onClick={onAction}>
          {ActionIcon && <ActionIcon size={18} />}
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
