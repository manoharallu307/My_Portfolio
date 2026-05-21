'use client'

import { motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

type KPI = {
  label: string
  value: number
  suffix: string
  target: number // 0..100 ring fill
  color: string
  caption: string
}

const KPIS: KPI[] = [
  { label: 'YEARS · PROD ML', value: 5,   suffix: '+',  target: 70, color: '#34d399', caption: 'shipping ML at scale' },
  { label: 'MODELS · DEPLOYED', value: 15,  suffix: '+',  target: 85, color: '#a3e635', caption: 'training → serving' },
  { label: 'P50 LATENCY · MS', value: 120,  suffix: '',   target: 92, color: '#fbbf24', caption: 'recsys @ Bigtable cache' },
  { label: 'CTR LIFT', value: 8,    suffix: '%',  target: 65, color: '#fb923c', caption: 'real-time enrichment' },
  { label: 'FRAUD FP ↓', value: 20,   suffix: '%',  target: 80, color: '#fb7185', caption: 'XGB + anomaly' },
  { label: 'TIME-TO-INSIGHT', value: 4.2, suffix: '×',  target: 76, color: '#2dd4bf', caption: 'pipeline opt @ Barclays' },
]

function useCount(target: number, run: boolean, duration = 1400) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!run) return
    let raf = 0
    const start = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      setV(target * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, run, duration])
  return v
}

function Ring({
  pct,
  color,
  size = 140,
  stroke = 8,
  run,
}: {
  pct: number
  color: string
  size?: number
  stroke?: number
  run: boolean
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const animPct = useCount(pct, run)
  const offset = c - (animPct / 100) * c
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
      />
    </svg>
  )
}

function Tile({ kpi, run, i }: { kpi: KPI; run: boolean; i: number }) {
  const num = useCount(kpi.value, run)
  const display =
    kpi.value % 1 !== 0 ? num.toFixed(1) : Math.round(num).toString()
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={run ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: i * 0.08 }}
      className="panel panel-hover rounded-lg p-5 relative overflow-hidden group"
    >
      <div className="absolute top-3 right-3 text-mono text-[10px] text-neutral-500">
        #{String(i + 1).padStart(2, '0')}
      </div>
      <div className="flex items-center gap-5">
        <div className="relative">
          <Ring pct={kpi.target} color={kpi.color} run={run} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold" style={{ color: kpi.color }}>
              {display}
              <span className="text-base">{kpi.suffix}</span>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div className="text-mono text-[10px] tracking-widest text-neutral-400">
            {kpi.label}
          </div>
          <div className="text-sm text-neutral-300 mt-2">{kpi.caption}</div>
          <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={run ? { width: `${kpi.target}%` } : {}}
              transition={{ duration: 1.2, delay: 0.2 + i * 0.08 }}
              style={{ background: kpi.color }}
              className="h-full rounded-full"
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function About() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  return (
    <section id="impact" ref={ref} className="relative py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-baseline justify-between flex-wrap gap-4 mb-10">
          <div>
            <div className="text-mono text-[11px] text-viz-emerald tracking-widest mb-2">
              § 01 · IMPACT
            </div>
            <h2 className="text-3xl md:text-5xl font-bold">By the numbers.</h2>
          </div>
          <div className="text-mono text-[10px] text-neutral-500 max-w-xs">
            Aggregated outcomes from production ML systems across Airbnb,
            PayPal, and Barclays.
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {KPIS.map((k, i) => (
            <Tile key={k.label} kpi={k} run={inView} i={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
