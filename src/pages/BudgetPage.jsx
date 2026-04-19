import React, { useState, useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
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

const CATEGORY_COLORS = {
  'Accommodation': '#8b5cf6',
  'Food': '#ec4899',
  'Transport': '#3b82f6',
  'Activities': '#10b981',
  'Shopping': '#f59e0b',
  'Other': '#64748b'
};

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

  if (!trip) return <div className="page-container glass-panel"><h2 style={{textAlign: 'center', margin: 'auto'}}>Trip not found</h2></div>;

  // Derived Data Calculations
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const budgetLimit = trip.budget || 0;
  const isOverBudget = totalExpenses > budgetLimit;
  const percentUsed = budgetLimit > 0 ? Math.min((totalExpenses / budgetLimit) * 100, 100) : 0;
  
  const categoryData = useMemo(() => {
    const data = {};
    expenses.forEach(exp => {
      data[exp.category] = (data[exp.category] || 0) + exp.amount;
    });
    return Object.keys(data).map(name => ({ name, value: data[name] }));
  }, [expenses]);

  const barChartData = [
    { name: 'Budget', Budget: budgetLimit, Spent: 0 },
    { name: 'Spent', Budget: 0, Spent: totalExpenses }
  ];

  // Statistics
  const highestExpense = useMemo(() => {
    if (expenses.length === 0) return null;
    return expenses.reduce((max, exp) => exp.amount > max.amount ? exp : max, expenses[0]);
  }, [expenses]);

  const avgCostPerPerson = tripMembers.length > 0 ? (totalExpenses / tripMembers.length) : 0;
  const assumedBudgetPerPerson = tripMembers.length > 0 ? (budgetLimit / tripMembers.length) : 0;

  const tripDuration = trip.startDate && trip.endDate 
    ? Math.max(1, Math.ceil(Math.abs(new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)))
    : 1;
  const dailyBurnRate = totalExpenses / tripDuration;

  // Settle Up / Balances Logic
  const balances = useMemo(() => {
    const b = {};
    tripMembers.forEach(m => b[m.id] = { name: m.name, paid: 0, owes: 0 });
    
    expenses.forEach(exp => {
      if (b[exp.paidBy]) b[exp.paidBy].paid += exp.amount;
      exp.splits.forEach(split => {
        if (b[split.memberId]) b[split.memberId].owes += split.amountOwed;
      });
    });

    return Object.values(b).map(member => ({
      ...member,
      net: member.paid - member.owes
    })).sort((a, b) => b.net - a.net);
  }, [expenses, tripMembers]);

  // List Filtering and Sorting
  const processedExpenses = useMemo(() => {
    let result = [...expenses];
    if (debouncedSearch) {
      result = result.filter(e => e.description.toLowerCase().includes(debouncedSearch.toLowerCase()));
    }
    if (categoryFilter !== 'All') result = result.filter(e => e.category === categoryFilter);
    result.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });
    return result;
  }, [expenses, debouncedSearch, categoryFilter, sortBy]);

  const handleSaveExpense = (data) => {
    if (editingExpense) updateExpense(id, editingExpense.id, data);
    else addExpense(id, data);
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const handleSaveBudget = () => {
    updateTrip(id, { budget: Number(budgetInput) });
    setIsEditingBudget(false);
  };

  const getMemberName = (mId) => tripMembers.find(m => m.id === mId)?.name || 'Unknown';

  const exportCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Currency', 'Paid By', 'Split Type'];
    const rows = expenses.map(exp => [
      new Date(exp.date).toLocaleDateString(),
      `"${exp.description}"`,
      exp.category,
      exp.amount,
      exp.currency || 'USD',
      `"${getMemberName(exp.paidBy)}"`,
      exp.splitType
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${trip.title.replace(/\s+/g, '_')}_expenses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-container" style={{ padding: 'var(--space-8)' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: '80vh' }}>
        
        {/* Header */}
        <div className="no-print" style={{ padding: 'var(--space-6) var(--space-6) 0', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{trip.title} - Expenses & Budget</h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => window.print()} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '8px 16px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, border: '1px solid var(--color-border)', cursor: 'pointer' }}>
                <Printer size={16} /> Print
              </button>
              <button onClick={exportCSV} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '8px 16px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, border: '1px solid var(--color-border)', cursor: 'pointer' }}>
                <Download size={16} /> CSV
              </button>
              <button onClick={() => { setEditingExpense(null); setIsModalOpen(true); }} style={{ background: 'var(--color-success)', color: 'white', padding: '8px 16px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                <Plus size={16} /> Add Expense
              </button>
            </div>
          </div>
          <TripNav tripId={trip.id} />
        </div>

        {/* Printable Content Area */}
        <div className="print-area" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          <div className="print-only" style={{ display: 'none', padding: 'var(--space-6)', paddingBottom: 0 }}>
            <h2>{trip.title} - Budget Report</h2>
            <p>Generated on {new Date().toLocaleDateString()}</p>
            <hr />
          </div>

        {/* Alerts */}
        {isOverBudget && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', borderBottom: '1px solid rgba(239, 68, 68, 0.4)', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '12px', color: '#fca5a5' }}>
            <AlertTriangle size={20} />
            <strong>Over Budget Warning:</strong> You have exceeded your trip budget limit by ${(totalExpenses - budgetLimit).toFixed(2)}.
          </div>
        )}

        <div style={{ padding: 'var(--space-6)', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          {/* Top Summary Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', border: '1px solid var(--color-border)' }}>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Total Expenses</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{formatCurrency(totalExpenses)}</div>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Total Budget limit
                {!isEditingBudget && <button aria-label="Edit budget" onClick={() => setIsEditingBudget(true)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><Edit3 aria-hidden="true" size={14}/></button>}
              </div>
              {isEditingBudget ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input type="number" value={budgetInput} onChange={e => setBudgetInput(e.target.value)} style={{ width: '100%', padding: '4px 8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '4px', color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }} />
                  <button aria-label="Save budget" onClick={handleSaveBudget} style={{ background: 'var(--color-success)', border: 'none', color: 'white', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}><Check aria-hidden="true" size={16}/></button>
                </div>
              ) : (
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-text)' }}>{formatCurrency(budgetLimit)}</div>
              )}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', border: '1px solid var(--color-border)' }}>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Remaining Budget</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: isOverBudget ? 'var(--color-danger)' : 'var(--color-success)' }}>
                {formatCurrency(budgetLimit - totalExpenses)}
              </div>
            </div>

            {/* Budget Per Person */}
            {tripMembers.length > 0 && budgetLimit > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', border: '1px solid var(--color-border)' }}>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={14} /> Per Person
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-secondary)' }}>{formatCurrency(budgetLimit / tripMembers.length)}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{tripMembers.length} member{tripMembers.length > 1 ? 's' : ''}</div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {budgetLimit > 0 && (
            <div style={{ padding: '0 8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                <span>Budget Utilization</span>
                <span style={{ color: isOverBudget ? 'var(--color-danger)' : 'var(--color-text)' }}>{((totalExpenses / budgetLimit) * 100).toFixed(1)}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${percentUsed}%`, background: isOverBudget ? 'var(--color-danger)' : 'var(--color-primary)', transition: 'width 0.5s ease-out' }} />
              </div>
            </div>
          )}

          {/* Visualizations & Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
            
            {/* Donut Chart */}
            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', border: '1px solid var(--color-border)' }}>
              <h3 style={{ margin: '0 0 var(--space-4) 0', fontSize: '1.2rem' }}>Expenses by Category</h3>
              {categoryData.length > 0 ? (
                <div style={{ height: '250px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#ccc'} />)}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value.toFixed(2)}`} contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid var(--color-border)', borderRadius: '8px' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No expenses to chart.</div>
              )}
            </div>

            {/* Bar Chart & Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', border: '1px solid var(--color-border)' }}>
                <h3 style={{ margin: '0 0 var(--space-4) 0', fontSize: '1.2rem' }}>Budget vs Spent</h3>
                <div style={{ height: '150px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                      <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={12} />
                      <YAxis stroke="var(--color-text-muted)" fontSize={12} tickFormatter={(val) => `$${val}`} />
                      <Tooltip formatter={(value) => `$${value.toFixed(2)}`} cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid var(--color-border)', borderRadius: '8px' }} />
                      <Bar dataKey="Budget" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Spent" fill={isOverBudget ? 'var(--color-danger)' : 'var(--color-primary)'} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', border: '1px solid var(--color-border)' }}>
                <h3 style={{ margin: '0 0 var(--space-4) 0', fontSize: '1.2rem' }}>Quick Statistics</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Avg Cost per Person</span>
                    <span style={{ fontWeight: 'bold' }}>${avgCostPerPerson.toFixed(2)} <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>/ ${assumedBudgetPerPerson.toFixed(2)} budget</span></span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Highest Single Expense</span>
                    <span style={{ fontWeight: 'bold' }}>{highestExpense ? `$${highestExpense.amount.toFixed(2)}` : 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Est. Daily Burn Rate</span>
                    <span style={{ fontWeight: 'bold' }}>${dailyBurnRate.toFixed(2)} / day</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Balances / Settle Up */}
            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '0 0 var(--space-4) 0', fontSize: '1.2rem' }}>Member Balances</h3>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {balances.length > 0 ? balances.map((b, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontWeight: 600 }}>{b.name}</div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 'bold', color: b.net > 0 ? 'var(--color-success)' : b.net < 0 ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
                        {b.net > 0 ? `gets back $${b.net.toFixed(2)}` : b.net < 0 ? `owes $${Math.abs(b.net).toFixed(2)}` : 'settled up'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Paid: ${b.paid.toFixed(2)} | Share: ${b.owes.toFixed(2)}</div>
                    </div>
                  </div>
                )) : (
                  <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', textAlign: 'center', marginTop: '2rem' }}>No balances to show.</div>
                )}
              </div>
            </div>
          </div>

          {/* Expense List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '8px' }}><List size={20} /> All Expenses</h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: '200px' }}>
                  <Search size={14} color="var(--color-text-muted)" style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)' }} />
                  <input type="text" placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '6px 12px 6px 32px', borderRadius: 'var(--radius-full)', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', color: 'white', fontSize: '0.9rem' }} />
                </div>
                <div style={{ position: 'relative' }}>
                  <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ padding: '6px 12px 6px 32px', borderRadius: 'var(--radius-full)', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', color: 'white', appearance: 'none', fontSize: '0.9rem' }}>
                    <option value="All">All Categories</option>
                    {Object.keys(CATEGORY_COLORS).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <Filter size={14} color="var(--color-text-muted)" style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '6px 12px', borderRadius: 'var(--radius-full)', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', color: 'white', fontSize: '0.9rem' }}>
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="amount-desc">Highest Amount</option>
                  <option value="amount-asc">Lowest Amount</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {processedExpenses.length === 0 && (
                <EmptyState 
                  icon={search || categoryFilter !== 'All' ? Search : List}
                  title={search || categoryFilter !== 'All' ? "No expenses found" : "No expenses yet"}
                  message={search || categoryFilter !== 'All' ? "Try adjusting your search criteria or category filter." : "You haven't added any expenses to this trip yet."}
                  actionLabel={search || categoryFilter !== 'All' ? "Clear Filters" : "Add Expense"}
                  actionIcon={search || categoryFilter !== 'All' ? null : Plus}
                  onAction={() => {
                    if (search || categoryFilter !== 'All') {
                      setSearch(''); setCategoryFilter('All');
                    } else {
                      setEditingExpense(null); setIsModalOpen(true);
                    }
                  }}
                />
              )}
              
              <AnimatePresence>
                {processedExpenses.map(exp => {
                  const isExpanded = expandedId === exp.id;
                  return (
                    <motion.div 
                      key={exp.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => setExpandedId(prev => prev === exp.id ? null : exp.id)}
                      style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${isExpanded ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-lg)', cursor: 'pointer', overflow: 'hidden', transition: 'border-color 0.2s' }}
                    >
                      <div style={{ padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: EXPENSE_CATEGORIES[exp.category]?.bgColor || 'rgba(100,116,139,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                            {EXPENSE_CATEGORIES[exp.category]?.emoji || '📌'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{exp.description}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Calendar size={12} /> {new Date(exp.date).toLocaleDateString()} &bull; Paid by <strong style={{ color: 'var(--color-text)' }}>{getMemberName(exp.paidBy)}</strong>
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '1.3rem' }}>${exp.amount.toFixed(2)}</div>
                          {isExpanded ? <ChevronUp size={20} color="var(--color-text-muted)" /> : <ChevronDown size={20} color="var(--color-text-muted)" />}
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
                            <div style={{ padding: 'var(--space-4)', display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
                              
                              <div style={{ flex: 1, minWidth: '200px' }}>
                                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={14} /> Split Details ({exp.splitType})</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  {exp.splits.filter(s => s.amountOwed > 0).map(split => (
                                    <div key={split.memberId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                      <span>{getMemberName(split.memberId)}</span>
                                      <strong>${split.amountOwed.toFixed(2)}</strong>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div style={{ flex: 1, minWidth: '200px' }}>
                                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><AlignLeft size={14} /> Notes & Metadata</h4>
                                {exp.notes && <div style={{ fontSize: '0.9rem', marginBottom: '8px' }}>{exp.notes}</div>}
                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Added by: {exp.creator}</div>
                                {exp.receiptImage && (
                                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                    <a href={exp.receiptImage} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)', fontSize: '0.85rem', textDecoration: 'none' }}><ImageIcon size={14}/> View</a>
                                    <a href={exp.receiptImage} download="receipt" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}><Download size={14}/> Download</a>
                                  </div>
                                )}
                              </div>
                              
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'flex-start' }}>
                                <button onClick={(e) => { e.stopPropagation(); setEditingExpense(exp); setIsModalOpen(true); }} style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}><Edit2 size={14} /> Edit</button>
                                <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteExpenseId(exp.id); }} style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', background: 'rgba(239,68,68,0.2)', color: '#fca5a5', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}><Trash2 size={14} /> Delete</button>
                              </div>
                              
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
        </div>
      </motion.div>

      <ExpenseModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingExpense(null); }}
        onSave={handleSaveExpense}
        tripMembers={tripMembers}
        initialData={editingExpense}
      />

      <ConfirmDialog
        isOpen={!!confirmDeleteExpenseId}
        title="Delete Expense?"
        message="This expense and all its split data will be permanently removed."
        confirmLabel="Delete Expense"
        onConfirm={() => { deleteExpense(id, confirmDeleteExpenseId); setConfirmDeleteExpenseId(null); }}
        onCancel={() => setConfirmDeleteExpenseId(null)}
      />
    </div>
  );
};

export default BudgetPage;