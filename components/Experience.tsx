'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'

type Role = {
  company: string
  position: string
  location: string
  start: string // ISO yyyy-mm
  end: string   // ISO yyyy-mm or 'present'
  color: string
  metrics: { label: string; value: string }[]
  stack: string[]
  highlights: string[]
}

const ROLES: Role[] = [
  {
    company: 'Barclays',
    position: 'Data Scientist',
    location: 'Hyderabad, IN',
    start: '2021-01',
    end:   '2023-08',
    color: '#fb7185',
    metrics: [
      { label: 'Aggregation', value: '−76%' },
      { label: 'Schemas',      value: '12+' },
      { label: 'Dashboards',   value: 'Power BI' },
    ],
    stack: ['SQL', 'Python', 'Power BI', 'PostgreSQL'],
    highlights: [
      'Cut portfolio aggregation 3.5h → 50min',
      'Consolidated fragmented customer schemas',
      'Risk dashboards for quarterly reviews',
    ],
  },
  {
    company: 'PayPal',
    position: 'ML Engineer',
    location: 'Austin, TX',
    start: '2025-02',
    end:   '2025-09',
    color: '#fbbf24',
    metrics: [
      { label: 'Fraud FP',  value: '−20%' },
      { label: 'Model',     value: 'XGBoost' },
      { label: 'Serving',   value: 'API GW' },
    ],
    stack: ['Python', 'AWS', 'XGBoost', 'Glue', 'Lambda'],
    highlights: [
      'End-to-end fraud detection on AWS',
      'Rule + ML hybrid for real-time auth',
      'Unified scoring API on EC2 + API Gateway',
    ],
  },
  {
    company: 'Airbnb',
    position: 'AI Engineer',
    location: 'Dallas, TX',
    start: '2025-10',
    end:   'present',
    color: '#34d399',
    metrics: [
      { label: 'P50 Latency', value: '<120ms' },
      { label: 'CTR',         value: '+8%' },
      { label: 'Cache',       value: 'Bigtable' },
    ],
    stack: ['Python', 'GCP', 'SageMaker', 'Dataflow', 'BigQuery'],
    highlights: [
      'Recsys balancing long-term + cold-start',
      'Tiered cache → sub-120ms recommendations',
      'Real-time feature enrichment pipelines',
    ],
  },
]

const toMonths = (iso: string) => {
  if (iso === 'present') {
    const d = new Date()
    return d.getFullYear() * 12 + d.getMonth()
  }
  const [y, m] = iso.split('-').map(Number)
  return y * 12 + (m - 1)
}

const fmt = (iso: string) => {
  if (iso === 'present') return 'NOW'
  const [y, m] = iso.split('-').map(Number)
  return `${['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][m-1]} ${String(y).slice(2)}`
}

