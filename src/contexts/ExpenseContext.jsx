import React, { createContext, useState, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

export const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  
  const [expenses, setExpenses] = useState({
    '1': [
      {
        id: 'e1',
        description: 'Dinner at Sushi Dai',
        amount: 120,
        category: 'Food',
        date: '2026-06-15T19:30',
        paidBy: 'm1',
        splitType: 'equal',
        splits: [
          { memberId: 'm1', amountOwed: 40 },
          { memberId: 'm2', amountOwed: 40 },
          { memberId: 'm3', amountOwed: 40 }
        ],
        receiptImage: '',
        notes: 'Amazing omakase!',
        creator: 'Test User'
      },
      {
        id: 'e2',
        description: 'Shinkansen Tickets',
        amount: 300,
        category: 'Transport',
        date: '2026-06-16T10:00',
        paidBy: 'm2',
        splitType: 'custom',
        splits: [
          { memberId: 'm1', amountOwed: 150 },
          { memberId: 'm2', amountOwed: 150 },
          { memberId: 'm3', amountOwed: 0 }
        ],
        receiptImage: '',
        notes: 'Tokyo to Kyoto',
        creator: 'Alex Travels'
      }
    ]
  });

  const [settlements, setSettlements] = useState({
    '1': []
  });

  const getExpenses = useCallback((tripId) => expenses[tripId] || [], [expenses]);
  const getSettlements = useCallback((tripId) => settlements[tripId] || [], [settlements]);

  const addExpense = useCallback((tripId, expenseData) => {
    setExpenses(prev => {
      const tripExpenses = prev[tripId] || [];
      const newExpense = {
        ...expenseData,
        id: Math.random().toString(36).substr(2, 9),
        creator: user?.name || 'Unknown'
      };
      return { ...prev, [tripId]: [...tripExpenses, newExpense] };
    });
    addNotification('Expense added', 'success');
  }, [user, addNotification]);

  const updateExpense = useCallback((tripId, expenseId, updatedData) => {
    setExpenses(prev => {
      const tripExpenses = prev[tripId] || [];
      return {
        ...prev,
        [tripId]: tripExpenses.map(e => e.id === expenseId ? { ...e, ...updatedData } : e)
      };
    });
    addNotification('Expense updated', 'success');
  }, [addNotification]);

  const deleteExpense = useCallback((tripId, expenseId) => {
    setExpenses(prev => {
      const tripExpenses = prev[tripId] || [];
      return {
        ...prev,
        [tripId]: tripExpenses.filter(e => e.id !== expenseId)
      };
    });
    addNotification('Expense removed', 'info');
  }, [addNotification]);

  const addSettlement = useCallback((tripId, settlementData) => {
    setSettlements(prev => {
      const tripSetts = prev[tripId] || [];
      const newSettlement = {
        ...settlementData,
        id: Math.random().toString(36).substr(2, 9),
        creator: user?.name || 'Unknown'
      };
      return { ...prev, [tripId]: [...tripSetts, newSettlement] };
    });
  }, [user]);

  const deleteSettlement = useCallback((tripId, settlementId) => {
    setSettlements(prev => {
      const tripSetts = prev[tripId] || [];
      return {
        ...prev,
        [tripId]: tripSetts.filter(s => s.id !== settlementId)
      };
    });
  }, []);

  const value = useMemo(() => ({
    getExpenses, addExpense, updateExpense, deleteExpense,
    getSettlements, addSettlement, deleteSettlement
  }), [getExpenses, addExpense, updateExpense, deleteExpense, getSettlements, addSettlement, deleteSettlement]);

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};
