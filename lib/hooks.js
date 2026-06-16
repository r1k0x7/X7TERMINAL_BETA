'use client';

import { useEffect, useRef, useState } from 'react';
import { useTerminalStore } from './store';
import {
  fetchCryptoMarkets,
  fetchStockQuote,
  fetchForexRates,
  fetchNewsAPI,
  fetchFundingRate,
  fetchFREDData,
  fetchEarthquakes,
  fetchWeather,
  getMockStocks,
  getMockMacro,
  getMockWeather,
  createBinanceWebSocket,
  createBinanceTradeSocket,
  createBinanceDepthSocket,
} from './api';

// ==================== WEBSOCKET HOOKS ====================
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

// ==================== DATA FETCHING HOOKS ====================
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
              // Handle both Finnhub format and mock format
              return {
                symbol,
                name: quote.name || symbol,
                price: quote.c || quote.price || 0,
                change: quote.d || quote.change || 0,
                changePercent: quote.dp || quote.changePercent || 0,
                volume: quote.v || quote.volume || 0,
              };
            } catch (err) {
              return null;
            }
          })
        );
        if (isActive) setStockAssets(stocks.filter(Boolean));
      } catch (err) {
        console.warn('useStockData error:', err);
        // Fallback to mock data
        if (isActive) setStockAssets(getMockStocks());
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

        if (!articles || articles.length === 0) {
          setNewsItems([]);
          return;
        }

        const news = articles.map((article, index) => ({
          id: article.id || `news-${index}`,
          title: article.title || 'No Title',
          source: article.source?.name || article.source || 'Unknown',
          publishedAt: article.publishedAt || new Date().toISOString(),
          category: article.category || 'Finance',
          sentiment: article.sentiment || 'neutral',
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

export function useMacroData() {
  const [macroData, setMacroData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const fetchAll = async () => {
      if (!isActive) return;
      setLoading(true);

      try {
        const FRED_SERIES = [
          { id: 'CPIAUCSL', name: 'CPI (Consumer Price Index)', unit: 'Index' },
          { id: 'GDP', name: 'GDP', unit: 'Billion USD' },
          { id: 'UNRATE', name: 'Unemployment Rate', unit: '%' },
          { id: 'FEDFUNDS', name: 'Fed Funds Rate', unit: '%' },
          { id: 'M2SL', name: 'M2 Money Supply', unit: 'Billion USD' },
          { id: 'PPIACO', name: 'PPI (Producer Price Index)', unit: 'Index' },
          { id: 'DTB3', name: '3-Month Treasury', unit: '%' },
          { id: 'DGS10', name: '10-Year Treasury', unit: '%' },
        ];

        const results = await Promise.all(
          FRED_SERIES.map(async (series) => {
            try {
              const data = await fetchFREDData(series.id);

              if (!data || !data.observations || data.observations.length === 0) {
                // Use mock data
                const mock = getMockMacro().find(m => m.id === series.id);
                return mock || { ...series, value: 0, date: 'N/A', change: 0 };
              }

              const latest = data.observations[0];
              const previous = data.observations[1];
              const currentValue = parseFloat(latest.value);
              const prevValue = previous ? parseFloat(previous.value) : currentValue;
              const change = prevValue !== 0 ? ((currentValue - prevValue) / prevValue) * 100 : 0;

              return {
                ...series,
                value: currentValue,
                date: latest.date || 'N/A',
                change: change,
              };
            } catch (err) {
              const mock = getMockMacro().find(m => m.id === series.id);
              return mock || { ...series, value: 0, date: 'N/A', change: 0 };
            }
          })
        );

        if (isActive) setMacroData(results);
      } catch (err) {
        console.warn('useMacroData error:', err);
        if (isActive) setMacroData(getMockMacro());
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return { macroData, loading };
}

export function useWorldData() {
  const [earthquakes, setEarthquakes] = useState([]);
  const [weather, setWeather] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    const CITIES = ['New York', 'London', 'Tokyo', 'Singapore', 'Sydney', 'Dubai'];

    const fetchData = async () => {
      if (!isActive) return;
      setLoading(true);

      try {
        // Fetch earthquakes
        const eqData = await fetchEarthquakes('day');
        if (isActive) {
          setEarthquakes(
            eqData.map((eq) => ({
              mag: eq.properties?.mag || 0,
              place: eq.properties?.place || 'Unknown',
              time: eq.properties?.time || Date.now(),
              lat: eq.geometry?.coordinates?.[1] || 0,
              lon: eq.geometry?.coordinates?.[0] || 0,
            }))
          );
        }

        // Fetch weather for cities
        const weatherData = await Promise.all(
          CITIES.map(async (city) => {
            try {
              const data = await fetchWeather(city);
              if (!data) return null;
              return {
                city,
                temp: data.main?.temp || 20,
                condition: data.weather?.[0]?.main || 'Unknown',
                humidity: data.main?.humidity || 50,
                wind: data.wind?.speed || 0,
              };
            } catch (err) {
              return null;
            }
          })
        );

        if (isActive) {
          setWeather(weatherData.filter(Boolean));
        }
      } catch (err) {
        console.warn('useWorldData error:', err);
        if (isActive) {
          setEarthquakes([]);
          setWeather(getMockWeather());
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, []);

  return { earthquakes, weather, loading };
}
