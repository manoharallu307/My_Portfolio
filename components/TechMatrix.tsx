'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const COMPANIES = [
  { name: 'Barclays', color: '#fb7185' },
  { name: 'PayPal',   color: '#fbbf24' },
  { name: 'Airbnb',   color: '#34d399' },
]

type Row = { tech: string; row: number[]; cat: string }

const ROWS: Row[] = [
  // languages
  { tech: 'Python',       row: [3, 3, 3], cat: 'lang' },
  { tech: 'SQL',          row: [3, 3, 3], cat: 'lang' },
  { tech: 'Bash / Shell', row: [2, 3, 3], cat: 'lang' },
  { tech: 'Java / Scala', row: [2, 2, 1], cat: 'lang' },
  { tech: 'JavaScript',   row: [1, 1, 2], cat: 'lang' },
  // ML
  { tech: 'XGBoost',      row: [2, 3, 3], cat: 'ml'   },
  { tech: 'TensorFlow',   row: [1, 2, 3], cat: 'ml'   },
  { tech: 'PyTorch',      row: [1, 2, 3], cat: 'ml'   },
  { tech: 'scikit-learn', row: [3, 3, 3], cat: 'ml'   },
  { tech: 'LightFM',      row: [1, 2, 3], cat: 'ml'   },
  { tech: 'Faiss',        row: [0, 1, 3], cat: 'ml'   },
  // cloud
  { tech: 'AWS',          row: [1, 3, 2], cat: 'cloud'},
  { tech: 'GCP',          row: [1, 1, 3], cat: 'cloud'},
  { tech: 'BigQuery',     row: [1, 1, 3], cat: 'cloud'},
  { tech: 'Bigtable',     row: [1, 1, 3], cat: 'cloud'},
  { tech: 'Dataflow',     row: [1, 1, 3], cat: 'cloud'},
  { tech: 'Pub/Sub',      row: [1, 1, 3], cat: 'cloud'},
  { tech: 'Glue',         row: [1, 3, 1], cat: 'cloud'},
  { tech: 'Lambda',       row: [1, 3, 2], cat: 'cloud'},
  // data
  { tech: 'PostgreSQL',   row: [3, 3, 2], cat: 'data' },
  { tech: 'MySQL',        row: [3, 2, 1], cat: 'data' },
  { tech: 'Kafka',        row: [1, 2, 3], cat: 'data' },
  // mlops
  { tech: 'SageMaker',    row: [1, 2, 3], cat: 'mlops'},
  { tech: 'Airflow',      row: [2, 3, 3], cat: 'mlops'},
  { tech: 'Docker',       row: [2, 3, 3], cat: 'mlops'},
  { tech: 'Kubernetes',   row: [1, 2, 3], cat: 'mlops'},
  { tech: 'Git / CI',     row: [3, 3, 3], cat: 'mlops'},
  // analytics
  { tech: 'Power BI',     row: [3, 1, 1], cat: 'analytics' },
  { tech: 'Tableau',      row: [2, 2, 1], cat: 'analytics' },
  { tech: 'Pandas / NumPy', row: [3, 3, 3], cat: 'analytics' },
]

const CAT_COLOR: Record<string, string> = {
  lang: '#34d399',
  ml: '#fb7185',
  cloud: '#fb923c',
  data: '#2dd4bf',
  mlops: '#fbbf24',
  analytics: '#a3e635',
}

const CAT_LABEL: Record<string, string> = {
  lang: 'language',
  ml: 'ML / models',
  cloud: 'cloud infra',
  data: 'data layer',
  mlops: 'mlops',
  analytics: 'analytics',
}

