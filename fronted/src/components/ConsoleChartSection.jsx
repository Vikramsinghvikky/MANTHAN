import React, { useState, useMemo, useRef } from 'react'
import { formatINR } from '../utils/formatters'

const STOCK_METRICS = {
  PLNX: { close: 80.55, changePct: '+8.54%', high: 80.66, low: 71.50, volume: '281.2M', volRatio: '2.64x SMA20', smaRatio: '1.1213 (Golden cross)', rsi: '61.4', min: 65, max: 85 },
  AERX: { close: 489.02, changePct: '+4.12%', high: 494.50, low: 472.00, volume: '142.8M', volRatio: '1.82x SMA20', smaRatio: '1.0420 (Bullish trend)', rsi: '57.8', min: 450, max: 510 },
  BLUX: { close: 223.36, changePct: '-3.45%', high: 231.20, low: 221.00, volume: '98.4M', volRatio: '1.18x SMA20', smaRatio: '0.9650 (Death cross)', rsi: '42.1', min: 210, max: 245 },
  ORCX: { close: 169.66, changePct: '-1.85%', high: 174.50, low: 168.20, volume: '64.2M', volRatio: '0.94x SMA20', smaRatio: '0.9810 (Bearish trend)', rsi: '46.2', min: 160, max: 185 },
  ROUT: { close: 60.73, changePct: '+1.20%', high: 61.80, low: 59.40, volume: '115.0M', volRatio: '1.05x SMA20', smaRatio: '1.0110 (Neutral)', rsi: '51.4', min: 55, max: 68 },
  DSNY: { close: 112.03, changePct: '+2.60%', high: 114.20, low: 109.10, volume: '88.6M', volRatio: '1.32x SMA20', smaRatio: '1.0250 (Bullish trend)', rsi: '54.9', min: 100, max: 125 },
  HAVN: { close: 142.80, changePct: '+0.85%', high: 144.50, low: 140.20, volume: '42.1M', volRatio: '0.88x SMA20', smaRatio: '1.0080 (Neutral)', rsi: '50.2', min: 135, max: 155 },
  HMDP: { close: 315.40, changePct: '+3.10%', high: 318.00, low: 306.50, volume: '76.3M', volRatio: '1.45x SMA20', smaRatio: '1.0310 (Bullish trend)', rsi: '59.1', min: 295, max: 330 },
  MOTR: { close: 512.20, changePct: '+5.40%', high: 518.50, low: 488.00, volume: '190.5M', volRatio: '2.10x SMA20', smaRatio: '1.0850 (Strong bull)', rsi: '64.8', min: 470, max: 535 },
}

