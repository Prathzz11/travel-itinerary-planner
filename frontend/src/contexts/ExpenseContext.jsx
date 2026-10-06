import { isEditing } from '../utils/autoRefresh';
import React, { createContext, useState, useCallback, useMemo, useRef } from 'react';
import { useNotification } from './NotificationContext';
import {
  getExpenses as apiGetExpenses,
  createExpense as apiCreateExpense,
  updateExpense as apiUpdateExpense,
  deleteExpense as apiDeleteExpense
} from '../services/expenseService';
import {
  getSettlements as apiGetSettlements,
  createSettlement as apiCreateSettlement,
  updateSettlement as apiUpdateSettlement,
  deleteSettlement as apiDeleteSettlement
} from '../services/settlementService';

export const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const { addNotification } = useNotification();

  // Cache: { [tripId]: expense[] }
  const [expenseCache, setExpenseCache] = useState({});
  const [settlements, setSettlements] = useState({});
  const [expenseStatus, setExpenseStatus] = useState({});
  const [settlementStatus, setSettlementStatus] = useState({});
  const versions = useRef({});
  const bump = key => { versions.current[key] = (versions.current[key] || 0) + 1; return versions.current[key]; };

  const loadExpenses = useCallback(async (tripId, { silent = false } = {}) => {
    const key = `expense:${tripId}`, version = bump(key);
    if (!silent) setExpenseStatus(prev => ({ ...prev, [tripId]: 'loading' }));
    try {
      const res = await apiGetExpenses(tripId);
      if (versions.current[key] !== version || (silent && isEditing(document))) return res.data;
      setExpenseStatus(prev => ({ ...prev, [tripId]: 'ready' }));
      setExpenseCache(prev => ({ ...prev, [tripId]: res.data }));
      return res.data;
    } catch (err) {
      if (versions.current[key] !== version) return [];
      setExpenseStatus(prev => ({ ...prev, [tripId]: 'error' }));
      console.error('Failed to load expenses:', err);
      if (!silent) addNotification(err.userMessage || 'Failed to load expense data', 'error');
      return [];
    }
  }, [addNotification]);

  const getExpenses = useCallback((tripId) => expenseCache[tripId] || [], [expenseCache]);
  const getSettlements = useCallback((tripId) => settlements[tripId] || [], [settlements]);

  const loadSettlements = useCallback(async (tripId, { silent = false } = {}) => {
    const key = `settlement:${tripId}`, version = bump(key);
    if (!silent) setSettlementStatus(prev => ({ ...prev, [tripId]: 'loading' }));
    try {
      const res = await apiGetSettlements(tripId);
      if (versions.current[key] !== version || (silent && isEditing(document))) return res.data;
      setSettlementStatus(prev => ({ ...prev, [tripId]: 'ready' }));
      setSettlements(prev => ({ ...prev, [tripId]: res.data }));
      return res.data;
    } catch (err) {
      if (versions.current[key] !== version) return [];
      setSettlementStatus(prev => ({ ...prev, [tripId]: 'error' }));
      console.error('Failed to load settlements:', err);
      if (!silent) addNotification(err.userMessage || 'Failed to load settlement data', 'error');
      return [];
    }
  }, [addNotification]);

  const addExpense = useCallback(async (tripId, expenseData) => {
    try {
      const res = await apiCreateExpense(tripId, expenseData);
      bump(`expense:${tripId}`); setExpenseStatus(prev => ({ ...prev, [tripId]: 'ready' }));
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
      bump(`expense:${tripId}`); setExpenseStatus(prev => ({ ...prev, [tripId]: 'ready' }));
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
      bump(`expense:${tripId}`); setExpenseStatus(prev => ({ ...prev, [tripId]: 'ready' }));
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

  const addSettlement = useCallback(async (tripId, settlementData) => {
    try {
      const res = await apiCreateSettlement(tripId, settlementData);
      bump(`settlement:${tripId}`); setSettlementStatus(prev => ({ ...prev, [tripId]: 'ready' }));
      setSettlements(prev => ({
        ...prev,
        [tripId]: [...(prev[tripId] || []).filter(s => s._id !== res.data._id), res.data]
      }));
      addNotification('Payment recorded', 'success');
      return res.data;
    } catch (err) {
      addNotification(err.userMessage || 'Failed to record payment', 'error');
      throw err;
    }
  }, [addNotification]);

  const updateSettlement = useCallback(async (tripId, paymentId, data) => {
    try {
      const res = await apiUpdateSettlement(tripId,paymentId,data);
      bump(`settlement:${tripId}`);
      setSettlements(prev=>({...prev,[tripId]:(prev[tripId] || []).map(s=>s._id===paymentId?res.data:s)}));
      addNotification('Payment updated','success');
      return res.data;
    } catch(error) { addNotification(error.userMessage || 'Could not update payment','error'); throw error; }
  },[addNotification]);

  const deleteSettlement = useCallback(async (tripId, settlementId) => {
    try {
      await apiDeleteSettlement(tripId, settlementId);
      bump(`settlement:${tripId}`); setSettlementStatus(prev => ({ ...prev, [tripId]: 'ready' }));
      setSettlements(prev => ({
        ...prev,
        [tripId]: (prev[tripId] || []).filter(s => (s._id || s.id) !== settlementId)
      }));
      addNotification('Payment removed', 'info');
    } catch (err) {
      addNotification(err.userMessage || 'Failed to delete payment', 'error');
      throw err;
    }
  }, [addNotification]);

  const value = useMemo(() => ({
    expenseStatus, settlementStatus,
    getExpenses,
    loadExpenses,
    loadSettlements,
    addExpense,
    updateExpense,
    deleteExpense,
    getSettlements,
    addSettlement,
    updateSettlement,
    deleteSettlement
  }), [expenseStatus, settlementStatus, getExpenses, loadExpenses, loadSettlements, addExpense, updateExpense, deleteExpense, getSettlements, addSettlement, updateSettlement, deleteSettlement]);

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};
