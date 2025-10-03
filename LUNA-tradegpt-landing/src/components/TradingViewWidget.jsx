import React, { useEffect, useRef, memo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

function normalizeInterval(interval) {
  if (!interval) return 'D';
  const map = {
    '1min': '1', '01min': '1', '1m': '1',
    '5min': '5', '05min': '5', '5m': '5',
    '15min': '15', '15m': '15',
    '30min': '30', '30m': '30',
    '60min': '60', '60m': '60',
    '120min': '120', '120m': '120',
    '180min': '180', '180m': '180',
    '240min': '240', '240m': '240',
    '1day': 'D', '1d': 'D', 'D': 'D',
    '1week': 'W', '1w': 'W', 'W': 'W',
    '1month': 'M', '1mo': 'M', 'M': 'M',
  };
  const norm = String(interval).toLowerCase().replace(/\s/g, '');
  return map[norm] || interval;
}

function TradingViewWidget({ symbol, theme = 'dark', locale = 'en', artifact, height }) {
  const container = useRef(null);
  const mountedRef = useRef(false);
  const lastInitKeyRef = useRef('');
  const isMobile = typeof useIsMobile === 'function' ? useIsMobile() : (typeof window !== 'undefined' && window.innerWidth <= 640);

  const chartSymbol = artifact?.exchange_symbol || symbol || 'NASDAQ:AAPL';
  const chartInterval = normalizeInterval(artifact?.interval) || 'D';
  const chartStudies = Array.isArray(artifact?.studies) ? artifact.studies : [];
  const chartTheme = artifact?.theme || theme;
  const chartLocale = artifact?.locale || locale;
  const computedHeight = height ?? (isMobile ? 300 : 650);
  const id = React.useId().replace(/:/g, '');

  useEffect(() => {
    mountedRef.current = true;
    if (!container.current || !container.current.isConnected) return;

    const studies = Array.isArray(chartStudies) ? chartStudies : [];
    const initKey = `${chartSymbol}|${chartInterval}|${chartTheme}|${chartLocale}|${computedHeight}|${studies.length ? JSON.stringify(studies) : ''}`;
    if (lastInitKeyRef.current === initKey) return;
    lastInitKeyRef.current = initKey;

    // Remove previous embed scripts only
    try {
      container.current.querySelectorAll('script[src*="tradingview.com/external-embedding"]').forEach(s => s.parentElement?.removeChild(s));
    } catch {}

    // Ensure inner widget div exists
    let widget = container.current.querySelector('.tradingview-widget-container__widget');
    if (!widget) {
      widget = document.createElement('div');
      widget.className = 'tradingview-widget-container__widget';
      widget.style.height = '100%';
      widget.style.minHeight = `${computedHeight}px`;
      widget.style.width = '100%';
      container.current.appendChild(widget);
    }

    const config = {
      allow_symbol_change: true,
      calendar: false,
      details: false,
      hide_side_toolbar: true,
      hide_top_toolbar: false,
      hide_legend: false,
      hide_volume: false,
      hotlist: false,
      interval: chartInterval,
      locale: chartLocale,
      save_image: true,
      style: '1',
      symbol: chartSymbol,
      theme: chartTheme,
      timezone: 'Asia/Ho_Chi_Minh',
      backgroundColor: '#0F0F0F',
      gridColor: 'rgba(242, 242, 242, 0.06)',
      watchlist: [],
      withdateranges: false,
      compareSymbols: [],
      ...(studies.length ? { studies } : {}),
      // IMPORTANT: disable autosize and set explicit size so height prop is respected
      autosize: false,
      width: '100%',
      height: computedHeight,
      support_host: 'https://www.tradingview.com',
    };

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify(config);
    requestAnimationFrame(() => {
      if (mountedRef.current && container.current && container.current.isConnected) {
        container.current.appendChild(script);
      }
    });

    return () => { mountedRef.current = false; };
  }, [chartSymbol, chartTheme, chartLocale, chartInterval, computedHeight, JSON.stringify(chartStudies)]);

  // computedHeight already defined above

  return (
    <div
      className="tradingview-widget-container"
      data-tv-id={id}
      ref={container}
      style={{ height: `${computedHeight}px`, minHeight: `${computedHeight}px`, width: '100%' }}
    >
      {/* Force height with an inline style tag to beat possible overrides */}
      <style>{`[data-tv-id="${id}"]{height:${computedHeight}px !important;min-height:${computedHeight}px !important}[data-tv-id="${id}"] .tradingview-widget-container__widget{height:100% !important;min-height:${computedHeight}px !important}`}</style>
      <div className="tradingview-widget-container__widget" style={{ height: '100%', minHeight: `${computedHeight}px`, width: '100%' }} />
    </div>
  );
}

export default memo(TradingViewWidget);


