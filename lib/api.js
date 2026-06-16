const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const BINANCE_API = 'https://api.binance.com/api/v3';
const BINANCE_FAPI = 'https://fapi.binance.com/fapi/v1';
const BINANCE_WS = 'wss://stream.binance.com:9443/ws';
const BINANCE_FWS = 'wss://fstream.binance.com/ws';
const FINNHUB_API = 'https://finnhub.io/api/v1';
const FRANKFURTER_API = 'https://api.frankfurter.app';
const FRED_API = 'https://api.stlouisfed.org/fred';
const NEWS_API = 'https://newsapi.org/v2';
const WORLDNEWS_API = 'https://api.worldnewsapi.com';
const USGS_API = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0';
const OWM_API = 'https://api.openweathermap.org/data/2.5';

// API Keys
const FINNHUB_KEY = process.env.NEXT_PUBLIC_FINNHUB_KEY || '';
const FRED_KEY = process.env.NEXT_PUBLIC_FRED_KEY || '';
const NEWS_KEY = process.env.NEXT_PUBLIC_NEWS_KEY || '';
const WORLDNEWS_KEY = process.env.NEXT_PUBLIC_WORLDNEWS_KEY || '';
const OWM_KEY = process.env.NEXT_PUBLIC_OWM_KEY || '';

// ==================== MOCK DATA ====================
const MOCK_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 195.89, change: 1.23, changePercent: 0.63, volume: 54321000 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.91, change: 2.45, changePercent: 0.65, volume: 22134000 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 141.80, change: -0.92, changePercent: -0.64, volume: 18765000 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.35, change: 3.12, changePercent: 1.78, volume: 34567000 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: -5.30, changePercent: -2.09, volume: 98765432 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.28, change: 12.45, changePercent: 1.44, volume: 45678000 },
  { symbol: 'META', name: 'Meta Platforms', price: 505.75, change: 8.90, changePercent: 1.79, volume: 12345000 },
  { symbol: 'NFLX', name: 'Netflix Inc.', price: 628.80, change: -2.15, changePercent: -0.34, volume: 8765400 },
];

const MOCK_MACRO = [
  { id: 'CPIAUCSL', name: 'CPI (Consumer Price Index)', unit: 'Index', value: 313.55, date: '2026-05-01', change: 0.13 },
  { id: 'GDP', name: 'GDP', unit: 'Billion USD', value: 28438.0, date: '2026-Q1', change: 0.35 },
  { id: 'UNRATE', name: 'Unemployment Rate', unit: '%', value: 3.9, date: '2026-05-01', change: -0.10 },
  { id: 'FEDFUNDS', name: 'Fed Funds Rate', unit: '%', value: 5.33, date: '2026-06-01', change: 0.0 },
  { id: 'M2SL', name: 'M2 Money Supply', unit: 'Billion USD', value: 21050.0, date: '2026-05-01', change: 0.08 },
  { id: 'PPIACO', name: 'PPI (Producer Price Index)', unit: 'Index', value: 262.80, date: '2026-05-01', change: 0.22 },
  { id: 'DTB3', name: '3-Month Treasury', unit: '%', value: 5.25, date: '2026-06-01', change: 0.02 },
  { id: 'DGS10', name: '10-Year Treasury', unit: '%', value: 4.28, date: '2026-06-01', change: -0.05 },
];