export default function Experience() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [active, setActive] = useState(2)

  const all = ROLES.map((r) => ({ ...r, s: toMonths(r.start), e: toMonths(r.end) }))
  const minM = Math.min(...all.map((r) => r.s)) - 2
  const maxM = Math.max(...all.map((r) => r.e)) + 2
  const span = maxM - minM
  const pct = (m: number) => ((m - minM) / span) * 100

  // year ticks
  const startYear = Math.ceil(minM / 12)
  const endYear = Math.floor(maxM / 12)
  const yearTicks: number[] = []
  for (let y = startYear; y <= endYear; y++) yearTicks.push(y)

  const A = ROLES[active]

  return (
    <section id="career" ref={ref} className="relative py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-baseline justify-between flex-wrap gap-4 mb-10">
          <div>
            <div className="text-mono text-[11px] text-viz-amber tracking-widest mb-2">
              § 02 · CAREER · GANTT
            </div>
            <h2 className="text-3xl md:text-5xl font-bold">Production tenure.</h2>
          </div>
          <div className="text-mono text-[10px] text-neutral-500">
            click a bar to inspect
          </div>
        </div>

        <div className="panel rounded-lg p-6 md:p-8">
          {/* timeline grid */}
          <div className="relative">
            {/* year ticks */}
            <div className="relative h-5 mb-3">
              {yearTicks.map((y) => (
                <div
                  key={y}
                  className="absolute top-0 -translate-x-1/2"
                  style={{ left: `${pct(y * 12)}%` }}
                >
                  <div className="text-mono text-[10px] text-neutral-500">
                    {y}
                  </div>
                </div>
              ))}
            </div>

            {/* vertical grid lines */}
            <div className="absolute inset-x-0 top-5 bottom-0 pointer-events-none">
              {yearTicks.map((y) => (
                <div
                  key={y}
                  className="absolute top-0 bottom-0 w-px bg-white/5"
                  style={{ left: `${pct(y * 12)}%` }}
                />
              ))}
            </div>

            {/* bars */}
            <div className="space-y-4">
              {ROLES.map((r, i) => {
                const s = pct(toMonths(r.start))
                const e = pct(toMonths(r.end))
                const isActive = active === i
                return (
                  <div key={r.company} className="relative h-12">
                    {/* track */}
                    <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-white/[0.03]" />
                    {/* bar */}
                    <motion.button
                      onClick={() => setActive(i)}
                      initial={{ width: 0, opacity: 0 }}
                      animate={inView ? { width: `${e - s}%`, opacity: 1 } : {}}
                      transition={{ duration: 1, delay: 0.15 * i, ease: 'easeOut' }}
                      style={{
                        left: `${s}%`,
                        background: `linear-gradient(90deg, ${r.color}55, ${r.color})`,
                        borderColor: r.color,
                        boxShadow: isActive ? `0 0 24px ${r.color}88` : 'none',
                      }}
                      className={`absolute inset-y-0 rounded-full border text-left pl-4 pr-3 flex items-center justify-between gap-2 transition-all hover:scale-y-110 ${
                        isActive ? 'ring-1 ring-white/30' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 text-mono text-xs">
                        <span className="text-ink-950 font-bold">{r.company}</span>
                        <span className="text-ink-950/70 hidden md:inline">·</span>
                        <span className="text-ink-950/80 hidden md:inline text-[10px]">
                          {r.position}
                        </span>
                      </div>
                      <div className="text-mono text-[10px] text-ink-950/80 hidden sm:flex gap-2">
                        <span>{fmt(r.start)}</span>
                        <span>→</span>
                        <span>{fmt(r.end)}</span>
                      </div>
                    </motion.button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* details panel */}
        <motion.div
          key={A.company}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid lg:grid-cols-3 gap-5 mt-6"
        >
          {/* header card */}
          <div
            className="panel rounded-lg p-6 lg:col-span-1"
            style={{ borderColor: `${A.color}44` }}
          >
            <div className="text-mono text-[10px] text-neutral-500">ROLE</div>
            <div className="text-2xl font-bold mt-1" style={{ color: A.color }}>
              {A.company}
            </div>
            <div className="text-neutral-300 text-sm mt-1">{A.position}</div>
            <div className="text-mono text-[10px] text-neutral-500 mt-3">
              {A.location} · {fmt(A.start)} → {fmt(A.end)}
            </div>
            <div className="flex flex-wrap gap-2 mt-5">
              {A.stack.map((t) => (
                <span
                  key={t}
                  className="text-mono text-[10px] px-2 py-1 rounded border"
                  style={{ borderColor: `${A.color}55`, color: A.color }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* metrics */}
          <div className="panel rounded-lg p-6 lg:col-span-1">
            <div className="text-mono text-[10px] text-neutral-500 mb-4">METRICS</div>
            <div className="space-y-4">
              {A.metrics.map((m, i) => (
                <div key={m.label}>
                  <div className="flex items-baseline justify-between text-mono text-xs">
                    <span className="text-neutral-400">{m.label}</span>
                    <span className="font-bold" style={{ color: A.color }}>
                      {m.value}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      key={A.company + i}
                      initial={{ width: 0 }}
                      animate={{ width: `${60 + i * 15}%` }}
                      transition={{ duration: 0.8, delay: 0.1 * i }}
                      style={{ background: A.color }}
                      className="h-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* highlights */}
          <div className="panel rounded-lg p-6 lg:col-span-1">
            <div className="text-mono text-[10px] text-neutral-500 mb-4">HIGHLIGHTS</div>
            <ul className="space-y-3">
              {A.highlights.map((h) => (
                <li key={h} className="flex gap-3 text-sm text-neutral-300">
                  <span style={{ color: A.color }}>▹</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