const cellBg = (v: number, base: string) => {
  if (v === 0) return 'rgba(255,255,255,0.025)'
  const opacity = v === 1 ? 0.42 : v === 2 ? 0.72 : 1
  // base is hex without alpha; produce rgba
  const r = parseInt(base.slice(1, 3), 16)
  const g = parseInt(base.slice(3, 5), 16)
  const b = parseInt(base.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${opacity})`
}

export default function TechMatrix() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  // aggregates
  const rowSums = ROWS.map((r) => r.row.reduce((a, b) => a + b, 0))
  const maxRow = Math.max(...rowSums)
  const colSums = COMPANIES.map((_, ci) => ROWS.reduce((a, r) => a + r.row[ci], 0))
  const maxCol = Math.max(...colSums)

  // category breakdown
  const catTotals: Record<string, number> = {}
  ROWS.forEach((r) => {
    catTotals[r.cat] = (catTotals[r.cat] || 0) + r.row.reduce((a, b) => a + b, 0)
  })
  const catTotal = Object.values(catTotals).reduce((a, b) => a + b, 0)

  // group rows by category for visual separation
  const grouped = Object.keys(CAT_COLOR)
    .map((cat) => ({ cat, rows: ROWS.map((r, i) => ({ r, i, sum: rowSums[i] })).filter((x) => x.r.cat === cat) }))
    .filter((g) => g.rows.length > 0)

  return (
    <section id="stack" ref={ref} className="relative py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-baseline justify-between flex-wrap gap-4 mb-10">
          <div>
            <div className="text-mono text-[11px] text-viz-orange tracking-widest mb-2">
              § 05 · STACK · HEATMAP
            </div>
            <h2 className="text-3xl md:text-5xl font-bold">Where I&apos;ve used what.</h2>
          </div>
          <div className="flex items-center gap-3 text-mono text-[10px] text-neutral-500">
            <span>DEPTH</span>
            {[1, 2, 3].map((v) => (
              <span key={v} className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-sm"
                  style={{ background: cellBg(v, '#fb923c') }}
                />
                {v === 1 ? 'used' : v === 2 ? 'core' : 'heavy'}
              </span>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5">
          {/* MATRIX */}
          <div className="panel rounded-lg p-5 overflow-x-auto">
            <div className="min-w-[560px]">
              {/* column header */}
              <div
                className="grid items-end gap-2 pb-3 border-b border-white/5"
                style={{ gridTemplateColumns: '150px repeat(3, 56px) 1fr' }}
              >
                <div className="text-mono text-[9px] text-neutral-500 tracking-widest">
                  TECH · COMPANY
                </div>
                {COMPANIES.map((c) => (
                  <div key={c.name} className="text-center">
                    <div className="text-mono text-[10px]" style={{ color: c.color }}>
                      {c.name}
                    </div>
                    <div className="mt-1 h-0.5 mx-auto w-8" style={{ background: c.color }} />
                  </div>
                ))}
                <div className="text-mono text-[9px] text-neutral-500 tracking-widest pl-3">
                  USAGE INDEX →
                </div>
              </div>

              {/* rows grouped by category */}
              {grouped.map((g, gi) => (
                <div key={g.cat} className="py-2">
                  <div className="flex items-center gap-2 mb-1.5 px-1">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: CAT_COLOR[g.cat] }}
                    />
                    <span className="text-mono text-[9px] tracking-widest" style={{ color: CAT_COLOR[g.cat] }}>
                      {CAT_LABEL[g.cat].toUpperCase()}
                    </span>
                    <span className="text-mono text-[9px] text-neutral-600">
                      {g.rows.length} item{g.rows.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {g.rows.map(({ r, i, sum }) => (
                    <motion.div
                      key={r.tech}
                      initial={{ opacity: 0, x: -10 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.3, delay: 0.04 * i }}
                      className="grid items-center gap-2 py-0.5 group"
                      style={{ gridTemplateColumns: '150px repeat(3, 56px) 1fr' }}
                    >
                      <div className="text-mono text-[11px] text-neutral-200 pl-3 truncate">
                        {r.tech}
                      </div>
                      {r.row.map((v, ci) => (
                        <div key={ci} className="flex items-center justify-center">
                          <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={inView ? { scale: 1, opacity: 1 } : {}}
                            transition={{ duration: 0.25, delay: 0.02 * i + 0.04 * ci }}
                            title={`${r.tech} @ ${COMPANIES[ci].name}: ${v === 0 ? 'not used' : v === 1 ? 'used' : v === 2 ? 'core' : 'heavy'}`}
                            className="w-10 h-7 rounded flex items-center justify-center text-mono text-[10px] transition-transform group-hover:scale-[1.04]"
                            style={{
                              background: cellBg(v, CAT_COLOR[r.cat]),
                              color: v >= 2 ? '#0a0a0b' : v === 1 ? '#0a0a0b' : '#525252',
                              fontWeight: v >= 2 ? 700 : 600,
                              boxShadow: v === 3 ? `0 0 12px ${CAT_COLOR[r.cat]}55` : 'none',
                            }}
                          >
                            {v > 0 ? v : '·'}
                          </motion.div>
                        </div>
                      ))}
                      {/* row usage bar */}
                      <div className="pl-3 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={inView ? { width: `${(sum / maxRow) * 100}%` } : {}}
                            transition={{ duration: 0.8, delay: 0.1 + 0.02 * i }}
                            className="h-full rounded-full"
                            style={{ background: CAT_COLOR[r.cat] }}
                          />
                        </div>
                        <span className="text-mono text-[9px] w-4 text-right" style={{ color: CAT_COLOR[r.cat] }}>
                          {sum}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                  {gi < grouped.length - 1 && <div className="border-b border-white/5 mt-2" />}
                </div>
              ))}

              {/* column totals footer */}
              <div
                className="grid items-center gap-2 pt-3 mt-2 border-t border-white/10"
                style={{ gridTemplateColumns: '150px repeat(3, 56px) 1fr' }}
              >
                <div className="text-mono text-[9px] text-neutral-500 tracking-widest pl-3">
                  Σ TOTAL
                </div>
                {colSums.map((s, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="text-mono text-[12px] font-bold" style={{ color: COMPANIES[i].color }}>
                      {s}
                    </div>
                    <div className="w-10 h-1 bg-white/5 rounded-full overflow-hidden mt-1">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={inView ? { width: `${(s / maxCol) * 100}%` } : {}}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="h-full rounded-full"
                        style={{ background: COMPANIES[i].color }}
                      />
                    </div>
                  </div>
                ))}
                <div className="pl-3 text-mono text-[10px] text-neutral-500">
                  total depth-points across stack
                </div>
              </div>
            </div>
          </div>

          {/* SIDE PANEL: category breakdown */}
          <div className="space-y-5">
            <div className="panel rounded-lg p-5">
              <div className="text-mono text-[10px] text-neutral-500 mb-4 tracking-widest">
                CATEGORY MIX
              </div>
              {/* stacked horizontal bar */}
              <div className="h-2.5 rounded-full overflow-hidden flex bg-white/5">
                {Object.entries(catTotals).map(([cat, v], i) => (
                  <motion.div
                    key={cat}
                    initial={{ width: 0 }}
                    animate={inView ? { width: `${(v / catTotal) * 100}%` } : {}}
                    transition={{ duration: 0.9, delay: 0.1 * i }}
                    style={{ background: CAT_COLOR[cat] }}
                    className="h-full"
                  />
                ))}
              </div>
              <div className="mt-4 space-y-2">
                {Object.entries(catTotals)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, v], i) => (
                    <motion.div
                      key={cat}
                      initial={{ opacity: 0, x: -6 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.3, delay: 0.05 * i }}
                      className="flex items-center gap-3 text-mono text-[11px]"
                    >
                      <span className="w-2 h-2 rounded-full" style={{ background: CAT_COLOR[cat] }} />
                      <span className="flex-1 text-neutral-300">{CAT_LABEL[cat]}</span>
                      <span style={{ color: CAT_COLOR[cat] }}>{v}</span>
                      <span className="text-neutral-600 w-10 text-right">
                        {((v / catTotal) * 100).toFixed(0)}%
                      </span>
                    </motion.div>
                  ))}
              </div>
            </div>

            {/* top techs */}
            <div className="panel rounded-lg p-5">
              <div className="text-mono text-[10px] text-neutral-500 mb-4 tracking-widest">
                TOP · TECH BY DEPTH
              </div>
              <div className="space-y-2.5">
                {ROWS.map((r, i) => ({ r, sum: rowSums[i] }))
                  .sort((a, b) => b.sum - a.sum)
                  .slice(0, 7)
                  .map((x, i) => (
                    <motion.div
                      key={x.r.tech}
                      initial={{ opacity: 0, x: -6 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.3, delay: 0.05 * i }}
                      className="flex items-center gap-3"
                    >
                      <span
                        className="text-mono text-[9px] w-5 text-center rounded"
                        style={{ background: `${CAT_COLOR[x.r.cat]}22`, color: CAT_COLOR[x.r.cat] }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-mono text-[11px] text-neutral-200 w-24 truncate">
                        {x.r.tech}
                      </span>
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={inView ? { width: `${(x.sum / 9) * 100}%` } : {}}
                          transition={{ duration: 0.7, delay: 0.05 * i }}
                          className="h-full"
                          style={{ background: CAT_COLOR[x.r.cat] }}
                        />
                      </div>
                      <span className="text-mono text-[10px] w-4 text-right" style={{ color: CAT_COLOR[x.r.cat] }}>
                        {x.sum}
                      </span>
                    </motion.div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
