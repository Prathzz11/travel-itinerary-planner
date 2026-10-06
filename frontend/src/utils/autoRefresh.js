export const isEditing = document => Boolean(document.querySelector('.modal.show, .modal.d-block, [role="dialog"]') || document.activeElement?.matches('input, textarea, select, [contenteditable="true"]'));

// One request batch at a time. Hidden/offline tabs and active edits pause polling.
export function startAutoRefresh(refresh, { document, window, interval = 15000, onError = () => {} }) {
  let stopped = false, busy = false;
  const run = async () => {
    if (stopped || busy || document.visibilityState !== 'visible' || window.navigator.onLine === false) return;
    if (isEditing(document)) return;
    busy = true;
    try { await refresh(); } catch (error) { if (!stopped) onError(error); }
    finally { busy = false; }
  };
  const timer = window.setInterval(run, interval);
  window.addEventListener('focus', run);
  window.addEventListener('online', run);
  document.addEventListener('visibilitychange', run);
  return () => {
    stopped = true; window.clearInterval(timer);
    window.removeEventListener('focus', run); window.removeEventListener('online', run);
    document.removeEventListener('visibilitychange', run);
  };
}
