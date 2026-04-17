import { formatBudget, getCategoryIcon } from '../utils/itineraryHelpers.js';

const CATEGORY_COLORS = {
  accommodation: '#3b82f6',
  food: '#f59e0b',
  transport: '#10b981',
  activity: '#8b5cf6',
  shopping: '#ec4899',
  entertainment: '#f97316',
  other: '#64748b',
};

export default function BudgetTracker({ totalBudget = 0, expenses = [], currency = 'USD' }) {
  const spent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const remaining = totalBudget - spent;
  const pct = totalBudget > 0 ? Math.min(100, Math.round((spent / totalBudget) * 100)) : 0;

  const byCategory = expenses.reduce((acc, e) => {
    const cat = e.category || 'other';
    acc[cat] = (acc[cat] || 0) + (Number(e.amount) || 0);
    return acc;
  }, {});

  return (
    <div className="budget-tracker">
      <div className="bt-overview">
        <div className="bt-amounts">
          <div className="bt-amount-block">
            <span className="bt-label">Total Budget</span>
            <span className="bt-value">{formatBudget(totalBudget, currency)}</span>
          </div>
          <div className="bt-amount-block">
            <span className="bt-label">Spent</span>
            <span className="bt-value text-danger">{formatBudget(spent, currency)}</span>
          </div>
          <div className="bt-amount-block">
            <span className="bt-label">Remaining</span>
            <span className={`bt-value ${remaining < 0 ? 'text-danger' : 'text-success'}`}>{formatBudget(remaining, currency)}</span>
          </div>
        </div>
        <div className="bt-bar-row">
          <div className="progress-bar" style={{ height: '12px' }}>
            <div className="progress-fill" style={{ width: `${pct}%`, background: pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#2563eb' }} />
          </div>
          <span className="bt-pct">{pct}% used</span>
        </div>
      </div>

      {Object.keys(byCategory).length > 0 && (
        <div className="bt-breakdown">
          <h4 className="bt-breakdown-title">Breakdown by Category</h4>
          {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
            <div key={cat} className="bt-category-row">
              <span className="bt-cat-icon">{getCategoryIcon(cat)}</span>
              <span className="bt-cat-name">{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
              <div className="bt-cat-bar-wrap">
                <div className="progress-bar" style={{ height: '8px' }}>
                  <div className="progress-fill" style={{ width: `${spent > 0 ? Math.round((amt / spent) * 100) : 0}%`, background: CATEGORY_COLORS[cat] || '#64748b' }} />
                </div>
              </div>
              <span className="bt-cat-amount">{formatBudget(amt, currency)}</span>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .budget-tracker { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; }
        .bt-overview { margin-bottom: 1.25rem; }
        .bt-amounts { display: flex; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
        .bt-amount-block { display: flex; flex-direction: column; gap: 0.15rem; }
        .bt-label { font-size: 0.78rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; }
        .bt-value { font-size: 1.15rem; font-weight: 700; color: #1e293b; }
        .bt-bar-row { display: flex; align-items: center; gap: 0.75rem; }
        .bt-bar-row .progress-bar { flex: 1; }
        .bt-pct { font-size: 0.82rem; color: #64748b; white-space: nowrap; min-width: 60px; text-align: right; }
        .bt-breakdown-title { font-size: 0.92rem; font-weight: 600; margin-bottom: 0.75rem; color: #1e293b; }
        .bt-category-row { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.6rem; font-size: 0.85rem; }
        .bt-cat-icon { font-size: 1rem; flex-shrink: 0; }
        .bt-cat-name { width: 110px; color: #374151; flex-shrink: 0; }
        .bt-cat-bar-wrap { flex: 1; }
        .bt-cat-amount { width: 80px; text-align: right; font-weight: 600; color: #1e293b; flex-shrink: 0; }
      `}</style>
    </div>
  );
}
