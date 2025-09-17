// src/components/TradingViewWidget.jsx
import React, { useEffect, useRef, memo } from 'react'

const TradingViewWidget = ({
  symbols = [
    {
      "proName": "FOREXCOM:SPXUSD",
      "title": "S&P 500"
    },
    {
      "proName": "FOREXCOM:NSXUSD",
      "title": "US 100"
    },
    {
      "proName": "FX_IDC:EURUSD",
      "title": "EUR/USD"
    },
    {
      "proName": "BITSTAMP:BTCUSD",
      "title": "Bitcoin"
    },
    {
      "proName": "BITSTAMP:ETHUSD",
      "title": "Ethereum"
    }
  ]
}) => {
  const container = useRef(null)

  useEffect(() => {
    if (!container.current) return

    // Clear any existing content
    container.current.innerHTML = ''

    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js"
    script.type = "text/javascript"
    script.async = true
    script.innerHTML = JSON.stringify({
      symbols,
      colorTheme: "dark",
      isTransparent: true,
      displayMode: "regular",
      locale: "en",
      autosize: true,
      hideTopToolbar: true,
      hideVolume: true,
      hideDateRanges: true
    })

    // Create widget container
    const widgetDiv = document.createElement('div')
    widgetDiv.className = 'tradingview-widget-container__widget'

    const containerDiv = document.createElement('div')
    containerDiv.className = 'tradingview-widget-container'
    containerDiv.style.width = '100%'
    containerDiv.style.height = 'auto'
    containerDiv.style.minHeight = '46px'

    containerDiv.appendChild(widgetDiv)
    containerDiv.appendChild(script)

    container.current.appendChild(containerDiv)

    return () => {
      if (container.current) {
        container.current.innerHTML = ''
      }
    }
  }, [symbols])

  return (
    <section className="py-8">
      <style>{`
        .tradingview-widget-container__widget {
          pointer-events: none !important;
        }
        .tradingview-widget-container__widget * {
          pointer-events: none !important;
        }
        /* Hide TradingView logo and branding */
        .tradingview-widget-container__widget a[href*="tradingview.com"],
        .tradingview-widget-container__widget .tradingview-widget-logo,
        .tradingview-widget-container__widget .tv-widget-logo {
          display: none !important;
        }
        .label-dzbd7lyV label-e9c6dycV end-dzbd7lyV top-dzbd7lyV js-copyright-label {
          display: none;
        }
      `}</style>
      <div className="max-w-2xl mx-auto px-2 sm:px-2 lg:px-2 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div
            ref={container}
            className="w-full pointer-events-none"
            style={{
              minHeight: '46px',
              height: 'auto',
              overflow: 'visible'
            }}
          />
        </div>
      </div>
    </section>
  )
}

export default memo(TradingViewWidget)