import React, { useState, useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Handshake, ArrowRight, Printer, CheckCircle, Trash2, Calendar, CreditCard, DollarSign } from 'lucide-react';
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
  const { getExpenses, getSettlements, addSettlement, deleteSettlement } = useContext(ExpenseContext);
  
  const trip = trips?.find(t => t.id === id);
  const expenses = getExpenses(id);
  const settlements = getSettlements(id);
  const tripMembers = trip?.members || [];
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultTransaction, setDefaultTransaction] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  if (!trip) return <div className="page-container glass-panel"><h2 style={{textAlign: 'center', margin: 'auto'}}>Trip not found</h2></div>;

  // Calculate optimal transactions
  const optimalTransactions = useMemo(() => {
    return calculateOptimalSettlements(expenses, settlements, tripMembers);
  }, [expenses, settlements, tripMembers]);

  const handleSettleClick = (transaction = null) => {
    setDefaultTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleSaveSettlement = (data) => {
    addSettlement(id, data);
    setIsModalOpen(false);
    setDefaultTransaction(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const getMemberName = (mId) => tripMembers.find(m => m.id === mId)?.name || 'Unknown';

  return (
    <div className="page-container" style={{ padding: 'var(--space-8)' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: '80vh' }}>
        
        {/* Header - Not printed */}
        <div className="no-print" style={{ padding: 'var(--space-6) var(--space-6) 0', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: '1.8rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Handshake size={28} color="var(--color-primary)" /> Settle Up
            </h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handlePrint} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '8px 16px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, border: '1px solid var(--color-border)', cursor: 'pointer' }}>
                <Printer size={16} /> Print Report
              </button>
              <button onClick={() => handleSettleClick()} style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', color: 'white', padding: '8px 16px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                <DollarSign size={16} /> Record Payment
              </button>
            </div>
          </div>
          <TripNav tripId={trip.id} />
        </div>

        {/* Printable Content Area */}
        <div className="print-area" style={{ padding: 'var(--space-6)', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          
          <div className="print-only" style={{ display: 'none', marginBottom: '2rem' }}>
            <h2>{trip.title} - Expense Settlement Report</h2>
            <p>Generated on {new Date().toLocaleDateString()}</p>
            <hr />
          </div>

          {/* Optimal Transactions Section */}
          <section>
            <h3 style={{ margin: '0 0 var(--space-4) 0', fontSize: '1.4rem' }}>Suggested Transactions</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
              This is the most efficient way to settle all debts in the group, minimizing the number of total transactions required.
            </p>

            {optimalTransactions.length === 0 ? (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--color-success)', color: '#6ee7b7', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <CheckCircle size={48} />
                <h3 style={{ margin: 0 }}>You're all settled up!</h3>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)' }}>There are no outstanding debts among trip members.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {optimalTransactions.map((tx, idx) => (
                  <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    
                    {/* Visual Graph CSS */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.2)', border: '2px solid var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {tx.from.name.charAt(0)}
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{tx.from.name}</span>
                      </div>
                      
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '100px' }}>
                        <div style={{ fontWeight: 'bold', color: 'var(--color-text)', fontSize: '1.1rem', marginBottom: '4px' }}>
                          ${tx.amount.toFixed(2)}
                        </div>
                        <div style={{ width: '100%', height: '2px', background: 'var(--color-border)', position: 'relative' }}>
                          <ArrowRight size={16} color="var(--color-text-muted)" style={{ position: 'absolute', top: '50%', right: '-8px', transform: 'translateY(-50%)' }} />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>owes</div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', border: '2px solid var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {tx.to.name.charAt(0)}
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{tx.to.name}</span>
                      </div>
                    </div>

                    <div className="no-print">
                      <button onClick={() => handleSettleClick(tx)} style={{ background: 'var(--color-primary)', color: 'white', padding: '8px 24px', borderRadius: 'var(--radius-full)', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                        Record Payment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* History Section */}
          <section style={{ marginTop: 'var(--space-4)' }}>
            <h3 style={{ margin: '0 0 var(--space-4) 0', fontSize: '1.4rem' }}>Settlement History</h3>
            
            {settlements.length === 0 ? (
              <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', padding: 'var(--space-4)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                No payments have been recorded yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Sort history by newest first */}
                {[...settlements].sort((a,b) => new Date(b.date) - new Date(a.date)).map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--color-success)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '4px' }}>
                        {getMemberName(s.payerId)} paid {getMemberName(s.payeeId)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14}/> {new Date(s.date).toLocaleDateString()}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CreditCard size={14}/> {s.method}</span>
                        {s.notes && <span>• {s.notes}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--color-success)' }}>${s.amount.toFixed(2)}</span>
                      <button className="no-print" onClick={() => setConfirmDeleteId(s.id)} style={{ background: 'transparent', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '4px' }} title="Delete record" aria-label="Delete settlement record">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </motion.div>

      {/* CSS specific for printing */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .glass-panel { background: white !important; color: black !important; box-shadow: none !important; }
          * { color: black !important; }
        }
      `}</style>

      <SettlementModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setDefaultTransaction(null); }}
        onSave={handleSaveSettlement}
        tripMembers={tripMembers}
        defaultTransaction={defaultTransaction}
      />

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title="Delete Settlement Record?"
        message="This payment record will be permanently deleted from the settlement history."
        confirmLabel="Delete"
        onConfirm={() => { deleteSettlement(id, confirmDeleteId); setConfirmDeleteId(null); }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};

export default SettlementsPage;
