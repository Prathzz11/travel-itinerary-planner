import React, { useState, useContext, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTrip } from '../hooks/useTrip';
import { useTripPermissions } from '../hooks/useTripPermissions';
import { ExpenseContext } from '../contexts/ExpenseContext';
import TripNav from '../components/trip/TripNav';
import ExpenseModal from '../components/budget/ExpenseModal';
import SettlementModal from '../components/budget/SettlementModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { getSettlementSummary } from '../utils/settlements';
import { formatCurrency } from '../utils/formatters';

const SettlementsPage = () => {
  const { id } = useParams();
  const { trips, tripsLoading, refreshTrips } = useTrip();
  const { getExpenses, loadExpenses, loadSettlements, getSettlements, addSettlement, updateSettlement, addExpense, deleteSettlement, expenseStatus, settlementStatus } = useContext(ExpenseContext);
  const trip = trips.find(t => (t._id || t.id) === id);
  const { canEdit } = useTripPermissions(trip);
  const expenses = getExpenses(id), payments = getSettlements(id);
  const members = useMemo(() => trip?.members || [], [trip?.members]);
  const summary = useMemo(() => getSettlementSummary(members, expenses, payments), [members, expenses, payments]);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [payment, setPayment] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  useEffect(() => { loadExpenses(id); loadSettlements(id); }, [id, loadExpenses, loadSettlements]);
  if (!trip) return <div className="page-container">{tripsLoading ? 'Loading trip…' : 'Trip not found.'}</div>;
  const ready = expenseStatus[id] === 'ready' && settlementStatus[id] === 'ready';
  const failed = expenseStatus[id] === 'error' || settlementStatus[id] === 'error';
  const money = n => formatCurrency(n, trip.currency);
  return <div className="page-container animate-fade-in"><div className="card">
    <div className="card-header"><h1 className="fs-3">Settle Up</h1><p className="text-muted">{trip.title} · See who owes money and record payments.</p><TripNav tripId={id} /></div>
    <div className="card-body">
      <div className="d-flex flex-wrap gap-2 mb-3">
        <button className="btn btn-primary" disabled={!canEdit || !members.length} onClick={()=>setExpenseOpen(true)}>Add expense</button>
        <button className="btn btn-outline-primary" disabled={!canEdit || members.length < 2} onClick={()=>setPayment({})}>Record payment</button>
        <Link className="btn btn-outline-secondary" to={`/trip/${id}/budget`}>View all expenses</Link>
        {members.length < 2 && <Link className="btn btn-link" to={`/trip/${id}/members`}>Add members to split expenses</Link>}
      </div>
      <p className="text-muted small">Add an expense for a trip purchase. Record a payment when one member repays another. Shared expenses are settled through each member’s overall balance.</p>
      {!ready ? <div role={failed ? 'alert' : 'status'}>{failed ? <>Could not load balances. <button className="btn btn-outline-primary" onClick={() => { loadExpenses(id); loadSettlements(id); }}>Retry</button></> : 'Loading balances…'}</div> : <>
        {summary.issues.length > 0 ? <div role="alert" className="alert alert-warning">Some records need attention. {summary.issues.join(' ')} Use Edit on payments marked “Check participants” to confirm the correct people. Suggested payments are paused until these records are fixed. <Link to={`/trip/${id}/budget`}>Review expenses</Link></div> : <>
          <div className="d-flex align-items-center justify-content-between gap-3 mb-3"><h2 className="fs-5 mb-0">Who owes whom</h2></div>
          {summary.transactions.length ? <div className="d-flex flex-column gap-3 mb-4">{summary.transactions.map(tx => <div key={`${tx.from.id}-${tx.to.id}`} className="border rounded p-3 d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div><strong>{tx.from.name}</strong> pays <strong>{tx.to.name}</strong><div className="fs-4 fw-bold">{money(tx.amount)}</div></div>
            <button className="btn btn-primary" disabled={!canEdit} onClick={() => setPayment(tx)} aria-label={`Record payment from ${tx.from.name} to ${tx.to.name}`}>Record payment</button>
          </div>)}</div> : <div className="alert alert-success">All settled up. No outstanding balances.</div>}
          <p className="text-muted small">Record payments after money changes hands. Payments reduce balances, not trip expenses.</p>
        </>}
        <details className="mb-4"><summary className="fw-semibold">Member balances</summary><p className="text-muted small">{summary.issues.length ? 'These balances are incomplete until the records above are corrected.' : 'Balances include all shared expenses and recorded payments.'}</p><div className="mt-2">{summary.balances.map(b => <div key={b.id} className="d-flex justify-content-between gap-3 border-bottom py-2"><span>{b.name}</span><span>{b.net > 0 ? `Gets back ${money(b.net)}` : b.net < 0 ? `Owes ${money(-b.net)}` : 'Settled'}</span></div>)}</div></details>
        <h2 className="fs-5">Recorded payments</h2>
        {!payments.length ? <p className="text-muted">No payments recorded yet.</p> : <div className="d-flex flex-column gap-2">{[...payments].sort((a,b) => new Date(b.date)-new Date(a.date)).map(p => <div key={p._id || p.id} className="border rounded p-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>{[p.payerId,p.payeeId].some(value=>!members.some(m=>[String(m._id),String(m.user || '')].includes(String(value)))) && <div className="text-warning small fw-semibold">Check participants · saved member IDs no longer match this trip</div>}<strong>{p.payerName || 'Unknown member'}</strong> paid <strong>{p.payeeName || 'Unknown member'}</strong><div className="small text-muted">{new Date(p.date).toLocaleDateString()}{p.method && ` · ${p.method}`}{p.notes && ` · ${p.notes}`}</div></div>
          <div className="d-flex gap-3 align-items-center"><strong>{money(p.amount)}</strong><button disabled={!canEdit} className="btn btn-outline-primary btn-sm" onClick={()=>setPayment({ initialData:p })} aria-label={`Edit payment from ${p.payerName || 'unknown member'}`}>Edit</button><button disabled={!canEdit} className="btn btn-outline-secondary btn-sm" onClick={() => setDeleteId(p._id || p.id)} aria-label={`Undo payment from ${p.payerName} to ${p.payeeName}`}>Undo</button></div>
        </div>)}</div>}
      </>}
    </div>
  </div>
  {expenseOpen && <ExpenseModal isOpen tripMembers={members} currency={trip.currency} onClose={()=>setExpenseOpen(false)} onSave={async data=>{await addExpense(id,data);await refreshTrips();setExpenseOpen(false);}} />}
  {payment && <SettlementModal initialData={payment.initialData} currency={trip.currency} tripMembers={members} defaultTransaction={payment.from ? payment : null} onClose={() => setPayment(null)} onSave={async data => { if(payment.initialData) await updateSettlement(id,payment.initialData._id,data); else await addSettlement(id,data); setPayment(null); }} />}
  <ConfirmDialog isOpen={!!deleteId} title="Undo recorded payment?" message="This removes the payment record and restores the balances. It does not reverse a money transfer." confirmLabel="Undo payment" onCancel={() => setDeleteId(null)} onConfirm={async () => { await deleteSettlement(id,deleteId); setDeleteId(null); }} />
  </div>;
};
export default SettlementsPage;
