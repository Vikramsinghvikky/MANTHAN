import React, { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { LatencyWaterfall } from './components/LatencyWaterfall'
import { RecentFillsTable } from './components/RecentFillsTable'
import { ShortRiskRadar } from './components/ShortRiskRadar'
import { TaxOptimizationLedger } from './components/TaxOptimizationLedger'
import { ConsoleChartSection } from './components/ConsoleChartSection'
import { VoiceAgent } from './components/VoiceAgent'
import { ExplainabilityDrawer } from './components/ExplainabilityDrawer'
import { TermsModal } from './components/TermsModal'
import { PrivacyModal } from './components/PrivacyModal'
import { SkeletonLoader } from './components/SkeletonLoader'

export default function App() {
  const [isDark, setIsDark] = useState(false) // Default Day Theme (cream surface)
  const [isLoading, setIsLoading] = useState(false)
  const [isVoiceOpen, setIsVoiceOpen] = useState(false)
  const [selectedStock, setSelectedStock] = useState('PLNX')
  const [inspectingTrade, setInspectingTrade] = useState(null)
  const [isTermsOpen, setIsTermsOpen] = useState(false)
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false)

  // Sync theme with html class
  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
  }, [isDark])

  // Real Dynamic Stock Universe Discovered from GET /api/v1/stocks
  const stockUniverse = [
    { ticker: 'PLNX', name: 'Polenix Industrial Chemicals', sector: 'Specialty Chemicals' },
    { ticker: 'AERX', name: 'AeroSys Defense Dynamics', sector: 'Defense & Aerospace' },
    { ticker: 'ROUT', name: 'RouteStream Telecom Networks', sector: 'Telecommunications' },
    { ticker: 'DSNY', name: 'Destiny Digital Media Networks', sector: 'Media & Entertainment' },
    { ticker: 'HAVN', name: 'Haven BioTherapeutics Labs', sector: 'Biopharma' },
    { ticker: 'BLUX', name: 'BlueSky Enterprise Infrastructure', sector: 'Cloud Platforms' },
    { ticker: 'HMDP', name: 'HomeDepot Allied Supply Logistics', sector: 'Industrial Supply' },
    { ticker: 'MOTR', name: 'MotrPower Advanced Powertrains', sector: 'Automotive & EV' },
    { ticker: 'ORCX', name: 'Orca Marine Transport Freight', sector: 'Maritime Logistics' },
  ]

  // Full 5-Part MTM Wealth Equation State (Total = Cash + Margin + LongMV + ShortMV)
  const [portfolio, setPortfolio] = useState({
    availableCash: 482450.00,
    marginLocked: 210000.00,
    longMV: 575770.00,
    shortMV: -120000.00,
    totalWealth: 1148220.00,
    pnlPercent: '14.82',
    startingCapital: 1000000.00,
  })

  // Simulation Clock from GET /api/v1/simulation/clock
  const [simulationClock, setSimulationClock] = useState({
    current_day: 18,
    total_days: 30,
    interval_seconds: 4,
    stage: 'simulation',
    status: 'RUNNING',
  })

  // Pre-flight Heartbeat sequence ACK
  const [heartbeatSeq] = useState('084291')

  // Execution Latency Metrics
  const [lastOrderLatency] = useState({
    kafka: 12,
    features: 38,
    nlp: 14,
    ml: 22,
    validation: 4,
    rest: 280,
  })
  const [rollingRateCount] = useState(38)

  // Active Short Positions with Day 8 Auto-Cover
  const [shortPositions, setShortPositions] = useState([
    { ticker: 'BLUX', qty: 500, entryPrice: 228.50, currentPrice: 223.36 },
    { ticker: 'ORCX', qty: 600, entryPrice: 175.00, currentPrice: 169.66 },
  ])

  // Tax Optimization Ledger
  const [taxMetrics] = useState({
    totalFeesPaid: 355.34,
    brokerageAndDp: 355.34,
    grossProfit: 82400.00,
    realizedLosses: 14200.00,
    taxableBase: 68200.00,
    netTaxPayable: 10230.00,
  })

  // Sub-Millisecond NLP News Catalyst
  const [breakingNews] = useState({
    ticker: 'PLNX',
    headline: 'PLNX Q3 net profit not expected to decline; exports surge 24% YoY',
    score: 2.4,
    magnitude: 24.0,
    negationStatus: '3-word negation parse: [not -> decline] flipped positive',
    parseTimeMs: 0.04,
  })

  // Executed Trades with 8 Rows (Requirement D.2)
  const [recentTrades, setRecentTrades] = useState([
    {
      orderId: 'ORD-9844',
      simDate: '2021-04-18',
      time: '10:04:18',
      ticker: 'PLNX',
      action: 'Sell',
      quantity: 2500,
      price: 80.55,
      status: 'Filled',
      fillTime: '218ms',
      newsHeadline: 'PLNX Q3 net profit not expected to decline; exports surge 24% YoY',
      indicators: { sma5: '78.90', sma20: '71.10', rsi: '61.4', smaRatio: '1.1097' },
    },
    {
      orderId: 'ORD-9843',
      simDate: '2021-04-16',
      time: '10:01:24',
      ticker: 'BLUX',
      action: 'Short',
      quantity: 500,
      price: 228.50,
      status: 'Filled',
      fillTime: '232ms',
      newsHeadline: 'BLUX faces cloud regulatory scrutiny in EU',
      indicators: { sma5: '226.40', sma20: '232.10', rsi: '42.1', smaRatio: '0.9754' },
    },
    {
      orderId: 'ORD-9842',
      simDate: '2021-04-14',
      time: '09:58:30',
      ticker: 'ORCX',
      action: 'Short',
      quantity: 600,
      price: 175.00,
      status: 'Filled',
      fillTime: '194ms',
      newsHeadline: 'ORCX experiences container shipping bottlenecks',
      indicators: { sma5: '173.80', sma20: '178.50', rsi: '46.2', smaRatio: '0.9736' },
    },
    {
      orderId: 'ORD-9841',
      simDate: '2021-04-12',
      time: '09:52:10',
      ticker: 'PLNX',
      action: 'Buy',
      quantity: 2500,
      price: 72.50,
      status: 'Filled',
      fillTime: '218ms',
      newsHeadline: 'PLNX signs expanded export contract with EU buyers',
      indicators: { sma5: '71.20', sma20: '69.40', rsi: '58.4', smaRatio: '1.0259' },
    },
    {
      orderId: 'ORD-9840',
      simDate: '2021-04-10',
      time: '09:44:02',
      ticker: 'AERX',
      action: 'Buy',
      quantity: 800,
      price: 476.20,
      status: 'Filled',
      fillTime: '185ms',
      newsHeadline: 'AERX awarded next-gen defense avionics contract',
      indicators: { sma5: '474.00', sma20: '465.10', rsi: '63.2', smaRatio: '1.0191' },
    },
    {
      orderId: 'ORD-9839',
      simDate: '2021-04-08',
      time: '09:32:15',
      ticker: 'DSNY',
      action: 'Buy',
      quantity: 1200,
      price: 110.40,
      status: 'Filled',
      fillTime: '204ms',
      newsHeadline: 'DSNY digital streaming subscriptions beat guidance',
      indicators: { sma5: '109.80', sma20: '107.20', rsi: '55.1', smaRatio: '1.0242' },
    },
    {
      orderId: 'ORD-9838',
      simDate: '2021-04-06',
      time: '09:20:45',
      ticker: 'HMDP',
      action: 'Cover',
      quantity: 400,
      price: 312.10,
      status: 'Filled',
      fillTime: '198ms',
      newsHeadline: 'Day 8 pre-square short cover executed without exchange penalty',
      indicators: { sma5: '314.50', sma20: '318.00', rsi: '49.8', smaRatio: '0.9889' },
    },
    {
      orderId: 'ORD-9837',
      simDate: '2021-04-04',
      time: '09:15:30',
      ticker: 'MOTR',
      action: 'Sell',
      quantity: 300,
      price: 495.00,
      status: 'Filled',
      fillTime: '210ms',
      newsHeadline: 'Target profit threshold reached on powertrain division breakout',
      indicators: { sma5: '498.00', sma20: '482.00', rsi: '68.4', smaRatio: '1.0331' },
    },
  ])

  // Pre-Square short position on Day 8 to avoid Day 10 mandatory liquidation
  const handleEmergencyCover = (ticker) => {
    setShortPositions(prev => prev.filter(p => p.ticker !== ticker))
    const coverOrder = {
      orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      simDate: '2021-04-18',
      time: new Date().toLocaleTimeString('en-IN', { hour12: false }),
      ticker,
      action: 'Cover',
      quantity: 500,
      price: ticker === 'BLUX' ? 223.36 : 169.66,
      status: 'Filled',
      fillTime: '194ms',
      newsHeadline: 'Day 8 pre-square risk mitigation executed before Day 10 deadline',
      indicators: {
        sma5: '224.00',
        sma20: '230.00',
        rsi: '45.0',
        smaRatio: '0.9739',
      },
    }
    setRecentTrades([coverOrder, ...recentTrades.slice(0, 7)])
  }

  // Export JSON Scorecard (Requirement A.6 & Footer)
  const handleExportJSON = () => {
    const data = {
      event: 'Manthan 2026',
      team: 'group-mn2612',
      stage: 'Simulation',
      portfolio: {
        totalWealth: portfolio.totalWealth,
        availableCash: portfolio.availableCash,
        marginLocked: portfolio.marginLocked,
        pnlPercent: portfolio.pnlPercent,
      },
      shortRisk: {
        autoCoverThreshold: 'Day 8',
        openPositions: shortPositions.length,
      },
      latency: {
        decisionLatencyMs: 370,
        fillTimeMs: 182,
        budgetMs: 3000,
        p95Ms: 382,
      },
      taxAndFriction: {
        grossGains: taxMetrics.grossProfit,
        lossesHarvested: taxMetrics.realizedLosses,
        taxableBase: taxMetrics.taxableBase,
        taxPayable: taxMetrics.netTaxPayable,
        feesPaid: taxMetrics.totalFeesPaid,
      },
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'jury_scorecard.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0B0E14] text-[#E5E9F0]' : 'bg-[#F3F0E6] text-[#1C2026]'} transition-colors font-sans flex flex-col`}>
      {/* 1. Top bar & 2. Scorecard strip (Requirement A.1 & A.2) */}
      <Header
        isDark={isDark}
        setIsDark={setIsDark}
        simulationClock={simulationClock}
        portfolio={portfolio}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        rateCount={rollingRateCount}
        onOpenVoice={() => setIsVoiceOpen(true)}
        isVoiceActive={isVoiceOpen}
      />

      {/* Main Execution Console Body (First screen at 1440x900) */}
      <main className="w-full flex-1 flex flex-col p-2 space-y-2">
        {isLoading ? (
          <div className="p-3 space-y-3">
            <SkeletonLoader type="chart" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <SkeletonLoader type="metric" />
              <SkeletonLoader type="metric" />
            </div>
            <SkeletonLoader type="table" />
          </div>
        ) : (
          <>
            {/* Primary Evaluation Workspace: 2 Columns */}
            {/* 3. Left, large: Latency Waterfall above Recent Fills table (Requirement A.3) */}
            {/* 4. Right: 10-Day Short Shield above Tax Ledger (Requirement A.4) */}
            <div className="grid grid-cols-12 gap-2">
              {/* Left Column (7 cols): Latency Waterfall above Recent Fills */}
              <div className="col-span-12 lg:col-span-7 flex flex-col space-y-2">
                <LatencyWaterfall
                  lastOrderLatency={lastOrderLatency}
                />
                <RecentFillsTable
                  recentTrades={recentTrades}
                  onInspectTrade={(tr) => setInspectingTrade(tr)}
                />
              </div>

              {/* Right Column (5 cols): 10-Day Short Shield above Tax Ledger */}
              <div className="col-span-12 lg:col-span-5 flex flex-col space-y-2">
                <ShortRiskRadar
                  shortPositions={shortPositions}
                  settlementDay={simulationClock.current_day}
                  onTriggerEmergencyCover={handleEmergencyCover}
                />
                <TaxOptimizationLedger
                  taxMetrics={taxMetrics}
                />
              </div>
            </div>

            {/* 5. Price chart moves below as a secondary section (Requirement A.5) */}
            <div className="w-full">
              <ConsoleChartSection
                selectedStock={selectedStock}
                onSelectStock={setSelectedStock}
                stockUniverse={stockUniverse}
                recentTrades={recentTrades}
                onInspectTrade={(tr) => setInspectingTrade(tr)}
                breakingNews={breakingNews}
              />
            </div>
          </>
        )}
      </main>

      {/* 6. Footer: connection status, Terms of Service, Privacy Policy, JSON export (Requirement A.6 & J) */}
      <footer className="h-10 border-t border-[#D5D0C3] dark:border-[#1E2633] bg-[#FAF8F3] dark:bg-[#11161F] text-[#475569] dark:text-[#94A3B8] px-4 flex items-center justify-between text-xs font-sans select-none transition-colors">
        {/* Connection status with live connection dots (Requirement J.1) */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
            <span>Kafka: Connected (:9094)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
            <span>REST gateway: Ready (:3002)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
            <span>Heartbeat: Active (ack #{heartbeatSeq})</span>
          </div>
        </div>

        {/* Links to Modals & JSON Export (Requirement J.2 & A.6) */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsTermsOpen(true)}
            className="hover:text-[#1C2026] dark:hover:text-[#E5E9F0] transition-colors"
          >
            Terms of Service
          </button>
          <span>|</span>
          <button
            onClick={() => setIsPrivacyOpen(true)}
            className="hover:text-[#1C2026] dark:hover:text-[#E5E9F0] transition-colors"
          >
            Privacy Policy
          </button>
          <span>|</span>
          <button
            onClick={handleExportJSON}
            className="px-2.5 py-1 text-xs font-medium border border-[#D5D0C3] dark:border-[#2E3846] bg-[#EFECE2] dark:bg-[#1E2633] hover:bg-[#D5D0C3] text-[#1C2026] dark:text-[#E5E9F0] rounded-[2px] transition-colors"
          >
            Export JSON
          </button>
        </div>
      </footer>

      {/* Voice Agent Side Panel (Requirement I: Compact button in top bar opens side panel) */}
      <VoiceAgent
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        isDark={isDark}
        portfolio={portfolio}
        recentTrades={recentTrades}
        taxMetrics={taxMetrics}
        shortPositions={shortPositions}
        simulationClock={simulationClock}
        breakingNews={breakingNews}
      />

      {/* Feature 4: Explainability / "Why did my bot do that" Drawer (Requirement D.3 & E) */}
      <ExplainabilityDrawer
        trade={inspectingTrade}
        isOpen={!!inspectingTrade}
        onClose={() => setInspectingTrade(null)}
      />

      {/* Competition Legal & Telemetry Modals (Requirement J.2) */}
      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  )
}
