import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Tag, Calendar, FileText, Image as ImageIcon, Users } from 'lucide-react';
import { SocketContext } from '../../contexts/SocketContext';
import { useParams } from 'react-router-dom';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const CATEGORIES = ['Accommodation', 'Food', 'Transport', 'Activities', 'Shopping', 'Other'];

const ExpenseModal = ({ isOpen, onClose, onSave, tripMembers, initialData = null }) => {
  const { id: tripId } = useParams();
  const socketContext = useContext(SocketContext);
  const { emitTyping, emitStopTyping } = socketContext || {};
  const typingTimeoutRef = useRef(null);

  const defaultForm = {
    description: '', amount: 0, category: 'Food', date: new Date().toISOString().slice(0, 16),
    paidBy: tripMembers?.[0]?.id || '', splitType: 'equal', splits: [], receiptImage: '', notes: ''
  };

  const [form, setForm] = useLocalStorage('expense_draft', defaultForm);

  const [selectedMembers, setSelectedMembers] = useState([]); // for equal split
  const [customSplits, setCustomSplits] = useState({}); // for custom split

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        date: initialData.date ? initialData.date.slice(0, 16) : new Date().toISOString().slice(0, 16)
      });
      if (initialData.splitType === 'equal') {
        setSelectedMembers(initialData.splits.filter(s => s.amountOwed > 0).map(s => s.memberId));
      } else {
        const cs = {};
        initialData.splits.forEach(s => cs[s.memberId] = s.amountOwed);
        setCustomSplits(cs);
      }
    }
  }, [initialData, isOpen, tripMembers]);

  if (!isOpen) return null;

  const handleTyping = () => {
    if (emitTyping && tripId) {
      emitTyping(tripId);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (emitStopTyping) emitStopTyping(tripId);
      }, 2000);
    }
  };

  const handleCustomSplitChange = (memberId, value) => {
    setCustomSplits(prev => ({ ...prev, [memberId]: Number(value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let finalSplits = [];

    if (form.splitType === 'equal') {
      if (selectedMembers.length === 0) return alert('Select at least one member to split with.');
      const amountPerPerson = form.amount / selectedMembers.length;
      finalSplits = tripMembers.map(m => ({
        memberId: m.id,
        amountOwed: selectedMembers.includes(m.id) ? amountPerPerson : 0
      }));
    } else {
      const totalCustom = Object.values(customSplits).reduce((sum, val) => sum + (val || 0), 0);
      if (Math.abs(totalCustom - form.amount) > 0.01) {
        return alert(`Custom split amounts must equal total amount (${form.amount}). Currently: ${totalCustom}`);
      }
      finalSplits = tripMembers.map(m => ({
        memberId: m.id,
        amountOwed: customSplits[m.id] || 0
      }));
    }

    onSave({ ...form, splits: finalSplits });
    
    if (!initialData) {
      setForm(defaultForm);
      localStorage.removeItem('expense_draft');
    }
  };

  return (
    <AnimatePresence>
      <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }} />
        
        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="glass-panel responsive-modal" style={{ width: '100%', maxWidth: '500px', padding: 'var(--space-6)', position: 'relative', zIndex: 1001, maxHeight: '90vh', overflowY: 'auto' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
          
          <h2 style={{ margin: '0 0 var(--space-6) 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={24} color="var(--color-success)" /> {initialData ? 'Edit Expense' : 'Add Expense'}
          </h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Description</label>
              <input type="text" value={form.description} onKeyDown={handleTyping} onChange={e => setForm({...form, description: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }} required placeholder="e.g. Dinner at Sushi Dai" />
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}><DollarSign size={14} style={{ display: 'inline', verticalAlign: 'middle' }}/> Amount</label>
                <input type="number" step="0.01" value={form.amount || ''} onChange={e => setForm({...form, amount: Number(e.target.value)})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }} required />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}><Calendar size={14} style={{ display: 'inline', verticalAlign: 'middle' }}/> Date</label>
                <input type="datetime-local" value={form.date} onChange={e => setForm({...form, date: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white', colorScheme: 'dark' }} required />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}><Tag size={14} style={{ display: 'inline', verticalAlign: 'middle' }}/> Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }}>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}><Users size={14} style={{ display: 'inline', verticalAlign: 'middle' }}/> Paid By</label>
                <select value={form.paidBy} onChange={e => setForm({...form, paidBy: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }} required>
                  {tripMembers?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>

            {/* Split Options */}
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <label style={{ fontWeight: 600 }}>Split Options</label>
                <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-full)', padding: '4px' }}>
                  <button type="button" onClick={() => setForm({...form, splitType: 'equal'})} style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', background: form.splitType === 'equal' ? 'var(--color-primary)' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>Equally</button>
                  <button type="button" onClick={() => setForm({...form, splitType: 'custom'})} style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', background: form.splitType === 'custom' ? 'var(--color-primary)' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>Custom</button>
                </div>
              </div>

              {form.splitType === 'equal' ? (
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                    Split equally among selected members: {form.amount > 0 && selectedMembers.length > 0 ? `(${(form.amount / selectedMembers.length).toFixed(2)} / person)` : ''}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {tripMembers?.map(m => (
                      <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={selectedMembers.includes(m.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedMembers([...selectedMembers, m.id]);
                            else setSelectedMembers(selectedMembers.filter(id => id !== m.id));
                          }}
                        />
                        {m.name}
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Enter exact amounts for each member (Must total {form.amount}):</div>
                  {tripMembers?.map(m => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>{m.name}</span>
                      <div style={{ position: 'relative', width: '120px' }}>
                        <DollarSign size={12} color="var(--color-text-muted)" style={{ position: 'absolute', top: '50%', left: '8px', transform: 'translateY(-50%)' }} />
                        <input 
                          type="number" 
                          step="0.01" 
                          value={customSplits[m.id] || ''} 
                          onChange={(e) => handleCustomSplitChange(m.id, e.target.value)}
                          style={{ width: '100%', padding: '6px 6px 6px 24px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '4px', color: 'white' }}
                        />
                      </div>
                    </div>
                  ))}
                  <div style={{ textAlign: 'right', fontSize: '0.85rem', color: Math.abs(Object.values(customSplits).reduce((a,b)=>a+(b||0),0) - form.amount) < 0.01 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    Total: {Object.values(customSplits).reduce((a,b)=>a+(b||0),0).toFixed(2)} / {form.amount}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}><ImageIcon size={14} style={{ display: 'inline', verticalAlign: 'middle' }}/> Receipt Image URL</label>
              <input type="url" value={form.receiptImage} onChange={e => setForm({...form, receiptImage: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }} placeholder="https://..." />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}><FileText size={14} style={{ display: 'inline', verticalAlign: 'middle' }}/> Notes</label>
              <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white', minHeight: '60px' }} placeholder="Optional details..." />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
              <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '20px', color: 'white', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '8px 16px', background: 'var(--color-success)', border: 'none', borderRadius: '20px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>{initialData ? 'Save Changes' : 'Add Expense'}</button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ExpenseModal;
