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

  useEffect(() => {
    setMounted(true);
  }, []);

  useCryptoMarkets();
  useStockData(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX']);
  useForexData();
  useNewsData();

  // Prevent hydration mismatch
  if (!mounted) {
    return <LoadingScreen />;
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <main style={{ backgroundColor: '#0a0a0f', minHeight: '100vh', paddingBottom: '80px' }}>
      <TickerBar />

      <div style={{ padding: '16px' }}>
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
