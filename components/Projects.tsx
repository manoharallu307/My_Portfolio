'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Github } from 'lucide-react'

type P = {
  name: string
  blurb: string
  tags: string[]
  color: string
  stats: { label: string; before: number; after: number; unit: string; better: 'low' | 'high' }[]
  series: number[] // sparkline data
  github?: string
}

const PROJECTS: P[] = [
  {
    name: 'Real-Time Recsys',
    blurb: 'Collaborative filtering on Pub/Sub + Dataflow with Bigtable tiered cache.',
    tags: ['Python', 'GCP', 'Bigtable', 'TensorFlow'],
    color: '#34d399',
    stats: [
      { label: 'P50 latency', before: 420, after: 118, unit: 'ms', better: 'low'  },
      { label: 'CTR uplift',  before: 0,   after: 8,   unit: '%',  better: 'high' },
      { label: 'Throughput',  before: 1.0, after: 3.2, unit: 'k/s', better: 'high' },
    ],
    series: [3, 4, 5, 4, 6, 7, 6, 8, 9, 8, 10, 11],
    github: 'https://github.com/manoharreddy/recommendation-engine',
  },
  {
    name: 'Fraud-ML Pipeline',
    blurb: 'Hybrid rule + gradient-boosted models for real-time authorization on AWS.',
    tags: ['XGBoost', 'AWS Lambda', 'API GW', 'Glue'],
    color: '#fb7185',
    stats: [
      { label: 'False positives', before: 100, after: 80, unit: '%',  better: 'low'  },
      { label: 'Detection recall',before: 78,  after: 91, unit: '%',  better: 'high' },
      { label: 'Decision time',   before: 320, after: 95, unit: 'ms', better: 'low'  },
    ],
    series: [9, 8, 8, 7, 6, 6, 5, 5, 4, 4, 3, 3],
    github: 'https://github.com/manoharreddy/fraud-detection',
  },
  {
    name: 'Portfolio Risk Analytics',
    blurb: 'Unified customer-data layer + Power BI dashboards for risk reviews.',
    tags: ['SQL', 'PostgreSQL', 'Power BI', 'Python'],
    color: '#fbbf24',
    stats: [
      { label: 'Aggregation time', before: 210, after: 50, unit: 'min', better: 'low' },
      { label: 'Schemas unified',  before: 1,   after: 12, unit: '',    better: 'high' },
      { label: 'Manual reports',   before: 100, after: 30, unit: '%',   better: 'low' },
    ],
    series: [10, 9, 9, 8, 7, 6, 5, 5, 4, 3, 3, 2],
    github: 'https://github.com/manoharreddy/risk-analytics',
  },
  {
    name: 'Streaming Feature Store',
    blurb: 'Event → feature enrichment with Dataflow → BigQuery for model freshness.',
    tags: ['Dataflow', 'Pub/Sub', 'BigQuery'],
    color: '#a3e635',
    stats: [
      { label: 'Feature freshness', before: 60,  after: 5,   unit: 'min', better: 'low'  },
      { label: 'Model refresh',     before: 24,  after: 1,   unit: 'h',   better: 'low'  },
      { label: 'Coverage',          before: 60,  after: 95,  unit: '%',   better: 'high' },
    ],
    series: [4, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10],
    github: 'https://github.com/manoharreddy/feature-store',
  },
  {
    name: 'Neural CF Engine',
    blurb: 'Matrix factorization + deep collab filtering, Faiss ANN retrieval.',
    tags: ['PyTorch', 'TensorFlow', 'Faiss', 'LightFM'],
    color: '#2dd4bf',
    stats: [
      { label: 'NDCG@10',     before: 0.32, after: 0.41, unit: '',  better: 'high' },
      { label: 'Retrieval',   before: 90,   after: 18,   unit: 'ms', better: 'low'  },
      { label: 'Catalog',     before: 1,    after: 4.5,  unit: 'M', better: 'high' },
    ],
    series: [3, 4, 4, 5, 5, 6, 7, 7, 8, 8, 9, 9],
    github: 'https://github.com/manoharreddy/collab-filtering',
  },
  {
    name: 'MLOps Control Plane',
    blurb: 'Airflow DAGs + SageMaker for training, registry, canary deploys.',
    tags: ['Airflow', 'SageMaker', 'Docker'],
    color: '#fb923c',
    stats: [
      { label: 'Deploy time',   before: 240, after: 35,  unit: 'min', better: 'low'  },
      { label: 'Rollback MTTR', before: 60,  after: 6,   unit: 'min', better: 'low'  },
      { label: 'Release cadence', before: 1, after: 5,   unit: '/wk', better: 'high' },
    ],
    series: [8, 7, 7, 6, 5, 5, 4, 4, 3, 3, 2, 2],
  },
]

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 120, h = 36
  const min = Math.min(...data), max = Math.max(...data)
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / Math.max(1, max - min)) * h
    return [x, y] as const
  })
  const d = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  const area = `${d} L ${w} ${h} L 0 ${h} Z`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-9">
      <path d={area} fill={color} opacity="0.12" />
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.2} fill={color} />
      ))}
    </svg>
  )
}

