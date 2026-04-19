import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Handshake, DollarSign, Calendar, CreditCard, AlignLeft } from 'lucide-react';

const METHODS = ['Cash', 'Venmo', 'PayPal', 'Zelle', 'Bank Transfer', 'Other'];

const SettlementModal = ({ isOpen, onClose, onSave, tripMembers, defaultTransaction = null }) => {
  const [form, setForm] = useState({
    payerId: '',
    payeeId: '',
    amount: 0,
    date: new Date().toISOString().slice(0, 16),
    method: 'Cash',
    notes: ''
  });

  useEffect(() => {
    if (defaultTransaction) {
      setForm({
        payerId: defaultTransaction.from.id,
        payeeId: defaultTransaction.to.id,
        amount: defaultTransaction.amount,
        date: new Date().toISOString().slice(0, 16),
        method: 'Venmo',
        notes: ''
      });
    } else {
      setForm({
        payerId: tripMembers?.[0]?.id || '',
        payeeId: tripMembers?.[1]?.id || '',
        amount: 0,
        date: new Date().toISOString().slice(0, 16),
        method: 'Cash',
        notes: ''
      });
    }
  }, [defaultTransaction, isOpen, tripMembers]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.payerId === form.payeeId) {
      return alert("Payer and Payee cannot be the same person.");
    }
    if (form.amount <= 0) {
      return alert("Amount must be greater than zero.");
    }
    onSave(form);
  };

  return (
    <AnimatePresence>
      <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }} />
        
        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="glass-panel responsive-modal" style={{ width: '100%', maxWidth: '500px', padding: 'var(--space-6)', position: 'relative', zIndex: 1001 }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
          
          <h2 style={{ margin: '0 0 var(--space-6) 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Handshake size={24} color="var(--color-primary)" /> Record a Payment
          </h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Who Paid</label>
                <select value={form.payerId} onChange={e => setForm({...form, payerId: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }} required>
                  {tripMembers?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div style={{ fontSize: '1.5rem', color: 'var(--color-text-muted)', marginTop: '24px' }}>&rarr;</div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Who Received</label>
                <select value={form.payeeId} onChange={e => setForm({...form, payeeId: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }} required>
                  {tripMembers?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}><DollarSign size={14} style={{ display: 'inline', verticalAlign: 'middle' }}/> Amount</label>
                <input type="number" step="0.01" value={form.amount || ''} onChange={e => setForm({...form, amount: Number(e.target.value)})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }} required />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}><Calendar size={14} style={{ display: 'inline', verticalAlign: 'middle' }}/> Date</label>
                <input type="datetime-local" value={form.date} onChange={e => setForm({...form, date: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white', colorScheme: 'dark' }} required />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}><CreditCard size={14} style={{ display: 'inline', verticalAlign: 'middle' }}/> Payment Method</label>
              <select value={form.method} onChange={e => setForm({...form, method: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }}>
                {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}><AlignLeft size={14} style={{ display: 'inline', verticalAlign: 'middle' }}/> Notes</label>
              <input type="text" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }} placeholder="Optional..." />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
              <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '20px', color: 'white', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '8px 16px', background: 'var(--color-primary)', border: 'none', borderRadius: '20px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Save Payment</button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SettlementModal;
