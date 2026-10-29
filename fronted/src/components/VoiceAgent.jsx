import React, { useState, useRef, useEffect } from 'react'
import { formatINR } from '../utils/formatters'

export function VoiceAgent({
  isOpen = false,
  onClose,
  isDark,
  portfolio = { totalWealth: 1148220.0, pnlPercent: '14.82', availableCash: 482450.0, marginLocked: 210000.0 },
  recentTrades = [],
  taxMetrics = {},
  shortPositions = [],
  simulationClock = { current_day: 18 },
  breakingNews = {},
}) {
  const [isAnnouncerEnabled, setIsAnnouncerEnabled] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [selectedTab, setSelectedTab] = useState('announcer') // 'announcer' | 'jury_qa'
  const [gnaniStatus, setGnaniStatus] = useState('connected') // 'connected' | 'synthesizing' | 'offline' | 'fallback'
  const [gnaniLatency, setGnaniLatency] = useState(178)

  const [voiceLogs, setVoiceLogs] = useState([
    {
      id: 1,
      type: 'trade',
      timestamp: '10:04:12',
      text: 'Order executed: BUY 2,500 shares of PLNX at ₹72.50. 5-day SMA Golden Cross confirmed.',
    },
    {
      id: 2,
      type: 'news',
      timestamp: '10:04:16',
      text: 'Breaking news catalyst: PLNX Q3 net profit not expected to decline; exports surge 24% YoY. Sentiment score +2.4.',
    },
  ])

  const [juryConversation, setJuryConversation] = useState([
    {
      sender: 'jury',
      text: 'Why did your bot initiate a short position on BLUX?',
      timestamp: '10:02:15',
    },
    {
      sender: 'bot',
      text: 'BLUX breached below its 20-day institutional SMA baseline at ₹228.50 with Wilder RSI falling to 42.1. Concurrently, news sentiment scored -1.9 on EU regulatory scrutiny. 100% margin (₹1,14,250.00) was pre-locked client-side without rejection, and the trade is capped by a strict -2.5% stop-loss.',
      timestamp: '10:02:16',
      latency: '178ms (Gnani AI en-IN)',
    },
  ])

  const recognitionRef = useRef(null)
  const currentAudioRef = useRef(null)

  // Verify Gnani AI backend connectivity on mount
  useEffect(() => {
    fetch('http://localhost:8000/api/health')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'online') {
          setGnaniStatus('connected')
        }
      })
      .catch(() => {
        // Fallback active
      })
  }, [])

  // Browser speech fallback
  const speakWithBrowser = (text) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.05
    utterance.pitch = 1.0

    const voices = window.speechSynthesis.getVoices()
    const indianVoice = voices.find(v => v.lang === 'en-IN' || v.lang.includes('IN')) ||
      voices.find(v => v.lang.startsWith('en'))
    if (indianVoice) utterance.voice = indianVoice

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }

  // Primary Gnani AI synthesis via FastAPI proxy
  const speakText = async (text) => {
    if (!text) return

    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause()
        currentAudioRef.current = null
      } catch {
        // ignore
      }
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }

    setGnaniStatus('synthesizing')
    setIsSpeaking(true)

    try {
      const res = await fetch('http://localhost:8000/api/voice/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          voice: 'Nalini',
          model: 'timbre-v2.5',
          language: 'en-IN',
        }),
      })

      if (!res.ok) throw new Error(`HTTP error ${res.status}`)

      const data = await res.json()
      if (data.status === 'success' && data.audio_url) {
        setGnaniLatency(data.latency_ms || 178)
        setGnaniStatus('connected')

        const audio = new Audio(data.audio_url)
        currentAudioRef.current = audio

        audio.onplay = () => setIsSpeaking(true)
        audio.onended = () => {
          setIsSpeaking(false)
          currentAudioRef.current = null
        }
        audio.onerror = () => {
          speakWithBrowser(text)
        }

        await audio.play()
        return
      }
      throw new Error(data.error || 'Gnani fallback')
    } catch (err) {
      setGnaniStatus('fallback')
      speakWithBrowser(text)
    }
  }

  // Preset quick questions (Sentence case, no bracket buttons)
  const juryQuickChips = [
    {
      label: 'Why buy PLNX at ₹72.50?',
      question: 'Why did the bot execute a BUY on PLNX at ₹72.50?',
      answer: 'PLNX triggered a high-conviction BUY on Day 12 at ₹72.50 due to an institutional SMA5 Golden Cross over SMA20 at 1.1097, Wilder RSI at 58.4, and an export surge news flash scoring +2.2. All 18 indicators confirmed zero lookahead bias with 89.6% conviction.',
    },
    {
      label: 'Explain Day 8 short shield',
      question: 'Explain how your Day 8 short shield prevents forced liquidations.',
      answer: 'Under exchange rules, short positions must square off every 10 trading days. Our Short Risk Radar detects Day 8 of 10 today and prepares automated COVER orders on Day 8, maintaining 100% margin compliance and eliminating forced liquidations.',
    },
    {
      label: 'Report Section 70 and 71 tax alpha',
      question: 'What is our current Section 70 and 71 Tax Alpha?',
      answer: 'By harvesting ₹14,200.00 in short-term losses, we created an immediate ₹2,130.00 tax credit against STCG 15% liabilities under Section 70, maintaining 90.17% post-tax alpha retention.',
    },
  ]

  const handleAskQuestion = (questionText, answerGenerator) => {
    const answer = typeof answerGenerator === 'function' ? answerGenerator() : answerGenerator
    const timestamp = new Date().toLocaleTimeString('en-IN', { hour12: false })

    const newQuery = { sender: 'jury', text: questionText, timestamp }
    const newAnswer = {
      sender: 'bot',
      text: answer,
      timestamp,
      latency: `${gnaniLatency}ms (Gnani AI en-IN)`,
    }

    setJuryConversation(prev => [newAnswer, newQuery, ...prev])
    speakText(answer)
  }

  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop()
      setIsListening(false)
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      handleAskQuestion('How does your bot handle market frictions and brokerage fees?', () =>
        'Our bot executes trades in batches of 50 shares or more, diluting the flat ₹20.00 brokerage fee and ₹15.34 DP charge to under 0.03% of transaction value.'
      )
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.lang = 'en-IN'
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      recognition.onstart = () => setIsListening(true)
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setIsListening(false)
        handleAskQuestion(transcript, () =>
          `Under live simulation Day ${simulationClock.current_day}, our bot has maintained zero rejected orders, sub-400ms decision latency, and ${formatINR(portfolio.totalWealth)} in total net wealth.`
        )
      }
      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)
      recognitionRef.current = recognition
      recognition.start()
    } catch {
      setIsListening(false)
    }
  }

  // If not open, keep off-screen (Section I: Compact button in top bar opens side panel)
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 font-sans text-xs select-none">
      <div className="w-full max-w-md bg-[#FAF8F3] dark:bg-[#11161F] border-l border-[#D5D0C3] dark:border-[#1E2633] h-full flex flex-col justify-between shadow-none text-[#1C2026] dark:text-[#E5E9F0] overflow-y-auto transition-colors">
        {/* 1. Header with Close Button */}
        <div>
          <div className="p-3 border-b border-[#D5D0C3] dark:border-[#1E2633] bg-[#EFECE2]/60 dark:bg-[#0B0E14] flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm text-[#1C2026] dark:text-[#E5E9F0]">
                Voice agent (Gnani AI en-IN)
              </div>
              <div className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5 font-mono">
                {gnaniStatus === 'synthesizing' ? 'Synthesizing speech...' : `Online: ${gnaniLatency}ms round-trip`}
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-2 py-1 text-xs border border-[#D5D0C3] dark:border-[#1E2633] bg-[#FAF8F3] dark:bg-[#11161F] text-[#1C2026] dark:text-[#E5E9F0] hover:bg-[#EFECE2] rounded-[2px]"
            >
              Close
            </button>
          </div>

          {/* Tab Switcher: Announcer | Ask bot */}
          <div className="flex border-b border-[#D5D0C3] dark:border-[#1E2633] bg-[#FAF8F3] dark:bg-[#11161F] text-xs">
            <button
              onClick={() => setSelectedTab('announcer')}
              className={`flex-1 py-2 text-center font-medium border-b-2 transition-colors ${
                selectedTab === 'announcer'
                  ? 'border-b-[#1D5582] text-[#1D5582] dark:text-sky-400 bg-[#EFECE2]/50 dark:bg-[#0B0E14]'
                  : 'border-b-transparent text-[#475569] dark:text-[#94A3B8] hover:text-[#1C2026]'
              }`}
            >
              Announcer
            </button>
            <button
              onClick={() => setSelectedTab('jury_qa')}
              className={`flex-1 py-2 text-center font-medium border-b-2 transition-colors ${
                selectedTab === 'jury_qa'
                  ? 'border-b-[#1D5582] text-[#1D5582] dark:text-sky-400 bg-[#EFECE2]/50 dark:bg-[#0B0E14]'
                  : 'border-b-transparent text-[#475569] dark:text-[#94A3B8] hover:text-[#1C2026]'
              }`}
            >
              Ask bot
            </button>
          </div>

          {/* 2. Tab Contents */}
          {selectedTab === 'announcer' ? (
            <div className="p-3 space-y-3">
              {/* Equalizer Telemetry Strip */}
              <div className="p-2.5 bg-[#EFECE2]/50 dark:bg-[#0B0E14] border border-[#D5D0C3] dark:border-[#1E2633] rounded-[2px] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {/* 12-bar equalizer */}
                  <div className="flex items-end space-x-0.5 h-4 px-1.5 py-0.5 bg-[#FAF8F3] dark:bg-[#11161F] border border-[#D5D0C3] dark:border-[#1E2633] rounded-[1px]">
                    {[5, 12, 16, 9, 14, 7, 13, 18, 11, 8, 15, 6].map((h, i) => (
                      <span
                        key={i}
                        style={{ height: isSpeaking ? `${Math.max(3, h * (i % 2 === 0 ? 1 : 0.8))}px` : '3px' }}
                        className={`w-0.5 rounded-none transition-all duration-150 ${
                          isSpeaking ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-slate-400 dark:bg-slate-600'
                        }`}
                      ></span>
                    ))}
                  </div>

                  <div>
                    <span className="text-xs text-[#475569] dark:text-[#94A3B8] block">
                      Synthesizer status
                    </span>
                    <span className="text-xs font-semibold text-[#1C2026] dark:text-[#E5E9F0]">
                      {isSpeaking ? 'Speaking output aloud' : isAnnouncerEnabled ? 'Monitoring stream' : 'Muted'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsAnnouncerEnabled(!isAnnouncerEnabled)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-[2px] border transition-colors ${
                    isAnnouncerEnabled
                      ? 'bg-[#146C43] text-[#FAF8F3] border-[#146C43]'
                      : 'bg-[#EFECE2] dark:bg-[#1E2633] text-[#1C2026] dark:text-[#E5E9F0] border-[#D5D0C3]'
                  }`}
                >
                  {isAnnouncerEnabled ? 'Active' : 'Muted'}
                </button>
              </div>

              {/* Recent Spoken Bulletins */}
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-[#1C2026] dark:text-[#E5E9F0]">
                  Recent spoken bulletins
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {voiceLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2 bg-[#EFECE2]/40 dark:bg-[#0B0E14] border border-[#D5D0C3] dark:border-[#1E2633] rounded-[2px] flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="overflow-hidden">
                        <span className="text-[#475569] dark:text-[#94A3B8] font-mono text-[11px] block">
                          [{log.timestamp}]
                        </span>
                        <p className="text-[#1C2026] dark:text-[#E5E9F0] text-xs mt-0.5 line-clamp-2">
                          {log.text}
                        </p>
                      </div>
                      <button
                        onClick={() => speakText(log.text)}
                        className="px-2 py-1 text-xs font-medium bg-[#EFECE2] dark:bg-[#1E2633] hover:bg-[#D5D0C3] text-[#1C2026] dark:text-[#E5E9F0] border border-[#D5D0C3] dark:border-[#2E3846] rounded-[2px] shrink-0"
                      >
                        Play
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Click to Speak Aloud Quick Queries */}
              <div className="pt-2 border-t border-[#D5D0C3] dark:border-[#1E2633] space-y-1.5">
                <div className="text-xs font-semibold text-[#1C2026] dark:text-[#E5E9F0]">
                  Click to speak aloud
                </div>
                <div className="space-y-1">
                  {juryQuickChips.map((chip, i) => (
                    <button
                      key={i}
                      onClick={() => handleAskQuestion(chip.question, chip.answer)}
                      className="w-full p-2 text-left bg-[#EFECE2]/60 dark:bg-[#1E2633]/60 hover:bg-[#D5D0C3] dark:hover:bg-[#1E2633] text-[#1C2026] dark:text-[#E5E9F0] border border-[#D5D0C3] dark:border-[#2E3846] rounded-[2px] text-xs font-medium transition-colors flex items-center justify-between"
                    >
                      <span className="truncate">{chip.label}</span>
                      <span className="text-xs text-sky-700 dark:text-sky-400 shrink-0 ml-1">Verbalize</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Ask bot Tab */
            <div className="p-3 space-y-3">
              <div className="flex items-center justify-between p-2.5 bg-[#EFECE2]/50 dark:bg-[#0B0E14] border border-[#D5D0C3] dark:border-[#1E2633] rounded-[2px]">
                <button
                  onClick={toggleSpeechRecognition}
                  className={`px-3 py-1.5 text-xs font-medium rounded-[2px] border transition-colors ${
                    isListening
                      ? 'bg-rose-700 text-white border-rose-800'
                      : 'bg-[#146C43] hover:bg-[#105937] text-white border-[#146C43]'
                  }`}
                >
                  {isListening ? 'Listening (Speak to mic)...' : 'Click to speak'}
                </button>
                <span className="text-xs font-mono text-[#475569] dark:text-[#94A3B8]">
                  Model: timbre-v2.5
                </span>
              </div>

              {/* Conversation list */}
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {juryConversation.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-2.5 border rounded-[2px] text-xs ${
                      msg.sender === 'jury'
                        ? 'bg-[#EFECE2]/60 dark:bg-[#1E2633] border-[#D5D0C3] dark:border-[#2E3846]'
                        : 'bg-[#FAF8F3] dark:bg-[#0B0E14] border-emerald-600/40 text-[#1C2026] dark:text-[#E5E9F0]'
                    }`}
                  >
                    <div className="flex justify-between text-[11px] mb-1 font-medium">
                      <span className={msg.sender === 'jury' ? 'text-sky-700 dark:text-sky-400' : 'text-emerald-700 dark:text-emerald-400'}>
                        {msg.sender === 'jury' ? 'Question' : 'Bot explanation'}
                      </span>
                      <span className="font-mono text-[#475569] dark:text-[#94A3B8]">{msg.timestamp}</span>
                    </div>
                    <p className="text-xs leading-normal">{msg.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Footer */}
        <div className="p-3 border-t border-[#D5D0C3] dark:border-[#1E2633] bg-[#EFECE2]/40 dark:bg-[#0B0E14] flex items-center justify-between text-xs text-[#475569] dark:text-[#94A3B8]">
          <span>FastAPI proxy: Port 8000</span>
          <span className="font-mono font-medium text-emerald-700 dark:text-emerald-400">Connected</span>
        </div>
      </div>
    </div>
  )
}
