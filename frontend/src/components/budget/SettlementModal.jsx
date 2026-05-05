import React, { useState, useEffect } from 'react';
import { X, Handshake, IndianRupee, Calendar, CreditCard, AlignLeft } from 'lucide-react';

const METHODS = ['Cash', 'Venmo', 'PayPal', 'Zelle', 'Bank Transfer', 'Other'];

const SettlementModal = ({ isOpen, onClose, onSave, tripMembers, defaultTransaction = null }) => {
  const [form, setForm] = useState({ payerId: '', payeeId: '', amount: 0, date: new Date().toISOString().slice(0, 16), method: 'Cash', notes: '' });

  useEffect(() => {
    const getId = (m) => (m?.user || m?._id || m?.id)?.toString() || '';
    if (defaultTransaction) {
      setForm({ payerId: defaultTransaction.from.id, payeeId: defaultTransaction.to.id, amount: defaultTransaction.amount, date: new Date().toISOString().slice(0, 16), method: 'Venmo', notes: '' });
    } else {
      setForm({ payerId: getId(tripMembers?.[0]), payeeId: getId(tripMembers?.[1]), amount: 0, date: new Date().toISOString().slice(0, 16), method: 'Cash', notes: '' });
    }
  }, [defaultTransaction, isOpen, tripMembers]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.payerId === form.payeeId) return alert("Payer and Payee cannot be the same person.");
    if (form.amount <= 0) return alert("Amount must be greater than zero.");
    
    const payer = tripMembers?.find(m => (m.user || m._id || m.id)?.toString() === form.payerId);
    const payee = tripMembers?.find(m => (m.user || m._id || m.id)?.toString() === form.payeeId);
    
    onSave({
      ...form,
      payerName: payer?.name || 'Unknown',
      payeeName: payee?.name || 'Unknown'
    });
  };

  return (
    <>
      <div className="modal-backdrop show" style={{ backdropFilter: 'blur(4px)' }} onClick={onClose}></div>
      <div className="modal d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content animate-scale-in">
            <div className="modal-header">
              <h5 className="modal-title d-flex align-items-center gap-2"><Handshake size={20} color="var(--color-primary)" /> Record a Payment</h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <form id="settlementForm" onSubmit={handleSubmit}>
                <div className="row g-3 mb-3 align-items-end">
                  <div className="col-5"><label className="form-label text-muted">Who Paid</label><select className="form-select" value={form.payerId} onChange={e => setForm({...form, payerId: e.target.value})} required>{tripMembers?.map(m => { const mId = (m.user || m._id || m.id)?.toString(); return <option key={mId} value={mId}>{m.name}</option>; })}</select></div>
                  <div className="col-2 text-center pb-2" style={{ fontSize: '1.5rem', color: 'var(--color-text-muted)' }}>&rarr;</div>
                  <div className="col-5"><label className="form-label text-muted">Who Received</label><select className="form-select" value={form.payeeId} onChange={e => setForm({...form, payeeId: e.target.value})} required>{tripMembers?.map(m => { const mId = (m.user || m._id || m.id)?.toString(); return <option key={mId} value={mId}>{m.name}</option>; })}</select></div>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6"><label className="form-label text-muted">Amount</label><input type="number" step="0.01" className="form-control" style={{ fontSize: '1.2rem', fontWeight: 'bold' }} value={form.amount || ''} onChange={e => setForm({...form, amount: Number(e.target.value)})} required /></div>
                  <div className="col-6"><label className="form-label text-muted">Date</label><input type="datetime-local" className="form-control" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required style={{ colorScheme: 'dark' }} /></div>
                </div>
                <div className="mb-3"><label className="form-label text-muted">Payment Method</label><select className="form-select" value={form.method} onChange={e => setForm({...form, method: e.target.value})}>{METHODS.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                <div className="mb-3"><label className="form-label text-muted">Notes</label><input type="text" className="form-control" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Optional..." /></div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" form="settlementForm" className="btn btn-primary">Save Payment</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettlementModal;
