import { useEffect, useRef, useState } from 'react';
import { useTerminalStore } from './store';
import { 
  createBinanceWebSocket, 
  createBinanceTradeSocket,
  createBinanceDepthSocket,
  fetchCryptoMarkets,
  fetchStockQuote,
  fetchForexRates,
  fetchNewsAPI,
  fetchFundingRate,
} from './api';

export function useCryptoWebSocket(symbols) {
  const wsRef = useRef(null);
  const { updateCryptoPrice, setWsConnected } = useTerminalStore();

  useEffect(() => {
    if (symbols.length === 0) return;
    
    let ws;
    let reconnectTimeout;
    
    const connect = () => {
      try {
        ws = createBinanceWebSocket(symbols);
        wsRef.current = ws;
        
        ws.onopen = () => setWsConnected(true);
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.c) updateCryptoPrice(data.s, parseFloat(data.c), parseFloat(data.P));
          } catch (err) {
            console.warn('WebSocket message parse error:', err);
          }
        };
        
        ws.onclose = () => {
          setWsConnected(false);
          // Auto-reconnect after 5s
          reconnectTimeout = setTimeout(connect, 5000);
        };
        
        ws.onerror = (err) => {
          console.warn('WebSocket error:', err);
          setWsConnected(false);
          ws.close();
        };
      } catch (err) {
        console.warn('WebSocket connection failed:', err);
        setWsConnected(false);
      }
    };
    
    connect();
    
    return () => {
      clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, [symbols.join(','), updateCryptoPrice, setWsConnected]);

  return wsRef;
}

export function useTradeStream(symbol) {
  const { addTrade } = useTerminalStore();
  
  useEffect(() => {
    if (!symbol) return;
    
    let ws;
    
    try {
      ws = createBinanceTradeSocket(symbol);
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          addTrade({ 
            price: parseFloat(data.p), 
            quantity: parseFloat(data.q), 
            time: data.T, 
            isBuyer: data.m === false 
          });
        } catch (err) {
          console.warn('Trade stream parse error:', err);
        }
      };
      
      ws.onerror = (err) => {
        console.warn('Trade stream error:', err);
      };
    } catch (err) {
      console.warn('Trade stream connection failed:', err);
    }
    
    return () => { if (ws) ws.close(); };
  }, [symbol, addTrade]);
}

export function useOrderBook(symbol) {
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  
  useEffect(() => {
    if (!symbol) return;
    
    let ws;
    
    try {
      ws = createBinanceDepthSocket(symbol);
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setOrderBook({
            bids: data.bids?.slice(0, 10).map(([p, q]) => [parseFloat(p), parseFloat(q)]) || [],
            asks: data.asks?.slice(0, 10).map(([p, q]) => [parseFloat(p), parseFloat(q)]) || [],
          });
        } catch (err) {
          console.warn('Order book parse error:', err);
        }
      };
      
      ws.onerror = (err) => {
        console.warn('Order book error:', err);
      };
    } catch (err) {
      console.warn('Order book connection failed:', err);
    }
    
    return () => { if (ws) ws.close(); };
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
        console.warn('Funding rate fetch error:', err);
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
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchCryptoMarkets(1, 50);
        const assets = data.map((coin) => ({
          id: coin.id, 
          symbol: coin.symbol.toUpperCase(), 
          name: coin.name,
          price: coin.current_price, 
          change24h: coin.price_change_percentage_24h || 0,
          marketCap: coin.market_cap, 
          volume24h: coin.total_volume,
          sparkline: coin.sparkline_in_7d?.price || [],
        }));
        setCryptoAssets(assets);
      } catch (err) {
        console.warn('Crypto markets fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [setCryptoAssets, setLoading]);
}

export function useStockData(symbols) {
  const { setStockAssets } = useTerminalStore();
  
  useEffect(() => {
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
                price: quote.c, 
                change: quote.d, 
                changePercent: quote.dp, 
                volume: quote.v 
              };
            } catch (err) {
              console.warn(`Stock ${symbol} fetch error:`, err);
              return null;
            }
          })
        );
        setStockAssets(stocks.filter(Boolean));
      } catch (err) {
        console.warn('Stock data fetch error:', err);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [symbols.join(','), setStockAssets]);
}

export function useForexData() {
  const { setForexRates } = useTerminalStore();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchForexRates('USD');
        if (!data) return;
        
        const pairs = ['EUR', 'GBP', 'JPY', 'IDR', 'CHF', 'CAD', 'AUD', 'CNY'];
        const rates = pairs.map((pair) => ({ 
          pair: `USD${pair}`, 
          rate: data.rates[pair], 
          change: 0, 
          bid: data.rates[pair] * 0.9995, 
          ask: data.rates[pair] * 1.0005 
        }));
        
        setForexRates(rates);
      } catch (err) {
        console.warn('Forex data fetch error:', err);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, [setForexRates]);
}

export function useNewsData() {
  const { setNewsItems } = useTerminalStore();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const articles = await fetchNewsAPI('finance cryptocurrency stock market', 20);
        
        if (!articles || !Array.isArray(articles)) {
          setNewsItems([]);
          return;
        }
        
        const news = articles.map((article, index) => ({
          id: `news-${index}`, 
          title: article.title || 'No Title', 
          source: article.source?.name || 'Unknown',
          publishedAt: article.publishedAt || new Date().toISOString(), 
          category: 'finance', 
          sentiment: 'neutral', 
          url: article.url || '#',
        }));
        
        setNewsItems(news);
      } catch (err) {
        console.warn('News fetch error:', err);
        setNewsItems([]);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, [setNewsItems]);
            }
    
