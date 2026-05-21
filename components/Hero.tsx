'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

type Node = { x: number; y: number; layer: number; r: number }

const layers = [4, 6, 6, 5, 3]
const COLORS = ['#34d399', '#a3e635', '#fbbf24', '#fb923c', '#fb7185']

function buildNet(w: number, h: number): { nodes: Node[]; edges: [number, number][] } {
  const nodes: Node[] = []
  const padX = 60
  const padY = 40
  const gapX = (w - padX * 2) / (layers.length - 1)
  layers.forEach((count, li) => {
    const gapY = (h - padY * 2) / Math.max(count - 1, 1)
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: padX + li * gapX,
        y: count === 1 ? h / 2 : padY + i * gapY,
        layer: li,
        r: 4 + Math.random() * 3,
      })
    }
  })
  const edges: [number, number][] = []
  for (let li = 0; li < layers.length - 1; li++) {
    const a = nodes.filter((n) => n.layer === li)
    const b = nodes.filter((n) => n.layer === li + 1)
    a.forEach((na) =>
      b.forEach((nb) => {
        if (Math.random() < 0.7) edges.push([nodes.indexOf(na), nodes.indexOf(nb)])
      })
    )
  }
  return { nodes, edges }
}

/* ────────── viz: typewriter terminal ────────── */
const TERMINAL_LINES = [
  { p: '$', cmd: 'recsys.train --model=ncf --epoch=218', c: '#34d399' },
  { p: '↳', cmd: 'loss=0.0142 · ndcg@10=0.41 · auc=0.93', c: '#a3e635' },
  { p: '$', cmd: 'fraud.serve --p50=95ms --rps=3.2k', c: '#fbbf24' },
  { p: '↳', cmd: 'detected 1,284 events · fp_rate=0.018', c: '#fb923c' },
  { p: '$', cmd: 'features.stream --topic=user_events', c: '#fb7185' },
  { p: '↳', cmd: 'enriched 482k rows · freshness=4.8s ✓', c: '#2dd4bf' },
]

