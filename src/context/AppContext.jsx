import React, { createContext, useContext, useState } from 'react';
import { mockUser, mockTransactions, mockBudgets, mockInsights } from '../utils/dummyData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(mockUser);
  const [transactions, setTransactions] = useState(mockTransactions);
  const [budgets, setBudgets] = useState(mockBudgets);
  const [insights, setInsights] = useState(mockInsights);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default to true for dev

  const addTransaction = (transaction) => {
    setTransactions([
      { ...transaction, id: Date.now() },
      ...transactions
    ]);
    
    // Update balance
    setUser(prev => ({
      ...prev,
      balance: prev.balance + transaction.amount
    }));
  };

  const deleteTransaction = (id) => {
    const tx = transactions.find(t => t.id === id);
    if (tx) {
      setTransactions(transactions.filter(t => t.id !== id));
      setUser(prev => ({
        ...prev,
        balance: prev.balance - tx.amount
      }));
    }
  };

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  const addBudget = (budgetData) => {
    setBudgets([
      ...budgets,
      {
        id: Date.now(),
        spent: 0,
        ...budgetData
      }
    ]);
  };

  return (
    <AppContext.Provider value={{
      user,
      transactions,
      budgets,
      insights,
      isAuthenticated,
      addTransaction,
      deleteTransaction,
      addBudget,
      login,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