export function ConsoleChartSection({
  selectedStock,
  onSelectStock,
  stockUniverse,
  recentTrades,
  onInspectTrade,
  breakingNews,
}) {
  const [chartMode, setChartMode] = useState('line') // 'line' | 'candles'
  const [hoverIndex, setHoverIndex] = useState(null)
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const svgRef = useRef(null)

  const defaultMetrics = STOCK_METRICS[selectedStock] || STOCK_METRICS.PLNX

  // 50-bar deterministic series scaled to active stock
  const barsCount = 50
  const historicalBars = useMemo(() => {
    const bars = []
    const range = defaultMetrics.max - defaultMetrics.min
    let basePrice = defaultMetrics.min + range * 0.35

    for (let i = 0; i < barsCount; i++) {
      let step = (Math.sin(i * 0.38) * (range * 0.04)) + (i > 35 ? (range * 0.035) : (range * 0.008))
      if (i === barsCount - 1) {
        basePrice = defaultMetrics.close
      } else {
        basePrice = Math.max(defaultMetrics.min, Math.min(defaultMetrics.max, basePrice + step))
      }
      const isUp = i === 0 ? true : basePrice >= (bars[i - 1]?.close || basePrice)
      const open = isUp ? basePrice - (range * 0.03) : basePrice + (range * 0.025)
      const high = Math.max(open, basePrice) + (range * 0.02)
      const low = Math.min(open, basePrice) - (range * 0.02)
      const volume = i === barsCount - 1 ? 281.2 : 80 + Math.sin(i * 0.5) * 40 + (i > 38 ? 60 : 0)

      bars.push({
        day: i + 1,
        open,
        high,
        low,
        close: basePrice,
        volume,
        isUp,
      })
    }

    for (let i = 0; i < barsCount; i++) {
      const slice5 = bars.slice(Math.max(0, i - 4), i + 1)
      bars[i].sma5 = slice5.reduce((acc, b) => acc + b.close, 0) / slice5.length

      const slice20 = bars.slice(Math.max(0, i - 19), i + 1)
      bars[i].sma20 = slice20.reduce((acc, b) => acc + b.close, 0) / slice20.length

      const rsiVal = 50 + Math.sin(i * 0.25) * 12 + (i > 38 ? 10 : 0)
      bars[i].rsi = rsiVal.toFixed(1)
    }
    return bars
  }, [selectedStock, defaultMetrics])

  // SVG Coordinates
  const svgWidth = 800
  const svgHeight = 320
  const leftX = 24
  const rightX = 720
  const plotWidth = rightX - leftX

  const priceTopY = 16
  const priceBottomY = 200
  const priceHeight = priceBottomY - priceTopY

  const volTopY = 232
  const volBottomY = 296
  const volHeight = volBottomY - volTopY

  const minP = defaultMetrics.min
  const maxP = defaultMetrics.max
  const pRange = maxP - minP

  const getX = (index) => leftX + (index / (barsCount - 1)) * plotWidth
  const getY = (val) => priceBottomY - ((val - minP) / pRange) * priceHeight
  const getVolY = (vol) => volBottomY - (Math.min(vol, 300) / 300) * volHeight

  const handleMouseMove = (e) => {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const rawX = e.clientX - rect.left
    const rawY = e.clientY - rect.top
    const scaleX = svgWidth / rect.width
    const scaleY = svgHeight / rect.height
    const x = Math.max(leftX, Math.min(rightX, rawX * scaleX))
    const y = Math.max(priceTopY, Math.min(priceBottomY, rawY * scaleY))

    const ratio = (x - leftX) / plotWidth
    const idx = Math.min(barsCount - 1, Math.max(0, Math.round(ratio * (barsCount - 1))))
    setHoverIndex(idx)
    setCursorPos({ x, y })
  }

  const handleMouseLeave = () => {
    setHoverIndex(null)
  }

  const activeBar = hoverIndex !== null ? historicalBars[hoverIndex] : historicalBars[barsCount - 1]
  const prevBar = hoverIndex !== null && hoverIndex > 0 ? historicalBars[hoverIndex - 1] : historicalBars[barsCount - 2]
  const activeChange = activeBar.close - prevBar.close
  const activeChangePct = ((activeChange / prevBar.close) * 100).toFixed(2)

  const closePoints = historicalBars.map((b, i) => `${getX(i)},${getY(b.close)}`).join(' ')
  const sma5Points = historicalBars.map((b, i) => `${getX(i)},${getY(b.sma5)}`).join(' ')
  const sma20Points = historicalBars.map((b, i) => `${getX(i)},${getY(b.sma20)}`).join(' ')

  const buyIndex = 36
  const sellIndex = 49
  const buyBar = historicalBars[buyIndex]
  const sellBar = historicalBars[sellIndex]

  const buyX = getX(buyIndex)
  const buyY = getY(buyBar.close)
  const sellX = getX(sellIndex)
  const sellY = getY(sellBar.close)

  const tradeSlice = historicalBars.slice(buyIndex, sellIndex + 1)
  const tradeCurve = tradeSlice.map((b, idx) => `${getX(buyIndex + idx)},${getY(b.close)}`).join(' ')
  const pnlPolygonPoints = `${tradeCurve} ${sellX},${priceBottomY} ${buyX},${priceBottomY}`

  const newsX = getX(36)
  const smaVolY = getVolY(110)

  const pLevels = [
    maxP,
    minP + pRange * 0.75,
    minP + pRange * 0.50,
    minP + pRange * 0.25,
    minP,
  ]

  const hoveredPrice = maxP - ((cursorPos.y - priceTopY) / priceHeight) * pRange

  return (
    <div className="w-full flex flex-col bg-[#FAF8F3] dark:bg-[#11161F] border border-[#D5D0C3] dark:border-[#1E2633] text-[#1C2026] dark:text-[#E5E9F0] select-none transition-colors rounded-[2px] font-sans">
      {/* 1. Connected Stock Tab Strip (Sentence case labels, no bracket buttons) */}
      <div className="flex items-center overflow-x-auto scrollbar-none border-b border-[#D5D0C3] dark:border-[#1E2633] bg-[#EFECE2]/60 dark:bg-[#0B0E14] text-xs">
        {stockUniverse.map((s) => {
          const isActive = selectedStock === s.ticker
          return (
            <button
              key={s.ticker}
              onClick={() => onSelectStock(s.ticker)}
              className={`px-3 py-2 font-medium transition-colors border-r border-[#D5D0C3] dark:border-[#1E2633] rounded-none shrink-0 ${
                isActive
                  ? 'bg-[#FAF8F3] dark:bg-[#11161F] text-[#1C2026] dark:text-[#E5E9F0] border-b-2 border-b-slate-700 dark:border-b-slate-300 font-semibold'
                  : 'text-[#475569] dark:text-[#94A3B8] hover:text-[#1C2026] dark:hover:text-[#E5E9F0]'
              }`}
            >
              {s.ticker}
            </button>
          )
        })}
      </div>

      {/* 2. Top 5-Column Mini-Grid Readout (Sentence case labels, Plex Sans for labels, Mono for numbers) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 border-b border-[#D5D0C3] dark:border-[#1E2633] text-xs divide-x divide-[#D5D0C3] dark:divide-[#1E2633] bg-[#FAF8F3] dark:bg-[#11161F]">
        {/* Metric 1: Close */}
        <div className="p-2.5">
          <div className="text-xs text-[#475569] dark:text-[#94A3B8] flex items-center justify-between">
            <span>Close price</span>
            {hoverIndex !== null && (
              <span className="font-mono text-sky-700 dark:text-sky-400">Bar #{hoverIndex + 1}</span>
            )}
          </div>
          <div className="text-base font-semibold font-mono tabular-nums text-[#1C2026] dark:text-[#E5E9F0] mt-0.5">
            {formatINR(activeBar.close)}
            <span className={`text-xs ml-1 font-sans ${activeChange >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
              ({activeChange >= 0 ? '+' : ''}{activeChangePct}%)
            </span>
          </div>
        </div>

        {/* Metric 2: Day High / Low */}
        <div className="p-2.5">
          <div className="text-xs text-[#475569] dark:text-[#94A3B8]">
            Day high / low
          </div>
          <div className="text-base font-semibold font-mono tabular-nums text-[#1C2026] dark:text-[#E5E9F0] mt-0.5">
            {formatINR(activeBar.high)} / {formatINR(activeBar.low)}
          </div>
        </div>

        {/* Metric 3: Volume */}
        <div className="p-2.5">
          <div className="text-xs text-[#475569] dark:text-[#94A3B8]">
            Day volume
          </div>
          <div className="text-base font-semibold font-mono tabular-nums text-[#1C2026] dark:text-[#E5E9F0] mt-0.5">
            {typeof activeBar.volume === 'number' ? `${activeBar.volume.toFixed(1)}M` : activeBar.volume}
            <span className="text-xs text-[#475569] dark:text-[#94A3B8] ml-1 font-normal font-sans">
              ({(activeBar.volume / 106.5).toFixed(2)}x SMA20)
            </span>
          </div>
        </div>

        {/* Metric 4: SMA Ratio */}
        <div className="p-2.5">
          <div className="text-xs text-[#475569] dark:text-[#94A3B8]">
            SMA5 / SMA20
          </div>
          <div className="text-base font-semibold font-mono tabular-nums text-[#1C2026] dark:text-[#E5E9F0] mt-0.5 truncate">
            {(activeBar.sma5 / activeBar.sma20).toFixed(4)} <span className="font-sans text-xs font-normal">({activeBar.sma5 >= activeBar.sma20 ? 'Golden' : 'Death'})</span>
          </div>
        </div>

        {/* Metric 5: Wilder RSI */}
        <div className="p-2.5 col-span-2 sm:col-span-1">
          <div className="text-xs text-[#475569] dark:text-[#94A3B8]">
            Wilder RSI (14)
          </div>
          <div className="text-base font-semibold font-mono tabular-nums text-[#1C2026] dark:text-[#E5E9F0] mt-0.5">
            {activeBar.rsi || defaultMetrics.rsi} <span className="text-xs text-[#475569] dark:text-[#94A3B8] font-normal font-sans">/ 100</span>
          </div>
        </div>
      </div>

      {/* 3. News Catalyst Strip (Sentence case, no bracket buttons) */}
      <div className="px-3 py-1.5 border-b border-[#D5D0C3] dark:border-[#1E2633] flex items-center justify-between gap-2 text-xs bg-[#EFECE2]/50 dark:bg-[#0B0E14]">
        <div className="flex items-center space-x-2 overflow-hidden">
          <span className="font-semibold text-amber-800 dark:text-amber-400 shrink-0">
            T+150ms news:
          </span>
          <span className="font-semibold text-[#1C2026] dark:text-[#E5E9F0] shrink-0">
            {breakingNews.ticker || selectedStock}:
          </span>
          <span className="text-[#1C2026] dark:text-[#E5E9F0] truncate font-sans text-xs italic">
            "{breakingNews.headline || 'Q3 operational momentum continues on accelerated export growth'}"
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs shrink-0">
          <span className="text-emerald-700 dark:text-emerald-400 font-medium hidden md:inline">
            Negation: [not -&gt; decline] flipped positive
          </span>
          <span className="font-mono font-semibold text-[#1C2026] dark:text-[#E5E9F0]">
            Score: +2.4
          </span>
        </div>
      </div>

      {/* 4. Chart Header: Mode Toggle (Sentence case, no bracket buttons) & Legend */}
      <div className="flex items-center justify-between px-3 py-1.5 text-xs text-[#475569] dark:text-[#94A3B8] border-b border-[#D5D0C3]/60 dark:border-[#1E2633]/60">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-0.5 bg-slate-700 dark:bg-slate-300 inline-block"></span>
            <span className="text-[#1C2026] dark:text-[#E5E9F0] font-mono">Close ({formatINR(defaultMetrics.close)})</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-0.5 bg-slate-500 inline-block"></span>
            <span className="text-[#475569] dark:text-[#94A3B8]">SMA 5</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-0.5 border-b border-dashed border-amber-600 inline-block"></span>
            <span className="text-amber-700 dark:text-amber-400">SMA 20</span>
          </span>
          <span className="hidden sm:flex items-center space-x-1">
            <span className="w-2 h-2 bg-emerald-500/20 border border-emerald-500/50 inline-block"></span>
            <span className="text-emerald-700 dark:text-emerald-400">P&amp;L trade ribbon (+11.1%)</span>
          </span>
        </div>

        {/* Right side controls: Mode Toggle (Sentence case, no bracket buttons) */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center border border-[#D5D0C3] dark:border-[#1E2633] bg-[#EFECE2] dark:bg-[#0B0E14] rounded-[2px] text-xs">
            <button
              onClick={() => setChartMode('line')}
              className={`px-2 py-0.5 font-medium transition-colors ${
                chartMode === 'line'
                  ? 'bg-[#1D5582] text-[#FAF8F3]'
                  : 'text-[#1C2026] dark:text-[#E5E9F0] hover:bg-[#D5D0C3]'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartMode('candles')}
              className={`px-2 py-0.5 font-medium transition-colors ${
                chartMode === 'candles'
                  ? 'bg-[#1D5582] text-[#FAF8F3]'
                  : 'text-[#1C2026] dark:text-[#E5E9F0] hover:bg-[#D5D0C3]'
              }`}
            >
              Candles
            </button>
          </div>
          <span className="text-xs text-[#475569] dark:text-[#94A3B8] hidden sm:inline">50-bar buffer</span>
        </div>
      </div>

      {/* 5. SVG Canvas with Crosshair & Dedicated Gutter */}
      <div className="flex-1 w-full p-2 relative flex flex-col justify-between">
        <div className="w-full h-64 sm:h-72 relative cursor-crosshair">
          <svg
            ref={svgRef}
            className="w-full h-full"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="none"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Horizontal Gridlines & Right-Side Price Scale */}
            {pLevels.map((p, idx) => {
              const y = getY(p)
              return (
                <g key={idx}>
                  <line
                    x1={leftX}
                    y1={y}
                    x2={rightX}
                    y2={y}
                    stroke="currentColor"
                    className="text-[#D5D0C3] dark:text-[#1E2633]"
                    strokeDasharray="2 3"
                    strokeWidth="0.75"
                  />
                  <text
                    x={rightX + 6}
                    y={y + 3.5}
                    className="fill-[#475569] dark:fill-[#94A3B8] text-[10px] font-mono tabular-nums"
                  >
                    {formatINR(p, 1)}
                  </text>
                </g>
              )
            })}

            {/* Separator Between Price and Volume Sub-Pane */}
            <line
              x1={leftX}
              y1={priceBottomY + 12}
              x2={rightX}
              y2={priceBottomY + 12}
              stroke="currentColor"
              className="text-[#D5D0C3] dark:text-[#1E2633]"
              strokeWidth="1"
            />
            <text
              x={rightX + 6}
              y={priceBottomY + 15}
              className="fill-[#475569] dark:fill-[#94A3B8] text-[10px] font-mono"
            >
              Vol
            </text>

            {/* Shaded P&L Polygon Ribbon */}
            <polygon
              points={pnlPolygonPoints}
              className="fill-emerald-500/15 dark:fill-emerald-500/20"
            />

            {/* News Shock Vertical Marker at Bar 36 */}
            <line
              x1={newsX}
              y1={priceTopY}
              x2={newsX}
              y2={priceBottomY}
              stroke="#D97706"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />
            <g>
              <rect
                x={newsX - 32}
                y={priceTopY + 2}
                width="64"
                height="15"
                className="fill-[#FAF8F3] dark:fill-[#11161F] stroke-amber-600 dark:stroke-amber-500"
                strokeWidth="1"
                rx="2"
              />
              <text
                x={newsX}
                y={priceTopY + 13}
                textAnchor="middle"
                className="fill-amber-700 dark:fill-amber-400 font-mono text-[9px] font-semibold"
              >
                News +2.4
              </text>
            </g>

            {/* Candlestick or Line View */}
            {chartMode === 'candles' ? (
              historicalBars.map((b, i) => {
                const x = getX(i)
                const highY = getY(b.high)
                const lowY = getY(b.low)
                const openY = getY(b.open)
                const closeY = getY(b.close)
                const bodyTop = Math.min(openY, closeY)
                const bodyHeight = Math.max(2, Math.abs(closeY - openY))
                const candleColor = b.isUp ? '#059669' : '#DC2626'

                return (
                  <g key={i}>
                    <line
                      x1={x}
                      y1={highY}
                      x2={x}
                      y2={lowY}
                      stroke={candleColor}
                      strokeWidth="1"
                    />
                    <rect
                      x={x - 3}
                      y={bodyTop}
                      width="6"
                      height={bodyHeight}
                      fill={candleColor}
                    />
                  </g>
                )
              })
            ) : (
              <polyline
                points={closePoints}
                fill="none"
                stroke="#334155"
                className="dark:stroke-slate-300"
                strokeWidth="1.8"
              />
            )}

            {/* SMA 20 Dashed Baseline */}
            <polyline
              points={sma20Points}
              fill="none"
              stroke="#D97706"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />

            {/* SMA 5 Line */}
            <polyline
              points={sma5Points}
              fill="none"
              stroke="#64748B"
              strokeWidth="1.2"
            />

            {/* Trade Crosshairs */}
            <line
              x1={buyX}
              y1={buyY}
              x2={buyX}
              y2={priceBottomY}
              stroke="#059669"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            <line
              x1={sellX}
              y1={sellY}
              x2={sellX}
              y2={priceBottomY}
              stroke="#0284C7"
              strokeWidth="1"
              strokeDasharray="2 2"
            />

            {/* Anchored BUY Tag Flag */}
            <g
              className="cursor-pointer"
              onClick={() => onInspectTrade && onInspectTrade(recentTrades[3] || recentTrades[0])}
            >
              <rect
                x={buyX - 28}
                y={buyY - 22}
                width="56"
                height="16"
                className="fill-[#FAF8F3] dark:fill-[#11161F] stroke-emerald-600 dark:stroke-emerald-500"
                strokeWidth="1"
                rx="2"
              />
              <text
                x={buyX}
                y={buyY - 10}
                textAnchor="middle"
                className="fill-emerald-700 dark:fill-emerald-400 font-mono text-[9px] font-semibold"
              >
                Buy {formatINR(buyBar.close, 1)}
              </text>
              <circle cx={buyX} cy={buyY} r="2.5" fill="#059669" />
            </g>

            {/* Anchored SELL Tag Flag */}
            <g
              className="cursor-pointer"
              onClick={() => onInspectTrade && onInspectTrade(recentTrades[0])}
            >
              <rect
                x={sellX - 74}
                y={sellY - 24}
                width="64"
                height="16"
                className="fill-[#FAF8F3] dark:fill-[#11161F] stroke-sky-600 dark:stroke-sky-500"
                strokeWidth="1"
                rx="2"
              />
              <text
                x={sellX - 42}
                y={sellY - 12}
                textAnchor="middle"
                className="fill-sky-700 dark:fill-sky-400 font-mono text-[9px] font-semibold"
              >
                Sell {formatINR(sellBar.close, 1)}
              </text>
              <circle cx={sellX} cy={sellY} r="2.5" fill="#0284C7" />
            </g>

            {/* Bottom Volume Histogram */}
            {historicalBars.map((b, i) => {
              const x = getX(i) - 2.5
              const y = getVolY(b.volume)
              const h = volBottomY - y
              const barFill = b.isUp ? '#059669' : '#DC2626'
              return (
                <rect
                  key={i}
                  x={x}
                  y={y}
                  width="5"
                  height={Math.max(2, h)}
                  fill={barFill}
                  opacity="0.8"
                />
              )
            })}

            {/* SMA20 Volume Line */}
            <line
              x1={leftX}
              y1={smaVolY}
              x2={rightX}
              y2={smaVolY}
              stroke="#D97706"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <text
              x={rightX + 6}
              y={smaVolY + 3}
              className="fill-amber-700 dark:fill-amber-400 text-[9px] font-mono"
            >
              SMA20
            </text>

            {/* X-Axis Date Markers */}
            {[
              { idx: 0, label: 'Day 1' },
              { idx: 12, label: 'Day 5' },
              { idx: 24, label: 'Day 10' },
              { idx: 36, label: 'Day 15' },
              { idx: 49, label: 'Day 18 (Live)' },
            ].map((m) => (
              <text
                key={m.label}
                x={getX(m.idx)}
                y={svgHeight - 4}
                textAnchor="middle"
                className="fill-[#475569] dark:fill-[#94A3B8] text-[9.5px] font-mono"
              >
                {m.label}
              </text>
            ))}

            {/* Interactive Hover Crosshair Overlay */}
            {hoverIndex !== null && (
              <g pointerEvents="none">
                <line
                  x1={getX(hoverIndex)}
                  y1={priceTopY}
                  x2={getX(hoverIndex)}
                  y2={volBottomY}
                  stroke="#1D5582"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <line
                  x1={leftX}
                  y1={cursorPos.y}
                  x2={rightX}
                  y2={cursorPos.y}
                  stroke="#1D5582"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <rect
                  x={rightX + 4}
                  y={cursorPos.y - 7}
                  width="52"
                  height="14"
                  className="fill-[#1D5582]"
                  rx="1"
                />
                <text
                  x={rightX + 30}
                  y={cursorPos.y + 3}
                  textAnchor="middle"
                  className="fill-white text-[9px] font-mono font-semibold tabular-nums"
                >
                  {formatINR(hoveredPrice, 1)}
                </text>
                <circle
                  cx={getX(hoverIndex)}
                  cy={getY(historicalBars[hoverIndex].close)}
                  r="3.5"
                  className="fill-sky-400 stroke-[#1D5582]"
                  strokeWidth="1.5"
                />
              </g>
            )}
          </svg>
        </div>
      </div>
    </div>
  )
}