function Bar({
  before,
  after,
  unit,
  better,
  color,
  inView,
}: {
  before: number
  after: number
  unit: string
  better: 'low' | 'high'
  color: string
  inView: boolean
}) {
  const max = Math.max(before, after) || 1
  const bw = (before / max) * 100
  const aw = (after / max) * 100
  const delta =
    before === 0
      ? '+∞'
      : `${after > before ? '+' : ''}${(((after - before) / Math.max(before, 1)) * 100).toFixed(0)}%`
  const positive =
    (better === 'low' && after < before) || (better === 'high' && after > before)
  return (
    <div>
      <div className="flex gap-2 items-center">
        <div className="flex-1 space-y-1.5">
          <div className="relative h-2.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={inView ? { width: `${bw}%` } : {}}
              transition={{ duration: 0.8 }}
              className="absolute inset-y-0 left-0 bg-neutral-600 rounded-full"
            />
          </div>
          <div className="relative h-2.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={inView ? { width: `${aw}%` } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{ background: color }}
              className="absolute inset-y-0 left-0 rounded-full"
            />
          </div>
        </div>
        <div className="text-mono text-[10px] w-14 text-right">
          <div className="text-neutral-500">{before}{unit}</div>
          <div style={{ color }}>{after}{unit}</div>
        </div>
        <div
          className="text-mono text-[10px] w-12 text-right"
          style={{ color: positive ? color : '#a3a3a3' }}
        >
          {delta}
        </div>
      </div>
    </div>
  )
}

export default function Projects() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <section id="projects" ref={ref} className="relative py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-baseline justify-between flex-wrap gap-4 mb-10">
          <div>
            <div className="text-mono text-[11px] text-viz-rose tracking-widest mb-2">
              § 03 · PROJECTS · BEFORE / AFTER
            </div>
            <h2 className="text-3xl md:text-5xl font-bold">Measured outcomes.</h2>
          </div>
          <div className="text-mono text-[10px] text-neutral-500 flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-neutral-500 rounded" /> BEFORE
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-viz-emerald rounded" /> AFTER
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PROJECTS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 22 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="panel panel-hover rounded-lg p-5 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${p.color}, transparent)` }} />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-mono text-[10px] text-neutral-500">
                    PROJECT · {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="text-lg font-bold mt-1" style={{ color: p.color }}>
                    {p.name}
                  </div>
                </div>
                {p.github && (
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-500 hover:text-neutral-200"
                    aria-label="GitHub"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                )}
              </div>

              <p className="text-sm text-neutral-400 mt-2 leading-relaxed">{p.blurb}</p>

              <div className="mt-4 flex items-end justify-between gap-3">
                <div className="flex-1">
                  <Sparkline data={p.series} color={p.color} />
                </div>
                <div className="text-mono text-[9px] text-neutral-500 mb-1">trend · 12mo</div>
              </div>

              <div className="mt-4 space-y-3">
                {p.stats.map((s) => (
                  <div key={s.label}>
                    <div className="text-mono text-[10px] text-neutral-500 mb-1">
                      {s.label}
                    </div>
                    <Bar {...s} color={p.color} inView={inView} />
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="text-mono text-[9px] px-2 py-0.5 rounded border"
                    style={{ borderColor: `${p.color}33`, color: '#a3a3a3' }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
