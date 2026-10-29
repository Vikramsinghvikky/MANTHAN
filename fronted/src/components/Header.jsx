import React from 'react'
import { formatINR } from '../utils/formatters'

export function Header({
  isDark,
  setIsDark,
  simulationClock,
  portfolio,
  isLoading,
  setIsLoading,
  rateCount = 38,
  onOpenVoice,
  isVoiceActive,
}) {
  return (
    <header className="w-full border-b border-[#D5D0C3] dark:border-[#1E2633] bg-[#FAF8F3] dark:bg-[#11161F] text-[#1C2026] dark:text-[#E5E9F0] select-none transition-colors">
      {/* 1. Top bar: Brand, stage, sim clock, rate limit, voice button, theme switch */}
      <div className="h-10 px-3 flex items-center justify-between text-xs border-b border-[#D5D0C3] dark:border-[#1E2633] font-sans">
        {/* Left: Brand, stage, sim clock, rate limit */}
        <div className="flex items-center space-x-3 overflow-x-auto whitespace-nowrap scrollbar-none">
          <span className="font-semibold text-[#1C2026] dark:text-[#E5E9F0]">
            Manthan 2026 // group-mn2612
          </span>

          <span className="text-[#D5D0C3] dark:text-[#1E2633]">|</span>

          <span className="text-[#475569] dark:text-[#94A3B8]">
            Stage: <span className="text-emerald-700 dark:text-emerald-400 font-medium">Simulation (running)</span>
          </span>

          <span className="text-[#D5D0C3] dark:text-[#1E2633] hidden sm:inline">|</span>

          <span className="hidden sm:inline text-[#475569] dark:text-[#94A3B8]">
            Sim clock:{' '}
            <span className="font-mono text-[#1C2026] dark:text-[#E5E9F0]">
              Day {simulationClock.current_day} of {simulationClock.total_days}
            </span>{' '}
            <span className="text-[#64748B] dark:text-[#94A3B8]">({simulationClock.interval_seconds}s interval)</span>
          </span>

          <span className="text-[#D5D0C3] dark:text-[#1E2633] hidden md:inline">|</span>

          <span className="hidden md:inline text-[#475569] dark:text-[#94A3B8]">
            Rate limit:{' '}
            <span className="font-mono font-medium text-[#1C2026] dark:text-[#E5E9F0]">
              {rateCount} / 120 RPM
            </span>{' '}
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">(0 rejections, 10 partitions)</span>
          </span>
        </div>

        {/* Right: Voice Agent side panel trigger, Skeleton demo toggle, Theme switch */}
        <div className="flex items-center space-x-2 shrink-0 pl-2">
          {/* Compact Voice Agent button (Section I) */}
          <button
            onClick={onOpenVoice}
            className={`px-2.5 py-1 text-xs font-medium rounded-[2px] border transition-colors flex items-center space-x-1.5 ${
              isVoiceActive
                ? 'bg-[#1D5582] text-[#FAF8F3] border-[#1D5582]'
                : 'bg-[#EFECE2] dark:bg-[#0B0E14] text-[#1C2026] dark:text-[#E5E9F0] border-[#D5D0C3] dark:border-[#2E3846] hover:bg-[#D5D0C3] dark:hover:bg-[#1E2633]'
            }`}
            title="Open conversational voice agent side panel"
          >
            <span>Voice agent</span>
            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">(en-IN)</span>
          </button>

          <button
            onClick={() => setIsLoading(!isLoading)}
            className="px-2 py-1 text-xs border border-[#D5D0C3] dark:border-[#1E2633] hover:border-[#6C7480] dark:hover:border-[#7E8B9B] bg-[#EFECE2] dark:bg-[#0B0E14] text-[#475569] dark:text-[#94A3B8] hover:text-[#1C2026] dark:hover:text-[#E5E9F0] rounded-[2px] transition-colors"
            title="Toggle loading skeleton state preview"
          >
            Skeleton: {isLoading ? 'On' : 'Off'}
          </button>

          <button
            onClick={() => setIsDark(!isDark)}
            className="px-2 py-1 text-xs border border-[#D5D0C3] dark:border-[#1E2633] hover:border-[#6C7480] dark:hover:border-[#7E8B9B] bg-[#EFECE2] dark:bg-[#0B0E14] text-[#1C2026] dark:text-[#E5E9F0] rounded-[2px] transition-colors"
          >
            Theme: {isDark ? 'Night' : 'Day'}
          </button>
        </div>
      </div>

      {/* 2. Scorecard strip: Total Wealth, Cash Utilization, Decision Latency (p95), Order Error Rate, Total Friction */}
      {/* One continuous strip with hairline dividers, not separate cards (Section A.2) */}
      <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 divide-[#D5D0C3] dark:divide-[#1E2633] bg-[#FAF8F3] dark:bg-[#11161F]">
        {/* 1. Total Wealth */}
        <div className="p-2.5 border-r border-[#D5D0C3] dark:border-[#1E2633] flex flex-col justify-between">
          <div className="text-xs text-[#475569] dark:text-[#94A3B8] font-sans font-medium">
            Total wealth
          </div>
          <div className="text-lg font-semibold font-mono tabular-nums text-[#1C2026] dark:text-[#E5E9F0] leading-snug my-0.5">
            {formatINR(portfolio.totalWealth)}
          </div>
          <div className="text-xs text-emerald-700 dark:text-emerald-400 font-sans">
            +{portfolio.pnlPercent}% ({formatINR(portfolio.totalWealth - (portfolio.startingCapital || 1000000))} net)
          </div>
        </div>

        {/* 2. Cash Utilization */}
        <div className="p-2.5 border-r border-[#D5D0C3] dark:border-[#1E2633] flex flex-col justify-between">
          <div className="text-xs text-[#475569] dark:text-[#94A3B8] font-sans font-medium">
            Cash utilization
          </div>
          <div className="text-lg font-semibold font-mono tabular-nums text-[#1C2026] dark:text-[#E5E9F0] leading-snug my-0.5">
            78.0%
          </div>
          <div className="text-xs text-[#475569] dark:text-[#94A3B8] font-sans">
            {formatINR(portfolio.availableCash)} liquid buffer
          </div>
        </div>

        {/* 3. Decision Latency (p95) */}
        <div className="p-2.5 border-r border-[#D5D0C3] dark:border-[#1E2633] flex flex-col justify-between">
          <div className="text-xs text-[#475569] dark:text-[#94A3B8] font-sans font-medium">
            Decision latency (p95)
          </div>
          <div className="text-lg font-semibold font-mono tabular-nums text-[#1C2026] dark:text-[#E5E9F0] leading-snug my-0.5">
            382ms
          </div>
          <div className="text-xs text-[#475569] dark:text-[#94A3B8] font-sans">
            3,000ms decision window budget
          </div>
        </div>

        {/* 4. Order Error Rate */}
        <div className="p-2.5 border-r border-[#D5D0C3] dark:border-[#1E2633] flex flex-col justify-between">
          <div className="text-xs text-[#475569] dark:text-[#94A3B8] font-sans font-medium">
            Order error rate
          </div>
          <div className="text-lg font-semibold font-mono tabular-nums text-emerald-700 dark:text-emerald-400 leading-snug my-0.5">
            0.0%
          </div>
          <div className="text-xs text-[#475569] dark:text-[#94A3B8] font-sans">
            0 rejections across 50 ticks
          </div>
        </div>

        {/* 5. Total Friction */}
        <div className="p-2.5 flex flex-col justify-between">
          <div className="text-xs text-[#475569] dark:text-[#94A3B8] font-sans font-medium">
            Total friction
          </div>
          <div className="text-lg font-semibold font-mono tabular-nums text-[#1C2026] dark:text-[#E5E9F0] leading-snug my-0.5">
            {formatINR(355.34)}
          </div>
          <div className="text-xs text-[#475569] dark:text-[#94A3B8] font-sans">
            &lt; 0.03% total volume drag
          </div>
        </div>
      </div>
    </header>
  )
}
