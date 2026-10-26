import { useState, useContext, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, ArrowRight, Check, Wallet, Receipt, HandCoins } from 'lucide-react';
import { useTrip } from '../hooks/useTrip';
import { useAuth } from '../hooks/useAuth';
import { useTripPermissions } from '../hooks/useTripPermissions';
import { ExpenseContext } from '../contexts/ExpenseContext';
import TripNav from '../components/trip/TripNav';
import ExpenseModal from '../components/budget/ExpenseModal';
import SettlementModal from '../components/budget/SettlementModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { getSettlementSummary } from '../utils/settlements';
import { formatCurrency } from '../utils/formatters';
import '../styles/settlements.css';

const initials = name => (name || '?').split(' ').filter(Boolean).slice(0,2).map(s=>s[0]).join('');
const Avatar = ({ name }) => <span className="settle-avatar" aria-hidden="true">{initials(name)}</span>;

export default function SettlementsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { trips, tripsLoading, refreshTrips } = useTrip();
  const { getExpenses, loadExpenses, loadSettlements, getSettlements, addSettlement, updateSettlement, addExpense, deleteSettlement, expenseStatus, settlementStatus } = useContext(ExpenseContext);
  const trip = trips.find(t => (t._id || t.id) === id);
  const { canEdit } = useTripPermissions(trip);
  const expenses = getExpenses(id), payments = getSettlements(id);
  const members = useMemo(() => trip?.members || [], [trip?.members]);
  const summary = useMemo(() => getSettlementSummary(members, expenses, payments), [members, expenses, payments]);
  const myMember = members.find(m=>String(m.user?._id || m.user) === String(user?.id || user?._id));
  const myId = String(myMember?._id || myMember?.id || '');
  const myBalance = summary.balances.find(b=>b.id === myId);
  const [scope, setScope] = useState('mine');
  const [history, setHistory] = useState('payments');
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [chooserOpen, setChooserOpen] = useState(false);
  const [payment, setPayment] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  useEffect(() => { loadExpenses(id); loadSettlements(id); }, [id, loadExpenses, loadSettlements]);
  if (!trip) return <div className="page-container">{tripsLoading ? 'Loading trip…' : 'Trip not found.'}</div>;
  const ready = expenseStatus[id] === 'ready' && settlementStatus[id] === 'ready';
  const failed = expenseStatus[id] === 'error' || settlementStatus[id] === 'error';
  const valid = ready && !summary.issues.length;
  const money = n => formatCurrency(n, trip.currency);
  const mine = summary.transactions.filter(tx=>tx.from.id === myId || tx.to.id === myId);
  const visible = scope === 'mine' && myMember ? mine : summary.transactions;
  const net = myBalance?.net || 0;
  const beginPayment = tx => { setChooserOpen(false); setPayment(tx || {}); };
  const personName = person => person.id === myId ? 'You' : person.name;
  const paymentRow = (tx, choose = false) => <div className="settle-person-row" key={`${tx.from.id}-${tx.to.id}`}>
    <Avatar name={tx.from.id === myId ? tx.to.name : tx.from.name} />
    <div className="settle-person-copy"><strong>{personName(tx.from)} {tx.from.id === myId ? 'owe' : 'owes'} {tx.to.id === myId ? 'you' : tx.to.name}</strong><span className={tx.from.id === myId ? 'settle-owe' : 'settle-positive'}>{money(tx.amount)}</span></div>
    <button className="settle-outline" disabled={!canEdit} onClick={()=>beginPayment(tx)} aria-label={`${choose ? 'Choose payment' : 'Settle up'} from ${tx.from.name} to ${tx.to.name}`}>{choose ? <ArrowRight size={18} /> : 'Settle up'}</button>
  </div>;
  return <div className="page-container animate-fade-in settle-page">
    <div className="settle-heading"><div><span className="settle-eyebrow">SHARED TRIP EXPENSES</span><h1>Settle up</h1><p className="text-muted mb-0">{trip.title} · {members.length} members</p></div><div className="d-flex flex-wrap gap-2">
      <button className="settle-add" disabled={!canEdit || !members.length} onClick={()=>setExpenseOpen(true)}><Plus size={17} /> Add expense</button>
      <button className="settle-primary" disabled={!canEdit || members.length < 2 || !ready} onClick={()=>setChooserOpen(true)}><HandCoins size={18} /> Settle up</button>
    </div></div>
    <TripNav tripId={id} />
    {!canEdit && <p className="text-muted small mt-3">You have view-only access. A trip editor can add expenses and record payments.</p>}
    <div className="settle-summary" aria-label="Balance summary">
      <div><span>{myMember ? 'Your total balance' : 'Group outstanding'}</span><strong className={!valid ? '' : net < 0 && myMember ? 'settle-owe' : 'settle-positive'}>{!valid ? '—' : myMember ? `${net < 0 ? '−' : net > 0 ? '+' : ''}${money(Math.abs(net))}` : money(summary.transactions.reduce((n,t)=>n+t.amount,0))}</strong><small>{!valid ? 'Waiting for verified balances' : !myMember ? 'Across all members' : net > 0 ? 'You get back' : net < 0 ? 'You owe' : 'You’re settled up'}</small></div>
      <div><span>You owe</span><strong className="settle-owe">{valid && myMember ? money(Math.max(0,-net)) : '—'}</strong><small>After recorded payments</small></div>
      <div><span>You are owed</span><strong className="settle-positive">{valid && myMember ? money(Math.max(0,net)) : '—'}</strong><small>After recorded payments</small></div>
    </div>
    {!ready ? <div className="settle-panel p-4" role={failed ? 'alert' : 'status'}>{failed ? <>Could not load balances. <button className="btn btn-link" onClick={()=>{loadExpenses(id);loadSettlements(id);}}>Retry</button></> : 'Loading balances…'}</div> : <>
      {summary.issues.length > 0 && <div role="alert" className="alert alert-warning">{summary.issues.join(' ')} Correct the affected expenses or edit payment participants below to restore balance suggestions. <Link to={`/trip/${id}/budget`}>Review expenses</Link></div>}
      <div className="settle-layout"><div>
        <section className="settle-panel mb-4" aria-labelledby="balances-title">
          <div className="settle-panel-heading"><h2 id="balances-title">Balances</h2><div className="settle-switch" role="group" aria-label="Balance view">{myMember && <button aria-pressed={scope === 'mine'} onClick={()=>setScope('mine')}>You</button>}<button aria-pressed={scope === 'group' || !myMember} onClick={()=>setScope('group')}>Whole group</button></div></div>
          {!valid ? <p className="p-4 text-muted">Fix the records above to see who owes whom.</p> : visible.length ? visible.map(tx=>paymentRow(tx)) : <div className="settle-empty"><span className="settle-check"><Check size={26} /></span><h3>{scope === 'mine' && myMember ? 'You’re all settled up' : 'Everyone is settled up'}</h3><p>{scope === 'mine' && summary.transactions.length ? 'Other members still have balances. Select Whole group to see them.' : 'No outstanding balances. Add an expense when your next trip purchase comes along.'}</p></div>}
          <div className="settle-footnote">Balances are simplified across the group to reduce payments. Everyone’s total stays the same.</div>
        </section>
        <section className="settle-panel" aria-labelledby="history-title">
          <div className="settle-panel-heading"><h2 id="history-title">Activity</h2><div className="settle-switch" role="group" aria-label="Activity view"><button aria-pressed={history === 'payments'} onClick={()=>setHistory('payments')}>Payments ({payments.length})</button><button aria-pressed={history === 'expenses'} onClick={()=>setHistory('expenses')}>Expenses ({expenses.length})</button></div></div>
          {history === 'payments' ? !payments.length ? <div className="settle-empty"><Wallet size={26} /><h3>No payments yet</h3><p>Already paid someone back? Record it with Settle up.</p></div> : [...payments].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(p=><div className="settle-history-row" key={p._id || p.id}>
            <span className="settle-history-icon"><Check size={18}/></span><div className="settle-person-copy"><strong>{p.payerName || 'Unknown member'} paid {p.payeeName || 'Unknown member'}</strong><small>{new Date(p.date).toLocaleDateString()} {p.method && `· ${p.method}`}</small>{p.notes && <small>{p.notes}</small>}{[p.payerId,p.payeeId].some(value=>!members.some(m=>[String(m._id),String(m.user || '')].includes(String(value)))) && <small className="text-warning">Check participants · member IDs need repair</small>}
              <div className="settle-history-actions"><button disabled={!canEdit} onClick={()=>setPayment({initialData:p})} aria-label={`Edit payment from ${p.payerName}`}>Edit</button><button disabled={!canEdit} onClick={()=>setDeleteId(p._id || p.id)} aria-label={`Undo payment from ${p.payerName} to ${p.payeeName}`}>Undo</button></div>
            </div><strong className="settle-history-amount settle-positive">{money(p.amount)}</strong>
          </div>) : !expenses.length ? <div className="settle-empty"><Receipt size={26}/><h3>No expenses yet</h3><p>Add your first shared expense to start tracking balances.</p></div> : [...expenses].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(e=><div className="settle-history-row" key={e._id || e.id}><span className="settle-history-icon"><Receipt size={18}/></span><div className="settle-person-copy"><strong>{e.description}</strong><small>{e.paidBy?.name || 'Unknown member'} paid · {new Date(e.date).toLocaleDateString()}</small></div><strong className="settle-history-amount">{money(e.amount)}</strong></div>)}
          <Link className="settle-footer-link" to={`/trip/${id}/budget`}>View and edit all expenses <ArrowRight size={15}/></Link>
        </section>
      </div><aside className="settle-panel settle-sidebar" aria-labelledby="group-title"><div className="settle-panel-heading"><h2 id="group-title">Group balances</h2></div>{summary.balances.map(b=><div className="settle-member" key={b.id}><Avatar name={b.name}/><div><strong>{b.id === myId ? `${b.name} (you)` : b.name}</strong><small className={!valid ? 'text-muted' : b.net < 0 ? 'settle-owe' : 'settle-positive'}>{!valid ? 'Needs review' : b.net > 0 ? `Gets back ${money(b.net)}` : b.net < 0 ? `Owes ${money(-b.net)}` : 'Settled up'}</small></div></div>)}<div className="settle-side-total"><span>Trip spending</span><strong>{money(expenses.reduce((n,e)=>n+Number(e.amount || 0),0))}</strong><small>Repayments don’t change this total.</small></div><Link className="settle-footer-link" to={`/trip/${id}/members`}>Manage members <ArrowRight size={15}/></Link></aside></div>
    </>}
    {chooserOpen && <><div className="modal-backdrop show"/><div className="modal d-block" role="dialog" aria-modal="true" aria-labelledby="choose-payment-title"><div className="modal-dialog modal-dialog-centered modal-dialog-scrollable"><div className="modal-content"><div className="modal-header"><h2 className="modal-title fs-5" id="choose-payment-title">Settle up</h2><button className="btn-close btn-close-white" aria-label="Close" onClick={()=>setChooserOpen(false)}/></div><div className="modal-body"><p className="text-muted">Choose a balance to record a full or partial repayment.</p>{valid && summary.transactions.length ? [...mine,...summary.transactions.filter(tx=>!mine.includes(tx))].map(tx=>paymentRow(tx,true)) : <p>{valid ? 'No outstanding balances.' : 'Balance suggestions are unavailable until the affected records are fixed.'}</p>}<button className="btn btn-link mt-3" onClick={()=>beginPayment()}>Record a different payment</button></div></div></div></div></>}
    {expenseOpen && <ExpenseModal isOpen tripMembers={members} currency={trip.currency} onClose={()=>setExpenseOpen(false)} onSave={async data=>{await addExpense(id,data);await refreshTrips();setExpenseOpen(false);}} />}
    {payment && <SettlementModal initialData={payment.initialData} currency={trip.currency} tripMembers={members} defaultTransaction={payment.from ? payment : null} onClose={()=>setPayment(null)} onSave={async data=>{if(payment.initialData) await updateSettlement(id,payment.initialData._id,data);else await addSettlement(id,data);setPayment(null);}} />}
    <ConfirmDialog isOpen={!!deleteId} title="Undo recorded payment?" message="This removes the payment record and restores the balances. It does not reverse a money transfer." confirmLabel="Undo payment" onCancel={()=>setDeleteId(null)} onConfirm={async()=>{await deleteSettlement(id,deleteId);setDeleteId(null);}} />
  </div>;
}
