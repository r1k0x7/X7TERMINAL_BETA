'use client';

import { useEffect, useRef, useState } from 'react';
import { useTerminalStore } from './store';
import {
  fetchCryptoMarkets,
  fetchStockQuote,
  fetchForexRates,
  fetchNewsAPI,
  fetchFundingRate,
  createBinanceWebSocket,
  createBinanceTradeSocket,
  createBinanceDepthSocket,
} from './api';

export function useCryptoWebSocket(symbols) {
  const wsRef = useRef(null);
  const { updateCryptoPrice, setWsConnected } = useTerminalStore();

  useEffect(() => {
    if (!symbols || symbols.length === 0) return;

    let ws = null;
    let reconnectTimeout = null;
    let isActive = true;

    const connect = () => {
      try {
        ws = createBinanceWebSocket(symbols);
        wsRef.current = ws;

        ws.onopen = () => {
          if (isActive) setWsConnected(true);
        };

        ws.onmessage = (event) => {
          if (!isActive) return;
          try {
            const data = JSON.parse(event.data);
            if (data.c && data.s) {
              updateCryptoPrice(data.s, parseFloat(data.c), parseFloat(data.P));
            }
          } catch (err) {
            // Silently ignore parse errors
          }
        };

        ws.onclose = () => {
          if (isActive) {
            setWsConnected(false);
            reconnectTimeout = setTimeout(connect, 5000);
          }
        };

        ws.onerror = () => {
          if (isActive) {
            setWsConnected(false);
            if (ws) ws.close();
          }
        };
      } catch (err) {
        if (isActive) setWsConnected(false);
      }
    };

    connect();

    return () => {
      isActive = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) {
        try { ws.close(); } catch (e) {}
      }
    };
  }, [symbols.join(','), updateCryptoPrice, setWsConnected]);

  return wsRef;
}

export function useTradeStream(symbol) {
  const { addTrade } = useTerminalStore();

  useEffect(() => {
    if (!symbol) return;

    let ws = null;
    let isActive = true;

    try {
      ws = createBinanceTradeSocket(symbol);

      ws.onmessage = (event) => {
        if (!isActive) return;
        try {
          const data = JSON.parse(event.data);
          addTrade({
            price: parseFloat(data.p),
            quantity: parseFloat(data.q),
            time: data.T,
            isBuyer: data.m === false,
          });
        } catch (err) {
          // Silently ignore
        }
      };

      ws.onerror = () => {
        if (ws) ws.close();
      };
    } catch (err) {
      // Silently ignore
    }

    return () => {
      isActive = false;
      if (ws) {
        try { ws.close(); } catch (e) {}
      }
    };
  }, [symbol, addTrade]);
}

export function useOrderBook(symbol) {
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });

  useEffect(() => {
    if (!symbol) return;

    let ws = null;
    let isActive = true;

    try {
      ws = createBinanceDepthSocket(symbol);

      ws.onmessage = (event) => {
        if (!isActive) return;
        try {
          const data = JSON.parse(event.data);
          setOrderBook({
            bids: (data.bids || []).slice(0, 10).map(([p, q]) => [parseFloat(p), parseFloat(q)]),
            asks: (data.asks || []).slice(0, 10).map(([p, q]) => [parseFloat(p), parseFloat(q)]),
          });
        } catch (err) {
          // Silently ignore
        }
      };

      ws.onerror = () => {
        if (ws) ws.close();
      };
    } catch (err) {
      // Silently ignore
    }

    return () => {
      isActive = false;
      if (ws) {
        try { ws.close(); } catch (e) {}
      }
    };
  }, [symbol]);

  return orderBook;
}

export function useFundingRate(symbol) {
  const [funding, setFunding] = useState(null);

  useEffect(() => {
    if (!symbol) return;

    const fetchData = async () => {
      try {
        const data = await fetchFundingRate(symbol);
        if (data) setFunding(data);
      } catch (err) {
        // Silently ignore
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [symbol]);

  return funding;
}

export function useCryptoMarkets() {
  const { setCryptoAssets, setLoading } = useTerminalStore();

  useEffect(() => {
    let isActive = true;

    const fetchData = async () => {
      if (!isActive) return;
      setLoading(true);
      try {
        const data = await fetchCryptoMarkets(1, 50);
        if (!isActive) return;
        const assets = data.map((coin) => ({
          id: coin.id,
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          price: coin.current_price || 0,
          change24h: coin.price_change_percentage_24h || 0,
          marketCap: coin.market_cap || 0,
          volume24h: coin.total_volume || 0,
          sparkline: coin.sparkline_in_7d?.price || [],
        }));
        setCryptoAssets(assets);
      } catch (err) {
        console.warn('useCryptoMarkets error:', err);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [setCryptoAssets, setLoading]);
}

export function useStockData(symbols) {
  const { setStockAssets } = useTerminalStore();

  useEffect(() => {
    let isActive = true;

    const fetchData = async () => {
      try {
        const stocks = await Promise.all(
          symbols.map(async (symbol) => {
            try {
              const quote = await fetchStockQuote(symbol);
              if (!quote) return null;
              return {
                symbol,
                name: symbol,
                price: quote.c || 0,
                change: quote.d || 0,
                changePercent: quote.dp || 0,
                volume: quote.v || 0,
              };
            } catch (err) {
              return null;
            }
          })
        );
        if (isActive) setStockAssets(stocks.filter(Boolean));
      } catch (err) {
        console.warn('useStockData error:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [symbols.join(','), setStockAssets]);
}

export function useForexData() {
  const { setForexRates } = useTerminalStore();

  useEffect(() => {
    let isActive = true;

    const fetchData = async () => {
      try {
        const data = await fetchForexRates('USD');
        if (!data || !data.rates || !isActive) return;
        const pairs = ['EUR', 'GBP', 'JPY', 'IDR', 'CHF', 'CAD', 'AUD', 'CNY'];
        const rates = pairs.map((pair) => {
          const rate = data.rates[pair] || 0;
          return {
            pair: `USD${pair}`,
            rate,
            change: 0,
            bid: rate * 0.9995,
            ask: rate * 1.0005,
          };
        });
        if (isActive) setForexRates(rates);
      } catch (err) {
        console.warn('useForexData error:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [setForexRates]);
}

export function useNewsData() {
  const { setNewsItems } = useTerminalStore();

  useEffect(() => {
    let isActive = true;

    const fetchData = async () => {
      try {
        const articles = await fetchNewsAPI('finance cryptocurrency stock market', 20);
        if (!isActive) return;
        const news = (articles || []).map((article, index) => ({
          id: `news-${index}`,
          title: article.title || 'No Title',
          source: article.source?.name || 'Unknown',
          publishedAt: article.publishedAt || new Date().toISOString(),
          category: 'finance',
          sentiment: 'neutral',
          url: article.url || '#',
        }));
        if (isActive) setNewsItems(news);
      } catch (err) {
        console.warn('useNewsData error:', err);
        if (isActive) setNewsItems([]);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [setNewsItems]);
}