const MOCK_NEWS = [
  { id: 'news-1', title: 'Federal Reserve Holds Interest Rates Steady at 5.25-5.50%', source: 'Reuters', publishedAt: '2026-06-15T14:30:00Z', category: 'Finance', sentiment: 'neutral', url: 'https://example.com/1' },
  { id: 'news-2', title: 'Bitcoin Surges Past $67,000 as ETF Inflows Accelerate', source: 'CoinDesk', publishedAt: '2026-06-15T12:00:00Z', category: 'Crypto', sentiment: 'positive', url: 'https://example.com/2' },
  { id: 'news-3', title: 'Tech Stocks Rally on AI Revenue Growth Reports', source: 'Bloomberg', publishedAt: '2026-06-15T10:15:00Z', category: 'Technology', sentiment: 'positive', url: 'https://example.com/3' },
  { id: 'news-4', title: 'Oil Prices Drop 3% on Global Demand Concerns', source: 'CNBC', publishedAt: '2026-06-15T08:45:00Z', category: 'Finance', sentiment: 'negative', url: 'https://example.com/4' },
  { id: 'news-5', title: 'Ethereum Network Upgrade Reduces Gas Fees by 40%', source: 'The Block', publishedAt: '2026-06-14T22:00:00Z', category: 'Crypto', sentiment: 'positive', url: 'https://example.com/5' },
  { id: 'news-6', title: 'Global Inflation Eases to 2.8% in Major Economies', source: 'Financial Times', publishedAt: '2026-06-14T18:30:00Z', category: 'Economy', sentiment: 'positive', url: 'https://example.com/6' },
  { id: 'news-7', title: 'Tesla Announces New Gigafactory in Southeast Asia', source: 'TechCrunch', publishedAt: '2026-06-14T16:00:00Z', category: 'Technology', sentiment: 'positive', url: 'https://example.com/7' },
  { id: 'news-8', title: 'European Central Bank Signals Potential Rate Cut', source: 'Reuters', publishedAt: '2026-06-14T14:00:00Z', category: 'Finance', sentiment: 'positive', url: 'https://example.com/8' },
];

const MOCK_WEATHER = [
  { city: 'New York', temp: 22.5, condition: 'Partly Cloudy', humidity: 65, wind: 3.2 },
  { city: 'London', temp: 15.8, condition: 'Rain', humidity: 82, wind: 5.5 },
  { city: 'Tokyo', temp: 28.3, condition: 'Clear', humidity: 45, wind: 2.1 },
  { city: 'Singapore', temp: 31.2, condition: 'Thunderstorm', humidity: 88, wind: 4.0 },
  { city: 'Sydney', temp: 18.6, condition: 'Sunny', humidity: 55, wind: 6.3 },
  { city: 'Dubai', temp: 38.5, condition: 'Hot', humidity: 30, wind: 3.8 },
];

