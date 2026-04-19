import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { SocketContext } from './SocketContext';
import { useNotification } from './NotificationContext';

export const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const { user } = useAuth();
  const socketContext = useContext(SocketContext);
  const { socket, emitAction } = socketContext || {};
  const { addNotification } = useNotification();
  
  const [expenses, setExpenses] = useState({
    '1': [
      {
        id: 'e1',
        description: 'Dinner at Sushi Dai',
        amount: 120,
        category: 'Food',
        date: '2026-06-15T19:30',
        paidBy: 'm1', // Test User
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
        paidBy: 'm2', // Alex Travels
        splitType: 'custom',
        splits: [
          { memberId: 'm1', amountOwed: 150 },
          { memberId: 'm2', amountOwed: 150 },
          { memberId: 'm3', amountOwed: 0 } // Sarah didn't travel
        ],
        receiptImage: '',
        notes: 'Tokyo to Kyoto',
        creator: 'Alex Travels'
      }
    ]
  });

  const [settlements, setSettlements] = useState({
    '1': [] // Array of recorded settlements
  });

  const getExpenses = useCallback((tripId) => expenses[tripId] || [], [expenses]);
  const getSettlements = useCallback((tripId) => settlements[tripId] || [], [settlements]);

  useEffect(() => {
    if (socket) {
      const handleAction = ({ action, payload }) => {
        if (action === 'ADD_EXPENSE') {
          setExpenses(prev => ({ ...prev, [payload.tripId]: [...(prev[payload.tripId]||[]), payload.data] }));
        } else if (action === 'DELETE_EXPENSE') {
          setExpenses(prev => ({ ...prev, [payload.tripId]: (prev[payload.tripId]||[]).filter(e => e.id !== payload.id) }));
        } else if (action === 'ADD_SETTLEMENT') {
          setSettlements(prev => ({ ...prev, [payload.tripId]: [...(prev[payload.tripId]||[]), payload.data] }));
        }
      };
      socket.on('receive_action', handleAction);
      return () => socket.off('receive_action', handleAction);
    }
  }, [socket]);

  const addExpense = useCallback((tripId, expenseData) => {
    setExpenses(prev => {
      const tripExpenses = prev[tripId] || [];
      const newExpense = {
        ...expenseData,
        id: Math.random().toString(36).substr(2, 9),
        creator: user?.name || 'Unknown'
      };
      
      if (emitAction) emitAction(tripId, 'ADD_EXPENSE', { tripId, data: newExpense });
      
      return { ...prev, [tripId]: [...tripExpenses, newExpense] };
    });
    addNotification('Expense added', 'success');
  }, [user, emitAction, addNotification]);

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
    if (emitAction) emitAction(tripId, 'DELETE_EXPENSE', { tripId, id: expenseId });
    setExpenses(prev => {
      const tripExpenses = prev[tripId] || [];
      return {
        ...prev,
        [tripId]: tripExpenses.filter(e => e.id !== expenseId)
      };
    });
    addNotification('Expense removed', 'info');
  }, [emitAction, addNotification]);

  const addSettlement = useCallback((tripId, settlementData) => {
    setSettlements(prev => {
      const tripSetts = prev[tripId] || [];
      const newSettlement = {
        ...settlementData,
        id: Math.random().toString(36).substr(2, 9),
        creator: user?.name || 'Unknown'
      };
      
      if (emitAction) emitAction(tripId, 'ADD_SETTLEMENT', { tripId, data: newSettlement });
      
      return { ...prev, [tripId]: [...tripSetts, newSettlement] };
    });
  }, [user, emitAction]);

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
