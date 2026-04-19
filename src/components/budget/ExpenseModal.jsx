import React, { useState, useEffect } from 'react';
import { X, DollarSign, Tag, Calendar, FileText, Image as ImageIcon, Users } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const CATEGORIES = ['Accommodation', 'Food', 'Transport', 'Activities', 'Shopping', 'Other'];

const ExpenseModal = ({ isOpen, onClose, onSave, tripMembers, initialData = null }) => {
  const defaultForm = {
    description: '', amount: 0, category: 'Food', date: new Date().toISOString().slice(0, 16),
    paidBy: tripMembers?.[0]?.id || '', splitType: 'equal', splits: [], receiptImage: '', notes: ''
  };

  const [form, setForm] = useLocalStorage('expense_draft', defaultForm);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [customSplits, setCustomSplits] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({ ...initialData, date: initialData.date ? initialData.date.slice(0, 16) : new Date().toISOString().slice(0, 16) });
      if (initialData.splitType === 'equal') setSelectedMembers(initialData.splits.filter(s => s.amountOwed > 0).map(s => s.memberId));
      else { const cs = {}; initialData.splits.forEach(s => cs[s.memberId] = s.amountOwed); setCustomSplits(cs); }
    }
  }, [initialData, isOpen, tripMembers]);

  if (!isOpen) return null;

  const handleCustomSplitChange = (memberId, value) => setCustomSplits(prev => ({ ...prev, [memberId]: Number(value) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    let finalSplits = [];
    if (form.splitType === 'equal') {
      if (selectedMembers.length === 0) return alert('Select at least one member to split with.');
      const amountPerPerson = form.amount / selectedMembers.length;
      finalSplits = tripMembers.map(m => ({ memberId: m.id, amountOwed: selectedMembers.includes(m.id) ? amountPerPerson : 0 }));
    } else {
      const totalCustom = Object.values(customSplits).reduce((sum, val) => sum + (val || 0), 0);
      if (Math.abs(totalCustom - form.amount) > 0.01) return alert(`Custom split amounts must equal total amount (${form.amount}). Currently: ${totalCustom}`);
      finalSplits = tripMembers.map(m => ({ memberId: m.id, amountOwed: customSplits[m.id] || 0 }));
    }
    onSave({ ...form, splits: finalSplits });
    if (!initialData) { setForm(defaultForm); localStorage.removeItem('expense_draft'); }
  };

  return (
    <>
      <div className="modal-backdrop show" style={{ backdropFilter: 'blur(4px)' }} onClick={onClose}></div>
      <div className="modal d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content animate-scale-in">
            <div className="modal-header">
              <h5 className="modal-title d-flex align-items-center gap-2"><DollarSign size={20} color="var(--color-success)" /> {initialData ? 'Edit Expense' : 'Add Expense'}</h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <form id="expenseForm" onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label text-muted">Description</label>
                  <input type="text" className="form-control" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required placeholder="e.g. Dinner at Sushi Dai" />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6"><label className="form-label text-muted">Amount</label><input type="number" step="0.01" className="form-control" value={form.amount || ''} onChange={e => setForm({...form, amount: Number(e.target.value)})} required /></div>
                  <div className="col-6"><label className="form-label text-muted">Date</label><input type="datetime-local" className="form-control" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required style={{ colorScheme: 'dark' }} /></div>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6"><label className="form-label text-muted">Category</label><select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>{CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                  <div className="col-6"><label className="form-label text-muted">Paid By</label><select className="form-select" value={form.paidBy} onChange={e => setForm({...form, paidBy: e.target.value})} required>{tripMembers?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
                </div>
                <div className="card mb-3"><div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <label className="fw-semibold mb-0">Split Options</label>
                    <div className="btn-group btn-group-sm">
                      <button type="button" className={`btn ${form.splitType === 'equal' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setForm({...form, splitType: 'equal'})}>Equally</button>
                      <button type="button" className={`btn ${form.splitType === 'custom' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setForm({...form, splitType: 'custom'})}>Custom</button>
                    </div>
                  </div>
                  {form.splitType === 'equal' ? (
                    <div>
                      <div className="text-muted small mb-2">Split equally among selected: {form.amount > 0 && selectedMembers.length > 0 ? `(${(form.amount / selectedMembers.length).toFixed(2)} / person)` : ''}</div>
                      <div className="row g-2">{tripMembers?.map(m => (<div className="col-6" key={m.id}><div className="form-check"><input className="form-check-input" type="checkbox" checked={selectedMembers.includes(m.id)} onChange={e => e.target.checked ? setSelectedMembers([...selectedMembers, m.id]) : setSelectedMembers(selectedMembers.filter(id => id !== m.id))} /><label className="form-check-label">{m.name}</label></div></div>))}</div>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      <div className="text-muted small mb-1">Enter exact amounts (Must total {form.amount}):</div>
                      {tripMembers?.map(m => (<div key={m.id} className="d-flex justify-content-between align-items-center"><span>{m.name}</span><input type="number" step="0.01" className="form-control form-control-sm" style={{ width: 120 }} value={customSplits[m.id] || ''} onChange={e => handleCustomSplitChange(m.id, e.target.value)} /></div>))}
                      <div className="text-end small" style={{ color: Math.abs(Object.values(customSplits).reduce((a,b)=>a+(b||0),0) - form.amount) < 0.01 ? 'var(--color-success)' : 'var(--color-danger)' }}>Total: {Object.values(customSplits).reduce((a,b)=>a+(b||0),0).toFixed(2)} / {form.amount}</div>
                    </div>
                  )}
                </div></div>
                <div className="mb-3"><label className="form-label text-muted">Receipt Image URL</label><input type="url" className="form-control" value={form.receiptImage} onChange={e => setForm({...form, receiptImage: e.target.value})} placeholder="https://..." /></div>
                <div className="mb-3"><label className="form-label text-muted">Notes</label><textarea className="form-control" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows="2" placeholder="Optional details..." /></div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" form="expenseForm" className="btn btn-success">{initialData ? 'Save Changes' : 'Add Expense'}</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExpenseModal;
