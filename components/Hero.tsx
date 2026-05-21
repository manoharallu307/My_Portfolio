'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const LAYERS = [4, 6, 6, 5, 3]
const COLORS = ['#34d399', '#a3e635', '#fbbf24', '#fb923c', '#fb7185']

/* ──────────────────────────────────────────────────────────────
   Neural network — single canvas, requestAnimationFrame.
   No React state writes after mount → no re-renders, no hitches.
   ────────────────────────────────────────────────────────────── */
type Node = { x: number; y: number; layer: number; r: number; phase: number }
type Edge = { a: number; b: number; color: string }
type Pulse = { e: number; t: number; speed: number }

function NeuralCanvas({ height }: { height: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef<{
    nodes: Node[]
    edges: Edge[]
    pulses: Pulse[]
    w: number
    h: number
    dpr: number
  }>({ nodes: [], edges: [], pulses: [], w: 0, h: 0, dpr: 1 })

  useEffect(() => {
    const canvas = ref.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const rect = wrap.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const nodes: Node[] = []
      const padX = 50
      const padY = 36
      const gapX = (w - padX * 2) / (LAYERS.length - 1)
      LAYERS.forEach((count, li) => {
        const gapY = (h - padY * 2) / Math.max(count - 1, 1)
        for (let i = 0; i < count; i++) {
          nodes.push({
            x: padX + li * gapX,
            y: count === 1 ? h / 2 : padY + i * gapY,
            layer: li,
            r: 3.5 + Math.random() * 2.5,
            phase: Math.random() * Math.PI * 2,
          })
        }
      })

      const edges: Edge[] = []
      for (let li = 0; li < LAYERS.length - 1; li++) {
        const a = nodes.filter((n) => n.layer === li)
        const b = nodes.filter((n) => n.layer === li + 1)
        a.forEach((na) =>
          b.forEach((nb) => {
            if (Math.random() < 0.7) {
              edges.push({
                a: nodes.indexOf(na),
                b: nodes.indexOf(nb),
                color: COLORS[na.layer % COLORS.length],
              })
            }
          })
        )
      }

      // pre-seed pulses: about 22% of edges, staggered
      const pulses: Pulse[] = []
      edges.forEach((_, i) => {
        if (Math.random() < 0.22) {
          pulses.push({
            e: i,
            t: Math.random(),
            speed: 0.35 + Math.random() * 0.55, // per second
          })
        }
      })

      stateRef.current = { nodes, edges, pulses, w, h, dpr }
    }

    build()
    const onResize = () => build()
    window.addEventListener('resize', onResize)

    let raf = 0
    let last = performance.now()

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const { nodes, edges, pulses, w, h } = stateRef.current

      ctx.clearRect(0, 0, w, h)

      // edges (static, very dim)
      ctx.lineWidth = 0.6
      for (const e of edges) {
        const na = nodes[e.a]
        const nb = nodes[e.b]
        ctx.strokeStyle = e.color + '14' // ~8% alpha
        ctx.beginPath()
        ctx.moveTo(na.x, na.y)
        ctx.lineTo(nb.x, nb.y)
        ctx.stroke()
      }

      // pulses — advance + draw flowing dots
      for (const p of pulses) {
        p.t += p.speed * dt
        if (p.t >= 1) {
          // recycle: jump to a new random edge
          p.t = 0
          p.e = (p.e + 1 + Math.floor(Math.random() * 7)) % edges.length
          p.speed = 0.35 + Math.random() * 0.55
        }
        const e = edges[p.e]
        const na = nodes[e.a]
        const nb = nodes[e.b]
        const x = na.x + (nb.x - na.x) * p.t
        const y = na.y + (nb.y - na.y) * p.t

        // bright line trailing behind the dot
        const tailT = Math.max(0, p.t - 0.18)
        const tx = na.x + (nb.x - na.x) * tailT
        const ty = na.y + (nb.y - na.y) * tailT
        const grad = ctx.createLinearGradient(tx, ty, x, y)
        grad.addColorStop(0, e.color + '00')
        grad.addColorStop(1, e.color + 'cc')
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.4
        ctx.beginPath()
        ctx.moveTo(tx, ty)
        ctx.lineTo(x, y)
        ctx.stroke()

        // head
        ctx.fillStyle = e.color
        ctx.beginPath()
        ctx.arc(x, y, 2.2, 0, Math.PI * 2)
        ctx.fill()
      }

      // nodes — gentle breathing
      for (const n of nodes) {
        n.phase += dt * 1.6
        const pulseR = n.r + Math.sin(n.phase) * 0.8
        const color = COLORS[n.layer % COLORS.length]
        // halo
        ctx.fillStyle = color + '1a'
        ctx.beginPath()
        ctx.arc(n.x, n.y, pulseR + 5, 0, Math.PI * 2)
        ctx.fill()
        // core
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(n.x, n.y, pulseR, 0, Math.PI * 2)
        ctx.fill()
      }

      // layer labels
      ctx.fillStyle = '#525252'
      ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, monospace'
      ctx.textAlign = 'center'
      for (let i = 0; i < LAYERS.length; i++) {
        const x = 50 + i * ((w - 100) / (LAYERS.length - 1))
        ctx.fillText(`L${i}`, x, h - 6)
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas ref={ref} />
    </div>
  )
}

/* ────────── typewriter terminal ────────── */
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

/* ────────── activity grid ────────── */
function ActivityGrid() {
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

/* ────────── KPI tile with sparkline ────────── */
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
        <div className="text-xl font-bold" style={{ color }}>{value}</div>
        <div className="text-mono text-[10px]" style={{ color }}>{delta}</div>
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
  const [netH, setNetH] = useState(480)

  useEffect(() => {
    const update = () => {
      setNetH(Math.min(520, Math.max(360, window.innerHeight * 0.5)))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <section id="top" className="relative min-h-screen overflow-hidden">
      <div className="absolute top-0 inset-x-0 z-20 border-b border-white/5 bg-ink-950/60">
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
          {/* LEFT */}
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

            <div className="grid md:grid-cols-2 gap-3 mt-3">
              <Terminal />
              <ActivityGrid />
            </div>
          </div>

          {/* RIGHT: neural network — canvas */}
          <div className="relative">
            <div className="text-mono text-[10px] text-neutral-500 mb-2 flex justify-between">
              <span>NETWORK · live inference</span>
              <span className="text-viz-emerald">● streaming</span>
            </div>
            <div className="panel rounded-lg overflow-hidden relative" style={{ height: netH }}>
              <NeuralCanvas height={netH} />

              <div className="absolute top-3 left-3 text-mono text-[10px] text-neutral-500 space-y-1 pointer-events-none">
                <div>layers: <span className="text-viz-emerald">{LAYERS.length}</span></div>
                <div>params: <span className="text-viz-amber">8.4M</span></div>
                <div>loss: <span className="text-viz-rose">0.0142</span></div>
              </div>
              <div className="absolute bottom-3 right-3 text-mono text-[10px] text-neutral-500 pointer-events-none">
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
