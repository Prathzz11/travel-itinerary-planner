import React, { useState, useContext, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Handshake, ArrowRight, Printer, CheckCircle, Trash2, Calendar, CreditCard, IndianRupee } from 'lucide-react';
import { useTrip } from '../hooks/useTrip';
import { ExpenseContext } from '../contexts/ExpenseContext';
import TripNav from '../components/trip/TripNav';
import SettlementModal from '../components/budget/SettlementModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { calculateOptimalSettlements } from '../utils/settlements';
import { formatCurrency } from '../utils/formatters';

const SettlementsPage = () => {
  const { id } = useParams();
  const { trips } = useTrip();
  const { getExpenses, loadExpenses, getSettlements, addSettlement, deleteSettlement } = useContext(ExpenseContext);
  const trip = trips?.find(t => (t._id || t.id) === id);
  const expenses = getExpenses(id);
  const settlements = getSettlements(id);
  const tripMembers = trip?.members || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultTransaction, setDefaultTransaction] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    if (id) loadExpenses(id);
  }, [id, loadExpenses]);

  // All hooks BEFORE early returns (Rules of Hooks)
  const optimalTransactions = useMemo(() => calculateOptimalSettlements(tripMembers, expenses, settlements), [tripMembers, expenses, settlements]);

  // Early return AFTER all hooks
  if (!trip) return <div className="page-container"><div className="card text-center py-5"><h2>Trip not found</h2></div></div>;

  const handleSettleClick = (transaction = null) => { setDefaultTransaction(transaction); setIsModalOpen(true); };
  const getMemberName = (mId) => tripMembers.find(m => m.id === mId)?.name || 'Unknown';

  return (
    <div className="page-container animate-fade-in">
      <div className="card" style={{ minHeight: '80vh' }}>
        <div className="card-header no-print">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="fs-3 mb-0 d-flex align-items-center gap-2"><Handshake size={24} color="var(--color-primary)" /> Settle Up</h2>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={() => window.print()}><Printer size={14} /> Print</button>
              <button className="btn btn-primary btn-sm d-flex align-items-center gap-1" onClick={() => handleSettleClick()}><IndianRupee size={14} /> Record Payment</button>
            </div>
          </div>
          <TripNav tripId={trip._id || trip.id} />
        </div>
        <div className="card-body">
          {/* Suggested Transactions */}
          <h5 className="mb-3">Suggested Transactions</h5>
          <p className="text-muted small mb-4">The most efficient way to settle all debts, minimizing total transactions.</p>

          {optimalTransactions.length === 0 ? (
            <div className="text-center py-5 rounded-3" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--color-success)' }}>
              <CheckCircle size={48} color="#6ee7b7" className="mb-3" />
              <h4 style={{ color: '#6ee7b7' }}>All settled up!</h4>
              <p className="text-muted mb-0">No outstanding debts among trip members.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3 mb-5">
              {optimalTransactions.map((tx, idx) => (
                <div key={idx} className="card">
                  <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-3 flex-grow-1">
                      <div className="d-flex flex-column align-items-center gap-1"><div className="rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: 40, height: 40, background: 'rgba(239,68,68,0.2)', border: '2px solid var(--color-danger)' }}>{tx.from.name.charAt(0)}</div><span className="small fw-semibold">{tx.from.name}</span></div>
                      <div className="flex-grow-1 d-flex flex-column align-items-center" style={{ minWidth: 80 }}>
                        <span className="fw-bold fs-5">${tx.amount.toFixed(2)}</span>
                        <div className="w-100 position-relative" style={{ height: 2, background: 'var(--color-border)' }}><ArrowRight size={14} className="text-muted position-absolute top-50 end-0" style={{ transform: 'translateY(-50%)' }} /></div>
                        <span className="text-muted small">owes</span>
                      </div>
                      <div className="d-flex flex-column align-items-center gap-1"><div className="rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: 40, height: 40, background: 'rgba(16,185,129,0.2)', border: '2px solid var(--color-success)' }}>{tx.to.name.charAt(0)}</div><span className="small fw-semibold">{tx.to.name}</span></div>
                    </div>
                    <button className="btn btn-primary btn-sm no-print" onClick={() => handleSettleClick(tx)}>Record Payment</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Settlement History */}
          <h5 className="mb-3">Settlement History</h5>
          {settlements.length === 0 ? (
            <div className="text-center text-muted fst-italic p-4 rounded-2" style={{ background: 'rgba(0,0,0,0.15)' }}>No payments recorded yet.</div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {[...settlements].sort((a, b) => new Date(b.date) - new Date(a.date)).map(s => (
                <div key={s.id} className="card border-start border-3 border-success">
                  <div className="card-body d-flex justify-content-between align-items-center py-3">
                    <div>
                      <div className="fw-semibold">{getMemberName(s.payerId)} paid {getMemberName(s.payeeId)}</div>
                      <div className="text-muted small d-flex gap-3"><span className="d-inline-flex align-items-center gap-1"><Calendar size={12} /> {new Date(s.date).toLocaleDateString()}</span><span className="d-inline-flex align-items-center gap-1"><CreditCard size={12} /> {s.method}</span>{s.notes && <span>• {s.notes}</span>}</div>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      <span className="fw-bold fs-5" style={{ color: 'var(--color-success)' }}>${s.amount.toFixed(2)}</span>
                      <button className="btn btn-link p-0 text-danger no-print" onClick={() => setConfirmDeleteId(s.id)} title="Delete" aria-label="Delete settlement"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <SettlementModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setDefaultTransaction(null); }} onSave={(data) => { addSettlement(id, data); setIsModalOpen(false); setDefaultTransaction(null); }} tripMembers={tripMembers} defaultTransaction={defaultTransaction} />
      <ConfirmDialog isOpen={!!confirmDeleteId} title="Delete Settlement?" message="This payment record will be permanently deleted." confirmLabel="Delete" onConfirm={() => { deleteSettlement(id, confirmDeleteId); setConfirmDeleteId(null); }} onCancel={() => setConfirmDeleteId(null)} />
    </div>
  );
};

export default SettlementsPage;
