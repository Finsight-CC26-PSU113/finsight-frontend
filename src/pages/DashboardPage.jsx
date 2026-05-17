import React from 'react';
import { HeroInsight } from '../components/dashboard/HeroInsight';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { SpendingChart } from '../components/dashboard/SpendingChart';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { AiRecommendationFeed } from '../components/dashboard/AiRecommendationFeed';
import { AnomalyDetectionWidget } from '../components/dashboard/AnomalyDetectionWidget';
import { InvestmentPortfolioWidget } from '../components/dashboard/InvestmentPortfolioWidget';

export const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <HeroInsight />
      <SummaryCards />
      
      {/* Main Layout: Two Columns */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Charts & Transactions */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          <SpendingChart />
          <RecentTransactions />
        </div>

        {/* Right Column: AI Insights, Anomaly, & Portfolio */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <AnomalyDetectionWidget />
          <AiRecommendationFeed />
          <InvestmentPortfolioWidget />
        </div>
      </div>
    </div>
  );
};
