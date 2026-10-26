import React, { useState } from 'react';

const memberId = m => String(m?._id || m?.id || '');
const localDate = value => { const d = value ? new Date(value) : new Date(); if (!Number.isFinite(+d)) return ''; d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0,16); };

// Mounted only while open: each payment starts with a fresh, stable form.
const SettlementModal = ({ onClose, onSave, tripMembers, currency, defaultTransaction, initialData }) => {
  const [form, setForm] = useState(() => {
    const canonical = id => memberId(tripMembers.find(m=>[memberId(m),String(m.user || '')].includes(String(id))));
    return initialData ? {payerId:canonical(initialData.payerId),payeeId:canonical(initialData.payeeId),amount:initialData.amount,date:localDate(initialData.date),method:initialData.method || '',notes:initialData.notes || ''} : {payerId:defaultTransaction?.from.id || '',payeeId:defaultTransaction?.to.id || '',amount:defaultTransaction?.amount || '',date:localDate(),method:'',notes:''};
  });
  const [requestId] = useState(() => crypto.randomUUID());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const update = e => { const { name, value } = e.target; setForm(prev => ({ ...prev, [name]: value, ...(name === 'payerId' && value === prev.payeeId ? { payeeId: '' } : {}) })); };
  const submit = async e => {
    e.preventDefault();
    if (saving) return;
    if (!form.payerId || !form.payeeId || form.payerId === form.payeeId) { setError('Choose two different members.'); return; }
    if (!Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0) { setError('Enter an amount greater than zero.'); return; }
    setSaving(true); setError('');
    try { await onSave({ ...form, requestId, expectedUpdatedAt: initialData?.updatedAt, amount: Number(form.amount), date: new Date(form.date).toISOString() }); }
    catch (err) { setError(err.userMessage || err.message || 'Could not record payment.'); }
    finally { setSaving(false); }
  };
  return <>
    <div className="modal-backdrop show" />
    <div className="modal d-block" role="dialog" aria-modal="true" aria-labelledby="payment-title">
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable"><div className="modal-content">
        <div className="modal-header"><h2 id="payment-title" className="modal-title fs-5">{initialData ? 'Edit payment' : 'Record a repayment'}</h2><button aria-label="Close" className="btn-close btn-close-white" disabled={saving} onClick={onClose} /></div>
        <form onSubmit={submit}>
          <div className="modal-body">
            <p className="text-muted small">Record a payment made outside TravelSync. No money is transferred here.</p>{defaultTransaction && <div className="alert alert-success py-2 small">{defaultTransaction.from.name} owes {defaultTransaction.to.name} {defaultTransaction.amount} {currency}. You can record a partial payment too.</div>}
            {error && <div role="alert" className="alert alert-danger">{error}</div>}
            <label className="form-label" htmlFor="payment-from">Who paid?</label>
            <select id="payment-from" name="payerId" className="form-select mb-3" value={form.payerId} onChange={update} required disabled={saving}><option value="">Choose a member</option>{tripMembers.map(m => <option key={memberId(m)} value={memberId(m)}>{m.name}</option>)}</select>
            <label className="form-label" htmlFor="payment-to">Who received it?</label>
            <select id="payment-to" name="payeeId" className="form-select mb-3" value={form.payeeId} onChange={update} required disabled={saving}><option value="">Choose a member</option>{tripMembers.filter(m => memberId(m) !== form.payerId).map(m => <option key={memberId(m)} value={memberId(m)}>{m.name}</option>)}</select>
            <label className="form-label" htmlFor="payment-amount">Amount ({currency})</label>
            <input id="payment-amount" name="amount" className="form-control mb-3" type="number" min="0.01" step="0.01" value={form.amount} onChange={update} required disabled={saving} />
            <details><summary className="text-muted mb-3">Date, method or note (optional)</summary>
              <label className="form-label" htmlFor="payment-date">Date</label><input id="payment-date" name="date" className="form-control mb-3" type="datetime-local" value={form.date} onChange={update} required disabled={saving} />
              <label className="form-label" htmlFor="payment-method">Method</label><select id="payment-method" name="method" className="form-select mb-3" value={form.method} onChange={update} disabled={saving}>{[...new Set(['','Cash','UPI','Bank Transfer','Other',initialData?.method].filter(m=>m!==undefined))].map(m => <option key={m} value={m}>{m || 'Not specified'}</option>)}</select>
              <label className="form-label" htmlFor="payment-note">Note</label><input id="payment-note" name="notes" className="form-control" value={form.notes} onChange={update} disabled={saving} />
            </details>
          </div>
          <div className="modal-footer"><button type="button" className="btn btn-outline-secondary" disabled={saving} onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : initialData ? 'Save payment' : 'Record payment'}</button></div>
        </form>
      </div></div>
    </div>
  </>;
};
export default SettlementModal;
