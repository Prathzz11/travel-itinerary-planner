import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Global Confirmation Dialog — Bootstrap Modal
 */
const ConfirmDialog = ({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const variantColor = variant === 'danger' ? 'var(--color-danger)' : '#f59e0b';
  const variantBg = variant === 'danger' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)';
  const btnClass = variant === 'danger' ? 'btn-danger' : 'btn-warning';

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop show" style={{ backdropFilter: 'blur(4px)' }} onClick={onCancel}></div>

      {/* Dialog */}
      <div className="modal d-block" tabIndex="-1" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content animate-scale-in">
            <div className="modal-header border-0 pb-0">
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: 44, height: 44, background: variantBg, flexShrink: 0 }}>
                  <AlertTriangle size={22} color={variantColor} />
                </div>
                <h5 className="modal-title mb-0" id="confirm-dialog-title">{title}</h5>
              </div>
              <button type="button" className="btn-close btn-close-white" onClick={onCancel} aria-label="Close"></button>
            </div>
            <div className="modal-body pt-2">
              <p className="text-muted small mb-0" style={{ paddingLeft: '58px' }}>{message}</p>
            </div>
            <div className="modal-footer border-0 pt-0">
              <button className="btn btn-outline-secondary btn-sm" onClick={onCancel}>Cancel</button>
              <button className={`btn ${btnClass} btn-sm`} onClick={onConfirm}>{confirmLabel}</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmDialog;
