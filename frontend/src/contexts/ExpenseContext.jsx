import React, { createContext, useState, useCallback, useMemo } from 'react';
import { useNotification } from './NotificationContext';
import {
  getExpenses as apiGetExpenses,
  createExpense as apiCreateExpense,
  updateExpense as apiUpdateExpense,
  deleteExpense as apiDeleteExpense
} from '../services/expenseService';

export const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const { addNotification } = useNotification();

  // Cache: { [tripId]: expense[] }
  const [expenseCache, setExpenseCache] = useState({});
  // Settlements remain local (derived calculation, not persisted separately)
  const [settlements, setSettlements] = useState({});

  const loadExpenses = useCallback(async (tripId) => {
    try {
      const res = await apiGetExpenses(tripId);
      setExpenseCache(prev => ({ ...prev, [tripId]: res.data }));
      return res.data;
    } catch (err) {
      console.error('Failed to load expenses:', err);
      return [];
    }
  }, []);

  const getExpenses = useCallback((tripId) => expenseCache[tripId] || [], [expenseCache]);
  const getSettlements = useCallback((tripId) => settlements[tripId] || [], [settlements]);

  const addExpense = useCallback(async (tripId, expenseData) => {
    try {
      const res = await apiCreateExpense(tripId, expenseData);
      setExpenseCache(prev => ({
        ...prev,
        [tripId]: [...(prev[tripId] || []), res.data]
      }));
      addNotification('Expense added', 'success');
      return res.data;
    } catch (err) {
      addNotification(err.userMessage || 'Failed to add expense', 'error');
      throw err;
    }
  }, [addNotification]);

  const updateExpense = useCallback(async (tripId, expenseId, updatedData) => {
    try {
      const res = await apiUpdateExpense(tripId, expenseId, updatedData);
      setExpenseCache(prev => ({
        ...prev,
        [tripId]: (prev[tripId] || []).map(e =>
          (e._id === expenseId || e.id === expenseId) ? res.data : e
        )
      }));
      addNotification('Expense updated', 'success');
      return res.data;
    } catch (err) {
      addNotification(err.userMessage || 'Failed to update expense', 'error');
      throw err;
    }
  }, [addNotification]);

  const deleteExpense = useCallback(async (tripId, expenseId) => {
    try {
      await apiDeleteExpense(tripId, expenseId);
      setExpenseCache(prev => ({
        ...prev,
        [tripId]: (prev[tripId] || []).filter(e => e._id !== expenseId && e.id !== expenseId)
      }));
      addNotification('Expense removed', 'info');
    } catch (err) {
      addNotification(err.userMessage || 'Failed to delete expense', 'error');
      throw err;
    }
  }, [addNotification]);

  const addSettlement = useCallback((tripId, settlementData) => {
    setSettlements(prev => {
      const tripSetts = prev[tripId] || [];
      return {
        ...prev,
        [tripId]: [...tripSetts, { ...settlementData, id: Math.random().toString(36).substr(2, 9) }]
      };
    });
  }, []);

  const deleteSettlement = useCallback((tripId, settlementId) => {
    setSettlements(prev => ({
      ...prev,
      [tripId]: (prev[tripId] || []).filter(s => s.id !== settlementId)
    }));
  }, []);

  const value = useMemo(() => ({
    getExpenses,
    loadExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    getSettlements,
    addSettlement,
    deleteSettlement
  }), [getExpenses, loadExpenses, addExpense, updateExpense, deleteExpense, getSettlements, addSettlement, deleteSettlement]);

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};
