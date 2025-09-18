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

    // Thêm observer để ẩn logo sau khi widget load
    const observer = new MutationObserver(() => {
      hideTradingViewLogo()
    })

    observer.observe(container.current, {
      childList: true,
      subtree: true
    })

    return () => {
      observer.disconnect()
      if (container.current) {
        container.current.innerHTML = ''
      }
    }
  }, [symbols])


  return (
    <section className="py-8">
      <style>{`
        /* PHƯƠNG PHÁP 3: Clip-path để cắt góc */
        .clip-logo-container {
          clip-path: polygon(0 0, calc(100% - 80px) 0, calc(100% - 80px) 100%, 0 100%);
          /* THAY ĐỔI 80px THÀNH GIÁ TRỊ KHÁC ĐỂ CẮT NHIỀU/ÍT HƠN */
        }

        /* Ẩn iframe scrollbar */
        .tradingview-widget-container iframe {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        
        .tradingview-widget-container iframe::-webkit-scrollbar {
          display: none !important;
        }

        /* Text selection disabled */
        .tradingview-widget-container * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }
      `}</style>

        <div className="max-w-7xl ml-auto sm:px-6 lg:px-8 relative pr-4 ">
          <div className="clip-logo-container">
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