'use client';

import { BarChart3, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { useMacroData } from '@/lib/hooks';
import { formatNumber } from '@/lib/api';

export default function MacroPanel() {
  const { macroData, loading } = useMacroData();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="terminal-panel p-4">
          <h2 className="terminal-title flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Economic Indicators
          </h2>
        </div>
        <div className="terminal-panel p-8 text-center">
          <div className="animate-pulse text-terminal-muted">Loading macro data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="terminal-panel p-4">
        <h2 className="terminal-title flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Economic Indicators
        </h2>
      </div>

      <div className="grid gap-3">
        {macroData.map((item) => (
          <div key={item.id} className="terminal-panel p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">{item.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-3 h-3 text-terminal-muted" />
                  <span className="text-xs text-terminal-muted">{item.date}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-xl font-bold">
                  {item.unit === '%' ? `${item.value.toFixed(2)}%` : formatNumber(item.value)}
                </div>
                <div className={`flex items-center justify-end text-sm ${item.change >= 0 ? 'text-terminal-accent' : 'text-terminal-danger'}`}>
                  {item.change >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
