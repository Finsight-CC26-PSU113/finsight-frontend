import React from 'react';
import { motion } from 'framer-motion';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = "", 
  onClick, 
  type = "button",
  fullWidth = false,
  disabled = false
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary-600 hover:bg-primary-700 text-white shadow-sm focus:ring-primary-500",
    secondary: "bg-ai-light text-ai-dark hover:bg-indigo-200 focus:ring-ai",
    outline: "border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus:ring-slate-500",
    ghost: "text-slate-600 hover:bg-slate-100 focus:ring-slate-500",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </motion.button>
  );
};