function Terminal() {
  const [idx, setIdx] = useState(0)
  const [out, setOut] = useState<{ p: string; cmd: string; c: string; done: boolean }[]>([])
  const [cursor, setCursor] = useState(0)

  useEffect(() => {
    const line = TERMINAL_LINES[idx % TERMINAL_LINES.length]
    if (cursor <= line.cmd.length) {
      const t = setTimeout(() => setCursor((c) => c + 1), 28)
      setOut((prev) => {
        const next = [...prev]
        if (next.length === 0 || next[next.length - 1].done) {
          next.push({ ...line, cmd: line.cmd.slice(0, cursor), done: false })
        } else {
          next[next.length - 1] = { ...line, cmd: line.cmd.slice(0, cursor), done: false }
        }
        return next.slice(-5)
      })
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => {
      setOut((prev) => {
        const next = [...prev]
        if (next.length) next[next.length - 1].done = true
        return next
      })
      setCursor(0)
      setIdx((i) => i + 1)
    }, 950)
    return () => clearTimeout(t)
  }, [cursor, idx])

  return (
    <div className="panel rounded-lg p-3 text-mono text-[10.5px] leading-5 h-[120px] overflow-hidden">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="w-2 h-2 rounded-full bg-viz-rose" />
        <span className="w-2 h-2 rounded-full bg-viz-amber" />
        <span className="w-2 h-2 rounded-full bg-viz-emerald" />
        <span className="text-neutral-500 ml-2">manohar@ml-prod ~/jobs</span>
      </div>
      {out.map((l, i) => (
        <div key={i} className="flex gap-2">
          <span style={{ color: l.c }}>{l.p}</span>
          <span className="text-neutral-300">
            {l.cmd}
            {i === out.length - 1 && !l.done && (
              <span className="inline-block w-1.5 h-3 align-middle ml-0.5 bg-viz-emerald animate-pulse" />
            )}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ────────── viz: activity grid ────────── */
function ActivityGrid() {
  // 7 rows (days) × 22 cols (weeks)
  const cells = Array.from({ length: 7 * 22 }, (_, i) => {
    const seed = Math.sin(i * 13.37) * 10000
    const v = Math.abs(seed - Math.floor(seed))
    return v < 0.45 ? 0 : v < 0.7 ? 1 : v < 0.88 ? 2 : 3
  })
  const colors = ['rgba(255,255,255,0.04)', '#34d39955', '#34d39988', '#34d399']
  return (
    <div className="panel rounded-lg p-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-mono text-[10px] text-neutral-500">
          DEPLOY ACTIVITY · last 22w
        </span>
        <span className="text-mono text-[10px] text-viz-emerald">+312 commits</span>
      </div>
      <div
        className="grid gap-[3px]"
        style={{ gridTemplateColumns: 'repeat(22, 1fr)', gridAutoRows: '10px' }}
      >
        {cells.map((v, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, delay: i * 0.004 }}
            className="rounded-[2px]"
            style={{ background: colors[v] }}
          />
        ))}
      </div>
      <div className="flex justify-end items-center gap-1.5 mt-2 text-mono text-[9px] text-neutral-500">
        <span>less</span>
        {colors.map((c, i) => (
          <span key={i} className="w-2 h-2 rounded-[2px]" style={{ background: c }} />
        ))}
        <span>more</span>
      </div>
    </div>
  )
}

/* ────────── viz: KPI tile with sparkline ────────── */
function KPI({
  label,
  value,
  series,
  color,
  delta,
}: {
  label: string
  value: string
  series: number[]
  color: string
  delta: string
}) {
  const w = 100, h = 32
  const min = Math.min(...series)
  const max = Math.max(...series)
  const pts = series.map((v, i) => {
    const x = (i / (series.length - 1)) * w
    const y = h - ((v - min) / Math.max(1, max - min)) * h
    return [x, y] as const
  })
  const d = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  return (
    <div className="panel rounded-lg p-3" style={{ borderColor: `${color}30` }}>
      <div className="text-mono text-[9px] text-neutral-500 tracking-widest">{label}</div>
      <div className="flex items-baseline justify-between mt-1">
        <div className="text-xl font-bold" style={{ color }}>
          {value}
        </div>
        <div className="text-mono text-[10px]" style={{ color }}>
          {delta}
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-7 mt-1">
        <path d={`${d} L ${w} ${h} L 0 ${h} Z`} fill={color} opacity="0.15" />
        <path d={d} fill="none" stroke={color} strokeWidth={1.4} />
        {pts.length > 0 && (
          <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={2} fill={color}>
            <animate attributeName="r" values="2;3.5;2" dur="1.6s" repeatCount="indefinite" />
          </circle>
        )}
      </svg>
    </div>
  )
}

export default function Hero() {
  const [size, setSize] = useState({ w: 1200, h: 480 })
  const [net, setNet] = useState<{ nodes: Node[]; edges: [number, number][] }>({ nodes: [], edges: [] })
  const [pulse, setPulse] = useState<number[]>([])

  useEffect(() => {
    const resize = () => {
      const w = Math.min(window.innerWidth - 48, 1280)
      const h = Math.min(520, Math.max(360, window.innerHeight * 0.5))
      setSize({ w, h })
      setNet(buildNet(w, h))
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useEffect(() => {
    const i = setInterval(() => {
      setPulse(net.edges.map((_, idx) => (Math.random() < 0.18 ? Date.now() + idx : 0)))
    }, 900)
    return () => clearInterval(i)
  }, [net])

  return (
    <section id="top" className="relative min-h-screen overflow-hidden">
      {/* status bar */}
      <div className="absolute top-0 inset-x-0 z-20 border-b border-white/5 bg-ink-950/60 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between text-mono text-[11px]">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-viz-emerald animate-pulse" />
            <span className="text-neutral-400">SYSTEM</span>
            <span className="text-neutral-200">manohar.reddy / ai-engineer</span>
          </div>
          <div className="hidden md:flex items-center gap-5 text-neutral-400">
            <span>LAT <span className="text-viz-emerald">&lt;120ms</span></span>
            <span>UPTIME <span className="text-viz-amber">99.9%</span></span>
            <span>MODELS <span className="text-viz-rose">15+</span></span>
            <span>v5.0</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-12">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-8 items-start">
          {/* LEFT: identity + dashboards */}
          <div>
            <div className="text-mono text-[11px] text-viz-emerald mb-3 tracking-widest">
              ◢ AI / ML ENGINEER · DALLAS, TX
            </div>
            <h1 className="text-5xl md:text-6xl xl:text-7xl font-bold leading-[0.95] tracking-tight">
              MANOHAR
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-viz-emerald via-viz-lime to-viz-amber">
                REDDY
              </span>
            </h1>

            <div className="mt-5 flex flex-wrap gap-2 text-mono text-[10px]">
              {[
                ['RECSYS', '#34d399'],
                ['FRAUD-ML', '#fb7185'],
                ['MLOPS', '#fbbf24'],
                ['STREAMING', '#a3e635'],
                ['CLOUD', '#fb923c'],
              ].map(([k, c]) => (
                <span
                  key={k}
                  className="px-2.5 py-1 border rounded-full"
                  style={{ borderColor: `${c}55`, color: c }}
                >
                  {k}
                </span>
              ))}
            </div>

            {/* KPI sparkline tiles */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              <KPI
                label="P50 LATENCY"
                value="118ms"
                color="#34d399"
                delta="↓ 72%"
                series={[420, 380, 320, 260, 200, 170, 150, 140, 130, 124, 120, 118]}
              />
              <KPI
                label="CTR LIFT"
                value="+8.2%"
                color="#fbbf24"
                delta="↑ live"
                series={[1, 2, 2, 3, 3, 4, 5, 5, 6, 7, 8, 8]}
              />
              <KPI
                label="FRAUD FP"
                value="−20%"
                color="#fb7185"
                delta="↓ trend"
                series={[100, 96, 94, 90, 88, 85, 84, 83, 82, 81, 80, 80]}
              />
            </div>

            {/* terminal + activity grid */}
            <div className="grid md:grid-cols-2 gap-3 mt-3">
              <Terminal />
              <ActivityGrid />
            </div>
          </div>

          {/* RIGHT: neural network */}
          <div className="relative">
            <div className="text-mono text-[10px] text-neutral-500 mb-2 flex justify-between">
              <span>NETWORK · live inference</span>
              <span className="text-viz-emerald">● streaming</span>
            </div>
            <div className="panel rounded-lg overflow-hidden relative" style={{ height: size.h }}>
              <svg
                width="100%"
                height={size.h}
                viewBox={`0 0 ${size.w} ${size.h}`}
                preserveAspectRatio="xMidYMid meet"
              >
                {layers.map((_, i) => {
                  const x = 60 + i * ((size.w - 120) / (layers.length - 1))
                  return (
                    <text
                      key={i}
                      x={x}
                      y={size.h - 8}
                      textAnchor="middle"
                      className="text-mono"
                      fontSize="10"
                      fill="#525252"
                    >
                      L{i}
                    </text>
                  )
                })}

                {net.edges.map(([a, b], idx) => {
                  const na = net.nodes[a]
                  const nb = net.nodes[b]
                  const active = pulse[idx]
                  const color = COLORS[na.layer % COLORS.length]
                  return (
                    <g key={idx}>
                      <line
                        x1={na.x}
                        y1={na.y}
                        x2={nb.x}
                        y2={nb.y}
                        stroke={color}
                        strokeOpacity={active ? 0.55 : 0.08}
                        strokeWidth={active ? 1.2 : 0.6}
                      />
                      {active ? (
                        <circle r={2.5} fill={color}>
                          <animate attributeName="cx" from={na.x} to={nb.x} dur="0.9s" begin="0s" fill="freeze" />
                          <animate attributeName="cy" from={na.y} to={nb.y} dur="0.9s" begin="0s" fill="freeze" />
                          <animate attributeName="opacity" from="1" to="0" dur="0.9s" begin="0s" fill="freeze" />
                        </circle>
                      ) : null}
                    </g>
                  )
                })}

                {net.nodes.map((n, i) => {
                  const color = COLORS[n.layer % COLORS.length]
                  return (
                    <g key={i}>
                      <circle cx={n.x} cy={n.y} r={n.r + 4} fill={color} opacity="0.08" />
                      <circle cx={n.x} cy={n.y} r={n.r} fill={color}>
                        <animate
                          attributeName="r"
                          values={`${n.r};${n.r + 1.5};${n.r}`}
                          dur={`${2 + (i % 3)}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>
                  )
                })}
              </svg>

              <div className="absolute top-3 left-3 text-mono text-[10px] text-neutral-500 space-y-1">
                <div>layers: <span className="text-viz-emerald">{layers.length}</span></div>
                <div>params: <span className="text-viz-amber">{net.edges.length.toLocaleString()}</span></div>
                <div>loss: <span className="text-viz-rose">0.0142</span></div>
              </div>
              <div className="absolute bottom-3 right-3 text-mono text-[10px] text-neutral-500">
                epoch <span className="text-viz-lime">218 / 256</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-mono text-[10px] text-neutral-500"
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 1.6 }}
      >
        ↓ SCROLL · DATA BELOW
      </motion.div>
    </section>
  )
}
