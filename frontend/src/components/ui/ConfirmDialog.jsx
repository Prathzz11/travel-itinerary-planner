import React, { useMemo, useState, useEffect } from 'react';
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
  variant = 'danger',
  anchorRect = null
}) => {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { if (isOpen) setError(''); }, [isOpen]);
  const confirm = async () => {
    if (pending) return;
    setPending(true); setError('');
    try { await onConfirm(); } catch (err) { setError(err.userMessage || err.message || 'Action failed'); }
    finally { setPending(false); }
  };

  const variantColor = variant === 'danger' ? 'var(--color-danger)' : '#f59e0b';
  const variantBg = variant === 'danger' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)';
  const btnClass = variant === 'danger' ? 'btn-danger' : 'btn-warning';
  const anchored = Boolean(anchorRect);

  const dialogStyle = useMemo(() => {
    if (!anchored || typeof window === 'undefined') return undefined;

    const padding = 16;
    const gap = 8;
    const dialogWidth = 320;
    const dialogHeight = 200;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Center horizontally on the button
    let left = anchorRect.left + anchorRect.width / 2 - dialogWidth / 2;
    left = Math.max(padding, Math.min(left, viewportWidth - dialogWidth - padding));

    // Position below the button, or above if not enough space
    let top = anchorRect.bottom + gap;
    if (top + dialogHeight > viewportHeight - padding) {
      top = Math.max(padding, anchorRect.top - dialogHeight - gap);
    }

    return {
      position: 'fixed',
      top,
      left,
      width: dialogWidth,
      margin: 0,
      zIndex: 1056,
      pointerEvents: 'auto'
    };
  }, [anchorRect, anchored]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop show" style={{ backdropFilter: 'blur(4px)' }} onClick={pending ? undefined : onCancel}></div>

      {/* Dialog */}
      <div className="modal d-block" tabIndex="-1" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title" style={{ zIndex: 1055, pointerEvents: 'none' }}>
        <div className={`modal-dialog modal-sm${anchored ? '' : ' modal-dialog-centered'}`} style={dialogStyle}>
          <div className="modal-content animate-scale-in">
            <div className="modal-header border-0 pb-0">
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: 44, height: 44, background: variantBg, flexShrink: 0 }}>
                  <AlertTriangle size={22} color={variantColor} />
                </div>
                <h5 className="modal-title mb-0" id="confirm-dialog-title">{title}</h5>
              </div>
              <button type="button" className="btn-close btn-close-white" onClick={pending ? undefined : onCancel} aria-label="Close"></button>
            </div>
            <div className="modal-body pt-2">{error && <p className="text-danger" role="alert">{error}</p>}
              <p className="text-muted small mb-0" style={{ paddingLeft: '58px' }}>{message}</p>
            </div>
            <div className="modal-footer border-0 pt-0">
              <button className="btn btn-outline-secondary btn-sm" onClick={pending ? undefined : onCancel}>Cancel</button>
              <button className={`btn ${btnClass} btn-sm`} disabled={pending} onClick={confirm}>{confirmLabel}</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmDialog;
