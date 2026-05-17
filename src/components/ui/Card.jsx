import React from 'react';

export const Card = ({ children, className = "", noPadding = false }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-card border border-slate-100 ${noPadding ? '' : 'p-6'} ${className}`}>
      {children}
    </div>
  );
};
