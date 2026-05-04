import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorState = ({ 
  title = 'Something went wrong', 
  message = 'We encountered an error while trying to process your request.', 
  onRetry
}) => {
  return (
    <div role="alert" aria-live="assertive" className="text-center animate-fade-in p-5 rounded-3 w-100" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
      <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4" style={{ width: 64, height: 64, background: 'rgba(239, 68, 68, 0.2)' }}>
        <AlertCircle size={32} color="var(--color-danger)" />
      </div>
      
      <h3 className="fs-4 fw-semibold text-danger mb-2">{title}</h3>
      <p className="text-muted mx-auto mb-4" style={{ maxWidth: 400, lineHeight: 1.6 }}>{message}</p>
      
      {onRetry && (
        <button className="btn btn-danger d-inline-flex align-items-center gap-2" onClick={onRetry}>
          <RefreshCw size={18} /> Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
