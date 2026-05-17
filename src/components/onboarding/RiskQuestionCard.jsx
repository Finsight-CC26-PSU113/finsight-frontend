import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';

export const RiskQuestionCard = ({ 
  question, 
  options, 
  currentStep, 
  totalSteps, 
  onSelectOption,
  selectedScore
}) => {
  return (
    <motion.div
      key={currentStep}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <span className="text-sm font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Pertanyaan {currentStep} dari {totalSteps}
        </span>
        <h2 className="text-2xl font-bold text-slate-900 mt-4 leading-relaxed">
          {question}
        </h2>
      </div>

      <div className="space-y-3">
        {options.map((option, index) => {
          const isSelected = selectedScore === option.score;
          return (
            <div 
              key={index}
              onClick={() => onSelectOption(option.score)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center gap-4 ${
                isSelected 
                  ? 'border-primary-500 bg-primary-50 shadow-sm' 
                  : 'border-slate-100 hover:border-primary-300 hover:bg-slate-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 transition-colors ${
                isSelected ? 'bg-primary-500 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {String.fromCharCode(65 + index)}
              </div>
              <p className={`font-medium ${isSelected ? 'text-primary-900' : 'text-slate-700'}`}>
                {option.text}
              </p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