// ==================== CRYPTO ====================
export async function fetchCryptoMarkets(page = 1, perPage = 50) {
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=24h`,
      { next: { revalidate: 30 } }
    );
    if (!response.ok) throw new Error('Failed');
    return await response.json();
  } catch (error) {
    console.warn('fetchCryptoMarkets error:', error);
    return [];
  }
}

// ==================== STOCKS ====================
export async function fetchStockQuote(symbol) {
  if (!FINNHUB_KEY) {
    const mock = MOCK_STOCKS.find(s => s.symbol === symbol);
    return mock || { c: 0, d: 0, dp: 0, v: 0 };
  }
  try {
    const response = await fetch(`${FINNHUB_API}/quote?symbol=${symbol}&token=${FINNHUB_KEY}`, { next: { revalidate: 30 } });
    if (!response.ok) throw new Error('Failed');
    return await response.json();
  } catch (error) {
    const mock = MOCK_STOCKS.find(s => s.symbol === symbol);
    return mock || { c: 0, d: 0, dp: 0, v: 0 };
  }
}

export function getMockStocks() {
  return MOCK_STOCKS;
}

// ==================== FOREX ====================
export async function fetchForexRates(base = 'USD') {
  try {
    const response = await fetch(`${FRANKFURTER_API}/latest?from=${base}`, { next: { revalidate: 300 } });
    if (!response.ok) throw new Error('Failed');
    return await response.json();
  } catch (error) {
    return null;
  }
}

// ==================== NEWS ====================
export async function fetchNewsAPI(query = 'finance', pageSize = 20) {
  if (WORLDNEWS_KEY) {
    try {
      const res = await fetch(`${WORLDNEWS_API}/search-news?text=${encodeURIComponent(query)}&number=${pageSize}&api-key=${WORLDNEWS_KEY}`, { next: { revalidate: 300 } });
      if (res.ok) {
        const data = await res.json();
        return (data.news || []).map((article, index) => ({
          id: `news-${index}`, title: article.title || 'No Title', source: article.source?.name || 'World News',
          publishedAt: article.publish_date || new Date().toISOString(), category: 'Finance', sentiment: 'neutral', url: article.url || '#',
        }));
      }
    } catch (err) {}
  }
  if (NEWS_KEY) {
    try {
      const response = await fetch(`${NEWS_API}/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=${pageSize}&apiKey=${NEWS_KEY}`, { next: { revalidate: 300 } });
      if (response.ok) {
        const data = await response.json();
        return data.articles || [];
      }
    } catch (error) {}
  }
  return MOCK_NEWS;
}

// ==================== MACRO ====================
export async function fetchFREDData(seriesId) {
  if (!FRED_KEY) {
    const mock = MOCK_MACRO.find(m => m.id === seriesId);
    return mock ? { observations: [{ date: mock.date, value: String(mock.value) }, { date: mock.date, value: String(mock.value * 0.99) }] } : { observations: [] };
  }
  try {
    const response = await fetch(`${FRED_API}/series/observations?series_id=${seriesId}&api_key=${FRED_KEY}&file_type=json&sort_order=desc&limit=100`, { next: { revalidate: 3600 } });
    if (!response.ok) throw new Error('Failed');
    return await response.json();
  } catch (error) {
    const mock = MOCK_MACRO.find(m => m.id === seriesId);
    return mock ? { observations: [{ date: mock.date, value: String(mock.value) }, { date: mock.date, value: String(mock.value * 0.99) }] } : { observations: [] };
  }
}

export function getMockMacro() {
  return MOCK_MACRO;
}

// ==================== EARTHQUAKES ====================
export async function fetchEarthquakes(timeRange = 'day') {
  try {
    const response = await fetch(`${USGS_API}/summary/${timeRange}_m25.geojson`, { next: { revalidate: 300 } });
    if (!response.ok) throw new Error('Failed');
    const data = await response.json();
    return data.features || [];
  } catch (error) {
    return [];
  }
}

// ==================== WEATHER ====================
export async function fetchWeather(city) {
  if (!OWM_KEY) {
    const mock = MOCK_WEATHER.find(w => w.city === city);
    return mock ? { main: { temp: mock.temp, humidity: mock.humidity }, weather: [{ main: mock.condition }], wind: { speed: mock.wind } } : null;
  }
  try {
    const response = await fetch(`${OWM_API}/weather?q=${city}&appid=${OWM_KEY}&units=metric`, { next: { revalidate: 600 } });
    if (!response.ok) throw new Error('Failed');
    return await response.json();
  } catch (error) {
    const mock = MOCK_WEATHER.find(w => w.city === city);
    return mock ? { main: { temp: mock.temp, humidity: mock.humidity }, weather: [{ main: mock.condition }], wind: { speed: mock.wind } } : null;
  }
}

export function getMockWeather() {
  return MOCK_WEATHER;
}

// ==================== FUNDING RATE ====================
export async function fetchFundingRate(symbol) {
  try {
    const response = await fetch(`${BINANCE_FAPI}/fundingRate?symbol=${symbol}&limit=1`, { next: { revalidate: 60 } });
    if (!response.ok) throw new Error('Failed');
    const data = await response.json();
    return data[0] || null;
  } catch (error) {
    return null;
  }
}

// ==================== WEBSOCKET ====================
export function createBinanceWebSocket(symbols) {
  const streams = symbols.map(s => `${s.toLowerCase()}@ticker`).join('/');
  return new WebSocket(`${BINANCE_WS}/${streams}`);
}

export function createBinanceTradeSocket(symbol) {
  return new WebSocket(`${BINANCE_WS}/${symbol.toLowerCase()}@trade`);
}

export function createBinanceDepthSocket(symbol) {
  return new WebSocket(`${BINANCE_WS}/${symbol.toLowerCase()}@depth20@100ms`);
}

// ==================== FORMAT HELPERS ====================
export function formatNumber(num, decimals = 2) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  if (num >= 1e12) return (num / 1e12).toFixed(decimals) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(decimals) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(decimals) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(decimals) + 'K';
  return num.toFixed(decimals);
}

export function formatPrice(price) {
  if (price === null || price === undefined || isNaN(price)) return '0.00';
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(2);
  if (price >= 0.01) return price.toFixed(4);
  return price.toFixed(6);
}

export function formatPercentage(value) {
  if (value === null || value === undefined || isNaN(value)) return '0.00%';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatTimeAgo(timestamp) {
  if (!timestamp) return 'N/A';
  const now = Date.now();
  const time = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
  if (isNaN(time)) return 'N/A';
  const seconds = Math.floor((now - time) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
