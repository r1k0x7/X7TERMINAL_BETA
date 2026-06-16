import { create } from 'zustand';

export const useTerminalStore = create((set) => ({
  // Crypto
  cryptoAssets: [],
  selectedCrypto: 'bitcoin',
  cryptoTrades: [],

  // Stocks
  stockAssets: [],
  selectedStock: 'AAPL',

  // Forex
  forexRates: [],

  // News
  newsItems: [],

  // UI State
  activeTab: 'crypto',
  isWsConnected: false,
  batterySaver: false,
  isLoading: true,

  // Actions
  setCryptoAssets: (assets) => set({ cryptoAssets: assets }),
  setSelectedCrypto: (id) => set({ selectedCrypto: id }),
  setStockAssets: (assets) => set({ stockAssets: assets }),
  setForexRates: (rates) => set({ forexRates: rates }),
  setNewsItems: (news) => set({ newsItems: news }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setWsConnected: (connected) => set({ isWsConnected: connected }),
  toggleBatterySaver: () => set((state) => ({ batterySaver: !state.batterySaver })),
  setLoading: (loading) => set({ isLoading: loading }),

  addTrade: (trade) => set((state) => ({
    cryptoTrades: [trade, ...state.cryptoTrades].slice(0, 100)
  })),

  updateCryptoPrice: (symbol, price, change) => set((state) => ({
    cryptoAssets: state.cryptoAssets.map(asset =>
      asset.symbol === symbol ? { ...asset, price, change24h: change } : asset
    )
  })),
}));
