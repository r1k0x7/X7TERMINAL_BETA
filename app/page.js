'use client';

import { useEffect, useState } from 'react';
import { useTerminalStore } from '@/lib/store';
import { useCryptoMarkets, useStockData, useForexData, useNewsData } from '@/lib/hooks';
import TickerBar from '@/components/TickerBar';
import BottomNav from '@/components/BottomNav';
import CryptoPanel from '@/components/CryptoPanel';
import StockPanel from '@/components/StockPanel';
import ForexPanel from '@/components/ForexPanel';
import MacroPanel from '@/components/MacroPanel';
import NewsPanel from '@/components/NewsPanel';
import WorldMonitorPanel from '@/components/WorldMonitorPanel';
import LoadingScreen from '@/components/LoadingScreen';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { activeTab, isLoading } = useTerminalStore();

  // Prevent hydration mismatch - only run hooks after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only initialize data fetching on client side
  useCryptoMarkets();
  useStockData(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX']);
  useForexData();
  useNewsData();

  // Show loading screen until mounted and data is ready
  if (!mounted || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <main className="min-h-screen bg-terminal-bg pb-20">
      <TickerBar />

      <div className="p-4 space-y-4">
        {activeTab === 'crypto' && <CryptoPanel />}
        {activeTab === 'stocks' && <StockPanel />}
        {activeTab === 'forex' && <ForexPanel />}
        {activeTab === 'macro' && <MacroPanel />}
        {activeTab === 'news' && <NewsPanel />}
        {activeTab === 'world' && <WorldMonitorPanel />}
      </div>

      <BottomNav />
    </main>
  );
}
