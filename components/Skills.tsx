'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const RADAR = [
  { axis: 'ML Modeling',     value: 92, color: '#34d399' },
  { axis: 'Data Engineering',value: 88, color: '#a3e635' },
  { axis: 'MLOps',           value: 82, color: '#fbbf24' },
  { axis: 'Cloud Infra',     value: 86, color: '#fb923c' },
  { axis: 'Recsys',          value: 94, color: '#fb7185' },
  { axis: 'Analytics / SQL', value: 90, color: '#2dd4bf' },
]

type Bubble = { name: string; size: number; color: string; group: string }

const BUBBLES: Bubble[] = [
  { name: 'Python',      size: 95, color: '#34d399', group: 'lang' },
  { name: 'SQL',         size: 90, color: '#34d399', group: 'lang' },
  { name: 'TensorFlow',  size: 90, color: '#fb7185', group: 'ml'   },
  { name: 'PyTorch',     size: 88, color: '#fb7185', group: 'ml'   },
  { name: 'XGBoost',     size: 90, color: '#fb7185', group: 'ml'   },
  { name: 'scikit-learn',size: 92, color: '#fb7185', group: 'ml'   },
  { name: 'LightFM',     size: 70, color: '#fb7185', group: 'ml'   },
  { name: 'Faiss',       size: 72, color: '#fb7185', group: 'ml'   },
  { name: 'AWS',         size: 88, color: '#fb923c', group: 'cloud'},
  { name: 'GCP',         size: 85, color: '#fb923c', group: 'cloud'},
  { name: 'BigQuery',    size: 85, color: '#fb923c', group: 'cloud'},
  { name: 'Bigtable',    size: 75, color: '#fb923c', group: 'cloud'},
  { name: 'PostgreSQL',  size: 88, color: '#2dd4bf', group: 'data' },
  { name: 'Dataflow',    size: 80, color: '#2dd4bf', group: 'data' },
  { name: 'Pub/Sub',     size: 78, color: '#2dd4bf', group: 'data' },
  { name: 'Airflow',     size: 80, color: '#fbbf24', group: 'mlops'},
  { name: 'Docker',      size: 82, color: '#fbbf24', group: 'mlops'},
  { name: 'SageMaker',   size: 80, color: '#fbbf24', group: 'mlops'},
  { name: 'Power BI',    size: 78, color: '#a3e635', group: 'analytics' },
  { name: 'Glue',        size: 76, color: '#fb923c', group: 'cloud'},
]

function Radar({ inView }: { inView: boolean }) {
  const size = 360
  const cx = size / 2
  const cy = size / 2
  const R = 130
  const n = RADAR.length

  const point = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2
    const r = (v / 100) * R
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as const
  }

  const rings = [0.25, 0.5, 0.75, 1]
  const polyPts = RADAR.map((d, i) => point(i, d.value)).map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-md mx-auto">
      {rings.map((r, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={R * r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
        />
      ))}
      {RADAR.map((d, i) => {
        const [x, y] = point(i, 100)
        return (
          <line
            key={d.axis}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="rgba(255,255,255,0.06)"
          />
        )
      })}

      {/* polygon */}
      <motion.polygon
        points={polyPts}
        fill="url(#radarFill)"
        stroke="#34d399"
        strokeWidth={1.5}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      <defs>
        <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0.02" />
        </radialGradient>
      </defs>

      {/* points */}
      {RADAR.map((d, i) => {
        const [x, y] = point(i, d.value)
        return (
          <g key={d.axis}>
            <circle cx={x} cy={y} r={5} fill={d.color} />
            <circle cx={x} cy={y} r={9} fill={d.color} opacity="0.18" />
          </g>
        )
      })}

      {/* axis labels */}
      {RADAR.map((d, i) => {
        const [x, y] = point(i, 130)
        return (
          <g key={d.axis + 'lbl'}>
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              className="text-mono"
              fill="#a3a3a3"
            >
              {d.axis}
            </text>
            <text
              x={x}
              y={y + 12}
              textAnchor="middle"
              fontSize="9"
              className="text-mono"
              fill={d.color}
            >
              {d.value}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function pack(b: Bubble[], W: number, H: number) {
  // simple deterministic pack: spiral placement with collision check
  const placed: { x: number; y: number; r: number; b: Bubble }[] = []
  const sorted = [...b].sort((a, c) => c.size - a.size)
  sorted.forEach((bub) => {
    const r = 10 + (bub.size / 100) * 28
    let placedOk = false
    let attempts = 0
    while (!placedOk && attempts < 600) {
      const angle = attempts * 0.6
      const radius = Math.sqrt(attempts) * 6
      const x = W / 2 + Math.cos(angle) * radius
      const y = H / 2 + Math.sin(angle) * radius
      if (x - r < 0 || x + r > W || y - r < 0 || y + r > H) {
        attempts++
        continue
      }
      const collides = placed.some((p) => {
        const dx = p.x - x, dy = p.y - y
        return Math.sqrt(dx * dx + dy * dy) < p.r + r + 3
      })
      if (!collides) {
        placed.push({ x, y, r, b: bub })
        placedOk = true
      }
      attempts++
    }
  })
  return placed
}

function Bubbles({ inView }: { inView: boolean }) {
  const W = 520, H = 380
  const packed = pack(BUBBLES, W, H)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {packed.map((p, i) => (
        <motion.g
          key={p.b.name}
          initial={{ opacity: 0, scale: 0 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.02 * i, type: 'spring', stiffness: 80 }}
          style={{ transformOrigin: `${p.x}px ${p.y}px` }}
        >
          <circle cx={p.x} cy={p.y} r={p.r + 3} fill={p.b.color} opacity="0.08" />
          <circle
            cx={p.x}
            cy={p.y}
            r={p.r}
            fill={p.b.color}
            fillOpacity="0.18"
            stroke={p.b.color}
            strokeWidth="1"
          />
          <text
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={Math.max(8, Math.min(13, p.r / 2.2))}
            className="text-mono"
            fill="#e5e5e7"
          >
            {p.b.name}
          </text>
        </motion.g>
      ))}
    </svg>
  )
}

export default function Skills() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="skills" ref={ref} className="relative py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-baseline justify-between flex-wrap gap-4 mb-10">
          <div>
            <div className="text-mono text-[11px] text-viz-lime tracking-widest mb-2">
              § 04 · CAPABILITY · RADAR + WEIGHT
            </div>
            <h2 className="text-3xl md:text-5xl font-bold">Skills landscape.</h2>
          </div>
          <div className="flex items-center gap-3 text-mono text-[10px] text-neutral-500">
            {['lang', 'ml', 'cloud', 'data', 'mlops', 'analytics'].map((g, i) => {
              const c = ['#34d399', '#fb7185', '#fb923c', '#2dd4bf', '#fbbf24', '#a3e635'][i]
              return (
                <span key={g} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: c }} />
                  {g}
                </span>
              )
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="panel rounded-lg p-6">
            <div className="text-mono text-[10px] text-neutral-500 mb-3">RADAR · core domains</div>
            <Radar inView={inView} />
          </div>
          <div className="panel rounded-lg p-6">
            <div className="text-mono text-[10px] text-neutral-500 mb-3">WEIGHTS · tech depth · area ∝ proficiency</div>
            <Bubbles inView={inView} />
          </div>
        </div>
      </div>
    </section>
  )
}
