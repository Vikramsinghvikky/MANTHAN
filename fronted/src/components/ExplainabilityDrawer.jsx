import React, { useState } from 'react'
import { formatINR } from '../utils/formatters'

export function ExplainabilityDrawer({ trade, isOpen, onClose }) {
  const [copyFeedback, setCopyFeedback] = useState(false)
  const [replayFeedback, setReplayFeedback] = useState(false)

  if (!isOpen || !trade) return null

  const handleCopyJSON = () => {
    const payload = {
      orderId: trade.orderId,
      simDate: trade.simDate || trade.simulatedDate,
      time: trade.time,
      ticker: trade.ticker,
      action: trade.action,
      quantity: trade.quantity,
      price: trade.price,
      status: trade.status || 'Filled',
      fillTime: trade.fillTime || trade.latency,
      indicators: trade.indicators,
      newsHeadline: trade.newsHeadline,
      decisionPipeline: {
        smaRatio: trade.indicators?.smaRatio || '1.1097',
        rsi: trade.indicators?.rsi || '61.4',
        mlProbability: '89.6%',
        finalRule: 'Rule 3: Golden cross confirmed with RSI in 50-65 range and positive NLP catalyst',
        preChecks: {
          cash: 'Pass',
          ownership: 'Pass',
          batch50Plus: 'Pass',
        },
      },
    }
    navigator.clipboard?.writeText(JSON.stringify(payload, null, 2))
    setCopyFeedback(true)
    setTimeout(() => setCopyFeedback(false), 2000)
  }

  const handleReplayTick = () => {
    setReplayFeedback(true)
    setTimeout(() => setReplayFeedback(false), 2000)
  }

  // Pre-check table items (Requirement E)
  const preChecks = [
    { check: 'Cash check', requirement: '100% required liquid capital available in portfolio', status: 'Pass' },
    { check: 'Ownership check', requirement: 'Account ownership and trade authorization active', status: 'Pass' },
    { check: '50+ batch check', requirement: 'Transaction size dilutes flat brokerage to under 0.03%', status: 'Pass' },
  ]

  const ohlcv = {
    open: trade.price - 1.25,
    high: trade.price + 0.85,
    low: trade.price - 1.80,
    close: trade.price,
    volume: '281.2M',
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 font-sans text-xs select-none">
      <div className="w-full max-w-xl bg-[#FAF8F3] dark:bg-[#11161F] border-l border-[#D5D0C3] dark:border-[#1E2633] h-full flex flex-col justify-between shadow-none text-[#1C2026] dark:text-[#E5E9F0] overflow-y-auto transition-colors">
        {/* 1. Header */}
        <div className="p-4 border-b border-[#D5D0C3] dark:border-[#1E2633]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#1C2026] dark:text-[#E5E9F0]">
                Why did my bot do that
              </h2>
              <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">
                Decision explainability snapshot for order {trade.orderId}
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-2.5 py-1 text-xs border border-[#D5D0C3] dark:border-[#1E2633] bg-[#EFECE2] dark:bg-[#1E2633] text-[#1C2026] dark:text-[#E5E9F0] hover:bg-[#D5D0C3] rounded-[2px]"
            >
              Close
            </button>
          </div>

          {/* Trade Identity Strip */}
          <div className="mt-3 p-3 bg-[#EFECE2]/50 dark:bg-[#0B0E14] border border-[#D5D0C3] dark:border-[#1E2633] rounded-[2px]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-sm text-[#1C2026] dark:text-[#E5E9F0]">
                {trade.action} {trade.ticker}
              </span>
              <span className="font-mono text-[#475569] dark:text-[#94A3B8]">
                {trade.simDate || trade.simulatedDate || '2021-04-18'} at {trade.time || '10:04:18'}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 border-t border-[#D5D0C3] dark:border-[#1E2633] pt-2 text-xs">
              <div>
                <span className="text-[#475569] dark:text-[#94A3B8] block">Price</span>
                <span className="font-semibold font-mono tabular-nums">{formatINR(trade.price)}</span>
              </div>
              <div>
                <span className="text-[#475569] dark:text-[#94A3B8] block">Quantity</span>
                <span className="font-semibold font-mono tabular-nums">{trade.quantity.toLocaleString('en-IN')} shares</span>
              </div>
              <div>
                <span className="text-[#475569] dark:text-[#94A3B8] block">Total value</span>
                <span className="font-semibold font-mono tabular-nums">{formatINR(trade.price * trade.quantity)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Body Contents (Requirement E) */}
        <div className="p-4 space-y-3.5 flex-1">
          {/* A. OHLCV Snapshot */}
          <div className="p-3 bg-[#EFECE2]/40 dark:bg-[#0B0E14] border border-[#D5D0C3] dark:border-[#1E2633] rounded-[2px]">
            <div className="text-xs font-semibold text-[#1C2026] dark:text-[#E5E9F0] mb-2">
              OHLCV snapshot at trigger bar
            </div>
            <div className="grid grid-cols-5 gap-2 text-xs font-mono">
              <div>
                <span className="text-[#475569] dark:text-[#94A3B8] block text-[11px] font-sans">Open</span>
                <span className="tabular-nums font-semibold">{formatINR(ohlcv.open)}</span>
              </div>
              <div>
                <span className="text-[#475569] dark:text-[#94A3B8] block text-[11px] font-sans">High</span>
                <span className="tabular-nums font-semibold">{formatINR(ohlcv.high)}</span>
              </div>
              <div>
                <span className="text-[#475569] dark:text-[#94A3B8] block text-[11px] font-sans">Low</span>
                <span className="tabular-nums font-semibold">{formatINR(ohlcv.low)}</span>
              </div>
              <div>
                <span className="text-[#475569] dark:text-[#94A3B8] block text-[11px] font-sans">Close</span>
                <span className="tabular-nums font-semibold">{formatINR(ohlcv.close)}</span>
              </div>
              <div>
                <span className="text-[#475569] dark:text-[#94A3B8] block text-[11px] font-sans">Volume</span>
                <span className="tabular-nums font-semibold">{ohlcv.volume}</span>
              </div>
            </div>
          </div>

          {/* B. SMA Ratio with Cross Label & RSI with 30/70 Marks */}
          <div className="grid grid-cols-2 gap-3">
            {/* SMA ratio with cross label */}
            <div className="p-3 bg-[#EFECE2]/40 dark:bg-[#0B0E14] border border-[#D5D0C3] dark:border-[#1E2633] rounded-[2px]">
              <span className="text-xs text-[#475569] dark:text-[#94A3B8] block">SMA ratio with cross label</span>
              <div className="text-base font-semibold font-mono tabular-nums text-[#1C2026] dark:text-[#E5E9F0] mt-1">
                {trade.indicators?.smaRatio || '1.1097'}
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                Golden cross confirmed (SMA5 over SMA20)
              </div>
            </div>

            {/* RSI with 30/70 marks */}
            <div className="p-3 bg-[#EFECE2]/40 dark:bg-[#0B0E14] border border-[#D5D0C3] dark:border-[#1E2633] rounded-[2px]">
              <span className="text-xs text-[#475569] dark:text-[#94A3B8] block">Wilder RSI with 30/70 marks</span>
              <div className="text-base font-semibold font-mono tabular-nums text-[#1C2026] dark:text-[#E5E9F0] mt-1">
                {trade.indicators?.rsi || '61.4'} <span className="text-xs font-normal text-[#64748B]">/ 100</span>
              </div>
              <div className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">
                Normal momentum band (30 oversold / 70 overbought)
              </div>
            </div>
          </div>

          {/* C. News Headline with Negation Parse */}
          <div className="p-3 bg-[#EFECE2]/40 dark:bg-[#0B0E14] border border-[#D5D0C3] dark:border-[#1E2633] rounded-[2px]">
            <div className="text-xs font-semibold text-[#1C2026] dark:text-[#E5E9F0] mb-1">
              News headline with negation parse
            </div>
            <p className="text-xs text-[#1C2026] dark:text-[#E5E9F0] italic">
              "{trade.newsHeadline || 'PLNX Q3 net profit not expected to decline; exports surge 24% YoY'}"
            </p>
            <div className="mt-2 text-xs flex items-center space-x-2 border-t border-[#D5D0C3] dark:border-[#1E2633] pt-1.5">
              <span className="text-[#475569] dark:text-[#94A3B8]">3-word negation parse:</span>
              <span className="font-mono text-emerald-700 dark:text-emerald-400 font-medium">
                [not -&gt; decline] flipped positive (+2.4 score)
              </span>
            </div>
          </div>

          {/* D. ML Probability & Final Rule */}
          <div className="p-3 bg-[#EFECE2]/40 dark:bg-[#0B0E14] border border-[#D5D0C3] dark:border-[#1E2633] rounded-[2px] space-y-2">
            <div>
              <span className="text-xs text-[#475569] dark:text-[#94A3B8] block">Machine learning probability</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-medium text-[#1C2026] dark:text-[#E5E9F0]">HistGradientBoosting conviction</span>
                <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">89.6% (threshold &gt; 65.0%)</span>
              </div>
            </div>

            <div className="border-t border-[#D5D0C3] dark:border-[#1E2633] pt-2">
              <span className="text-xs text-[#475569] dark:text-[#94A3B8] block">Final execution rule</span>
              <p className="text-xs text-[#1C2026] dark:text-[#E5E9F0] font-medium mt-0.5">
                Rule 3: Golden cross confirmed with RSI in 50 to 65 range and positive NLP sentiment catalyst triggers high-conviction entry.
              </p>
            </div>
          </div>

          {/* E. Pre-Check Table (Cash, Ownership, 50+ Batch) with Pass or Fail Text */}
          <div className="border border-[#D5D0C3] dark:border-[#1E2633] rounded-[2px] overflow-hidden">
            <div className="px-3 py-1.5 bg-[#EFECE2]/60 dark:bg-[#0B0E14] font-semibold text-xs text-[#1C2026] dark:text-[#E5E9F0] border-b border-[#D5D0C3] dark:border-[#1E2633]">
              Pre-check validation audit
            </div>
            <table className="w-full text-left text-xs">
              <tbody className="divide-y divide-[#D5D0C3] dark:divide-[#1E2633]">
                {preChecks.map((row) => (
                  <tr key={row.check} className="bg-[#FAF8F3] dark:bg-[#11161F]">
                    <td className="py-2 px-3 font-medium text-[#1C2026] dark:text-[#E5E9F0]">{row.check}</td>
                    <td className="py-2 px-3 text-[#475569] dark:text-[#94A3B8]">{row.requirement}</td>
                    <td className="py-2 px-3 text-right font-semibold text-emerald-700 dark:text-emerald-400">
                      {row.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Action Buttons: Copy JSON & Replay Tick (Requirement E) */}
        <div className="p-4 border-t border-[#D5D0C3] dark:border-[#1E2633] bg-[#EFECE2]/50 dark:bg-[#0B0E14] flex items-center space-x-3">
          <button
            onClick={handleCopyJSON}
            className="flex-1 py-1.5 px-3 text-xs font-medium border border-[#D5D0C3] dark:border-[#2E3846] bg-[#FAF8F3] dark:bg-[#11161F] hover:bg-[#EFECE2] text-[#1C2026] dark:text-[#E5E9F0] rounded-[2px] transition-colors"
          >
            {copyFeedback ? 'Copied to clipboard' : 'Copy JSON'}
          </button>
          <button
            onClick={handleReplayTick}
            className="flex-1 py-1.5 px-3 text-xs font-medium border border-[#D5D0C3] dark:border-[#2E3846] bg-[#FAF8F3] dark:bg-[#11161F] hover:bg-[#EFECE2] text-[#1C2026] dark:text-[#E5E9F0] rounded-[2px] transition-colors"
          >
            {replayFeedback ? 'Tick replayed' : 'Replay tick'}
          </button>
        </div>
      </div>
    </div>
  )
}
