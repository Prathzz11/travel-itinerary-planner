import React, { useState, useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { DollarSign, Plus, List, Filter, ChevronDown, ChevronUp, Edit2, Trash2, Tag, Calendar, User, AlignLeft, Search, AlertTriangle, Download, Edit3, Check, Users, Printer } from 'lucide-react';
import { useTrip } from '../hooks/useTrip';
import { useDebounce } from '../hooks/useDebounce';
import { ExpenseContext } from '../contexts/ExpenseContext';
import { useAuth } from '../contexts/AuthContext';
import { EXPENSE_CATEGORIES, getBudgetStatus } from '../utils/categoryConfig';
import { formatCurrency } from '../utils/formatters';
import TripNav from '../components/trip/TripNav';
import ExpenseModal from '../components/budget/ExpenseModal';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const CATEGORY_COLORS = { 'Accommodation': '#8b5cf6', 'Food': '#ec4899', 'Transport': '#3b82f6', 'Activities': '#10b981', 'Shopping': '#f59e0b', 'Other': '#64748b' };

const BudgetPage = () => {
  const { id } = useParams();
  const { trips, updateTrip } = useTrip();
  const { user } = useAuth();
  const { getExpenses, addExpense, updateExpense, deleteExpense } = useContext(ExpenseContext);
  
  const trip = trips?.find(t => t.id === id);
  const expenses = getExpenses(id);
  const tripMembers = trip?.members || [];
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(trip?.budget || 0);
  const [confirmDeleteExpenseId, setConfirmDeleteExpenseId] = useState(null);

  if (!trip) return <div className="page-container"><div className="card text-center py-5"><h2>Trip not found</h2></div></div>;

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const budgetLimit = trip.budget || 0;
  const isOverBudget = totalExpenses > budgetLimit;
  const percentUsed = budgetLimit > 0 ? Math.min((totalExpenses / budgetLimit) * 100, 100) : 0;
  
  const categoryData = useMemo(() => {
    const data = {};
    expenses.forEach(exp => { data[exp.category] = (data[exp.category] || 0) + exp.amount; });
    return Object.keys(data).map(name => ({ name, value: data[name] }));
  }, [expenses]);

  const highestExpense = useMemo(() => expenses.length === 0 ? null : expenses.reduce((max, exp) => exp.amount > max.amount ? exp : max, expenses[0]), [expenses]);
  const avgCostPerPerson = tripMembers.length > 0 ? (totalExpenses / tripMembers.length) : 0;
  const assumedBudgetPerPerson = tripMembers.length > 0 ? (budgetLimit / tripMembers.length) : 0;
  const tripDuration = trip.startDate && trip.endDate ? Math.max(1, Math.ceil(Math.abs(new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24))) : 1;
  const dailyBurnRate = totalExpenses / tripDuration;

  const balances = useMemo(() => {
    const b = {};
    tripMembers.forEach(m => b[m.id] = { name: m.name, paid: 0, owes: 0 });
    expenses.forEach(exp => { if (b[exp.paidBy]) b[exp.paidBy].paid += exp.amount; exp.splits.forEach(split => { if (b[split.memberId]) b[split.memberId].owes += split.amountOwed; }); });
    return Object.values(b).map(member => ({ ...member, net: member.paid - member.owes })).sort((a, b) => b.net - a.net);
  }, [expenses, tripMembers]);

  const processedExpenses = useMemo(() => {
    let result = [...expenses];
    if (debouncedSearch) result = result.filter(e => e.description.toLowerCase().includes(debouncedSearch.toLowerCase()));
    if (categoryFilter !== 'All') result = result.filter(e => e.category === categoryFilter);
    result.sort((a, b) => { if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date); if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date); if (sortBy === 'amount-desc') return b.amount - a.amount; if (sortBy === 'amount-asc') return a.amount - b.amount; return 0; });
    return result;
  }, [expenses, debouncedSearch, categoryFilter, sortBy]);

  const handleSaveExpense = (data) => { if (editingExpense) updateExpense(id, editingExpense.id, data); else addExpense(id, data); setIsModalOpen(false); setEditingExpense(null); };
  const handleSaveBudget = () => { updateTrip(id, { budget: Number(budgetInput) }); setIsEditingBudget(false); };
  const getMemberName = (mId) => tripMembers.find(m => m.id === mId)?.name || 'Unknown';

  const exportCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Currency', 'Paid By', 'Split Type'];
    const rows = expenses.map(exp => [new Date(exp.date).toLocaleDateString(), `"${exp.description}"`, exp.category, exp.amount, exp.currency || 'USD', `"${getMemberName(exp.paidBy)}"`, exp.splitType]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a"); link.setAttribute("href", encodeURI(csvContent)); link.setAttribute("download", `${trip.title.replace(/\s+/g, '_')}_expenses.csv`); document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="card" style={{ minHeight: '80vh' }}>
        <div className="card-header no-print">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="fs-3 mb-0">{trip.title} - Budget</h2>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={() => window.print()}><Printer size={14} /> Print</button>
              <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={exportCSV}><Download size={14} /> CSV</button>
              <button className="btn btn-success btn-sm d-flex align-items-center gap-1" onClick={() => { setEditingExpense(null); setIsModalOpen(true); }}><Plus size={14} /> Add Expense</button>
            </div>
          </div>
          <TripNav tripId={trip.id} />
        </div>

        <div className="card-body">
          {/* Over Budget Alert */}
          {isOverBudget && <div className="alert alert-danger d-flex align-items-center gap-2 mb-4"><AlertTriangle size={20} /><strong>Over Budget:</strong> Exceeded by ${(totalExpenses - budgetLimit).toFixed(2)}.</div>}

          {/* Summary Stats */}
          <div className="row g-3 mb-4">
            <div className="col-md-3"><div className="card"><div className="card-body"><div className="text-muted small">Total Expenses</div><div className="fs-3 fw-bold" style={{ color: 'var(--color-primary)' }}>{formatCurrency(totalExpenses)}</div></div></div></div>
            <div className="col-md-3"><div className="card"><div className="card-body">
              <div className="d-flex justify-content-between"><span className="text-muted small">Budget</span>{!isEditingBudget && <button className="btn btn-link p-0 text-muted" onClick={() => setIsEditingBudget(true)}><Edit3 size={12} /></button>}</div>
              {isEditingBudget ? <div className="input-group mt-1"><input type="number" className="form-control form-control-sm" value={budgetInput} onChange={e => setBudgetInput(e.target.value)} /><button className="btn btn-success btn-sm" onClick={handleSaveBudget}><Check size={14} /></button></div> : <div className="fs-3 fw-bold">{formatCurrency(budgetLimit)}</div>}
            </div></div></div>
            <div className="col-md-3"><div className="card"><div className="card-body"><div className="text-muted small">Remaining</div><div className="fs-3 fw-bold" style={{ color: isOverBudget ? 'var(--color-danger)' : 'var(--color-success)' }}>{formatCurrency(budgetLimit - totalExpenses)}</div></div></div></div>
            {tripMembers.length > 0 && budgetLimit > 0 && <div className="col-md-3"><div className="card"><div className="card-body"><div className="text-muted small d-flex align-items-center gap-1"><Users size={12} /> Per Person</div><div className="fs-3 fw-bold" style={{ color: 'var(--color-secondary)' }}>{formatCurrency(budgetLimit / tripMembers.length)}</div><div className="text-muted" style={{ fontSize: '0.75rem' }}>{tripMembers.length} member{tripMembers.length > 1 ? 's' : ''}</div></div></div></div>}
          </div>

          {/* Budget Progress */}
          {budgetLimit > 0 && (
            <div className="mb-4">
              <div className="d-flex justify-content-between small text-muted mb-1"><span>Budget Utilization</span><span style={{ color: isOverBudget ? 'var(--color-danger)' : undefined }}>{((totalExpenses / budgetLimit) * 100).toFixed(1)}%</span></div>
              <div className="progress" style={{ height: 8 }}><div className="progress-bar" style={{ width: `${percentUsed}%`, background: isOverBudget ? 'var(--color-danger)' : 'var(--color-primary)' }} /></div>
            </div>
          )}

          {/* Category Breakdown + Stats */}
          <div className="row g-4 mb-4">
            <div className="col-md-6">
              <div className="card"><div className="card-body">
                <h6 className="mb-3">Expenses by Category</h6>
                {categoryData.length > 0 ? (
                  <div className="d-flex flex-column gap-2">
                    {categoryData.sort((a,b) => b.value - a.value).map(item => {
                      const pct = totalExpenses > 0 ? (item.value / totalExpenses * 100) : 0;
                      return (
                        <div key={item.name}>
                          <div className="d-flex justify-content-between small mb-1"><span>{item.name}</span><span className="fw-semibold">${item.value.toFixed(2)} ({pct.toFixed(0)}%)</span></div>
                          <div className="progress" style={{ height: 6 }}><div className="progress-bar" style={{ width: `${pct}%`, background: CATEGORY_COLORS[item.name] || '#ccc' }} /></div>
                        </div>
                      );
                    })}
                  </div>
                ) : <div className="text-center text-muted py-4 fst-italic">No expenses to chart.</div>}
              </div></div>
            </div>
            <div className="col-md-3">
              <div className="card h-100"><div className="card-body">
                <h6 className="mb-3">Quick Statistics</h6>
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex justify-content-between border-bottom pb-2"><span className="text-muted small">Avg/Person</span><span className="fw-semibold">${avgCostPerPerson.toFixed(2)}</span></div>
                  <div className="d-flex justify-content-between border-bottom pb-2"><span className="text-muted small">Highest</span><span className="fw-semibold">{highestExpense ? `$${highestExpense.amount.toFixed(2)}` : 'N/A'}</span></div>
                  <div className="d-flex justify-content-between"><span className="text-muted small">Daily Rate</span><span className="fw-semibold">${dailyBurnRate.toFixed(2)}/day</span></div>
                </div>
              </div></div>
            </div>
            <div className="col-md-3">
              <div className="card h-100"><div className="card-body">
                <h6 className="mb-3">Member Balances</h6>
                {balances.length > 0 ? balances.map((b, i) => (
                  <div key={i} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <span className="fw-semibold small">{b.name}</span>
                    <span className="small fw-bold" style={{ color: b.net > 0 ? 'var(--color-success)' : b.net < 0 ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>{b.net > 0 ? `+$${b.net.toFixed(2)}` : b.net < 0 ? `-$${Math.abs(b.net).toFixed(2)}` : 'settled'}</span>
                  </div>
                )) : <div className="text-muted fst-italic small text-center mt-3">No balances.</div>}
              </div></div>
            </div>
          </div>

          {/* Expense List */}
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
            <h5 className="mb-0 d-flex align-items-center gap-2"><List size={18} /> All Expenses</h5>
            <div className="d-flex gap-2">
              <input type="text" className="form-control form-control-sm" style={{ maxWidth: 200 }} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
              <select className="form-select form-select-sm" style={{ maxWidth: 150 }} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}><option value="All">All Categories</option>{Object.keys(CATEGORY_COLORS).map(cat => <option key={cat} value={cat}>{cat}</option>)}</select>
              <select className="form-select form-select-sm" style={{ maxWidth: 150 }} value={sortBy} onChange={e => setSortBy(e.target.value)}><option value="date-desc">Newest</option><option value="date-asc">Oldest</option><option value="amount-desc">Highest</option><option value="amount-asc">Lowest</option></select>
            </div>
          </div>

          {processedExpenses.length === 0 && <EmptyState icon={search || categoryFilter !== 'All' ? Search : List} title={search || categoryFilter !== 'All' ? "No expenses found" : "No expenses yet"} message={search || categoryFilter !== 'All' ? "Try adjusting your filters." : "Add your first expense to get started."} actionLabel={search || categoryFilter !== 'All' ? "Clear Filters" : "Add Expense"} actionIcon={search || categoryFilter !== 'All' ? null : Plus} onAction={() => { if (search || categoryFilter !== 'All') { setSearch(''); setCategoryFilter('All'); } else { setEditingExpense(null); setIsModalOpen(true); }}} />}

          <div className="d-flex flex-column gap-2">
            {processedExpenses.map(exp => {
              const isExpanded = expandedId === exp.id;
              return (
                <div key={exp.id} className="card animate-fade-in" onClick={() => setExpandedId(prev => prev === exp.id ? null : exp.id)} style={{ cursor: 'pointer', borderColor: isExpanded ? 'var(--color-primary)' : undefined }}>
                  <div className="card-body py-3 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, background: EXPENSE_CATEGORIES[exp.category]?.bgColor || 'rgba(100,116,139,0.2)', fontSize: '1.2rem' }}>{EXPENSE_CATEGORIES[exp.category]?.emoji || '📌'}</div>
                      <div><div className="fw-bold">{exp.description}</div><div className="text-muted small d-flex align-items-center gap-1"><Calendar size={12} /> {new Date(exp.date).toLocaleDateString()} • Paid by <strong>{getMemberName(exp.paidBy)}</strong></div></div>
                    </div>
                    <div className="d-flex align-items-center gap-3"><span className="fw-bold fs-5">${exp.amount.toFixed(2)}</span>{isExpanded ? <ChevronUp size={18} className="text-muted" /> : <ChevronDown size={18} className="text-muted" />}</div>
                  </div>
                  {isExpanded && (
                    <div className="card-footer border-top animate-fade-in">
                      <div className="d-flex gap-4 flex-wrap">
                        <div className="flex-grow-1"><h6 className="text-muted small d-flex align-items-center gap-1 mb-2"><Users size={14} /> Split ({exp.splitType})</h6>{exp.splits.filter(s => s.amountOwed > 0).map(split => <div key={split.memberId} className="d-flex justify-content-between small"><span>{getMemberName(split.memberId)}</span><strong>${split.amountOwed.toFixed(2)}</strong></div>)}</div>
                        <div className="flex-grow-1"><h6 className="text-muted small mb-2">Notes</h6>{exp.notes && <div className="small mb-2">{exp.notes}</div>}<div className="text-muted small">Added by: {exp.creator}</div></div>
                        <div className="d-flex flex-column gap-2"><button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={e => { e.stopPropagation(); setEditingExpense(exp); setIsModalOpen(true); }}><Edit2 size={14} /> Edit</button><button className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1" onClick={e => { e.stopPropagation(); setConfirmDeleteExpenseId(exp.id); }}><Trash2 size={14} /> Delete</button></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ExpenseModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingExpense(null); }} onSave={handleSaveExpense} tripMembers={tripMembers} initialData={editingExpense} />
      <ConfirmDialog isOpen={!!confirmDeleteExpenseId} title="Delete Expense?" message="This expense and all split data will be permanently removed." confirmLabel="Delete Expense" onConfirm={() => { deleteExpense(id, confirmDeleteExpenseId); setConfirmDeleteExpenseId(null); }} onCancel={() => setConfirmDeleteExpenseId(null)} />
    </div>
  );
};

export default BudgetPage;