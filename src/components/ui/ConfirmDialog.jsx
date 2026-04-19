import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Global Confirmation Dialog
 * Replaces all window.confirm() calls with a beautiful animated modal.
 * Props: isOpen, title, message, confirmLabel, onConfirm, onCancel, variant ('danger' | 'warning')
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

  const variantColor = variant === 'danger' ? 'var(--color-danger)' : 'var(--color-warning)';
  const variantBg = variant === 'danger' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)';

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
        />

        {/* Dialog Panel */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="glass-panel"
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: '420px',
            padding: '28px 28px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {/* Close X */}
          <button
            onClick={onCancel}
            aria-label="Close dialog"
            style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>

          {/* Icon + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', flexShrink: 0, borderRadius: '50%', background: variantBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={22} color={variantColor} />
            </div>
            <h3 id="confirm-dialog-title" style={{ margin: 0, fontSize: '1.15rem', lineHeight: 1.3 }}>{title}</h3>
          </div>

          {/* Message */}
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.93rem', lineHeight: 1.6, paddingLeft: '58px' }}>
            {message}
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button
              onClick={onCancel}
              style={{ padding: '9px 20px', borderRadius: 'var(--radius-full)', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text)', cursor: 'pointer', fontWeight: 500, transition: 'background 0.2s' }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              style={{ padding: '9px 20px', borderRadius: 'var(--radius-full)', background: variantColor, border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s' }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmDialog;
