'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Mail, MapPin, Phone, Github, Linkedin } from 'lucide-react'

export default function Contact() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="contact" ref={ref} className="relative py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
          <div>
            <div className="text-mono text-[11px] text-viz-teal tracking-widest mb-2">
              § 06 · CONNECT
            </div>
            <h2 className="text-3xl md:text-6xl font-bold leading-[0.95]">
              Let&apos;s build
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-viz-emerald via-viz-teal to-viz-lime">
                something that ships.
              </span>
            </h2>
            <p className="text-neutral-400 mt-5 max-w-md text-sm">
              I&apos;m open to senior ML engineering roles, contracting, and
              advising. Best for recsys, fraud / risk ML, and real-time
              feature pipelines.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3 max-w-md">
              {[
                { icon: Mail,     label: 'manoharallu307@gmail.com', href: 'mailto:manoharallu307@gmail.com', c: '#34d399' },
                { icon: Phone,    label: '+1 (940) 320-9116',       href: 'tel:+19403209116',              c: '#fbbf24' },
                { icon: MapPin,   label: 'Dallas, TX',              href: '#',                              c: '#fb7185' },
                { icon: Linkedin, label: 'linkedin/manohar-allu',   href: 'https://www.linkedin.com/in/manohar-allu-2232211b7/', c: '#2dd4bf' },
              ].map((c, i) => {
                const Icon = c.icon
                return (
                  <motion.a
                    key={c.label}
                    href={c.href}
                    target={c.href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 10 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.05 * i }}
                    className="panel panel-hover rounded-lg p-3 flex items-center gap-3 group"
                  >
                    <span
                      className="p-2 rounded"
                      style={{ background: `${c.c}15`, color: c.c }}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-mono text-[11px] text-neutral-300 group-hover:text-white truncate">
                      {c.label}
                    </span>
                  </motion.a>
                )
              })}
            </div>
          </div>

          {/* viz: orbiting connection */}
          <div className="panel rounded-lg p-6 relative overflow-hidden">
            <div className="text-mono text-[10px] text-neutral-500 mb-2">
              ● ROUTING · always-on
            </div>
            <svg viewBox="0 0 400 400" className="w-full">
              {/* concentric rings */}
              {[60, 110, 160, 210].map((r) => (
                <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="rgba(255,255,255,0.05)" />
              ))}

              {/* center pulse */}
              <circle cx="200" cy="200" r="14" fill="#34d399" opacity="0.9" />
              <circle cx="200" cy="200" r="24" fill="none" stroke="#34d399" strokeOpacity="0.4">
                <animate attributeName="r" from="14" to="80" dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.6" to="0" dur="2.4s" repeatCount="indefinite" />
              </circle>
              <text x="200" y="244" textAnchor="middle" fontSize="9" className="text-mono" fill="#a3a3a3">
                manohar.reddy
              </text>

              {/* satellite nodes */}
              {[
                { a: 0,   r: 160, c: '#a3e635', label: 'GH' },
                { a: 72,  r: 160, c: '#2dd4bf', label: 'LI' },
                { a: 144, r: 160, c: '#fbbf24', label: 'MAIL' },
                { a: 216, r: 160, c: '#fb923c', label: 'PHONE' },
                { a: 288, r: 160, c: '#fb7185', label: 'DAL' },
              ].map((n, i) => {
                const rad = (n.a * Math.PI) / 180
                const x = 200 + Math.cos(rad) * n.r
                const y = 200 + Math.sin(rad) * n.r
                return (
                  <g key={i}>
                    <line x1="200" y1="200" x2={x} y2={y} stroke={n.c} strokeOpacity="0.25" strokeDasharray="2 4">
                      <animate attributeName="stroke-dashoffset" from="0" to="-12" dur="1.5s" repeatCount="indefinite" />
                    </line>
                    <circle cx={x} cy={y} r="18" fill={n.c} fillOpacity="0.12" stroke={n.c} />
                    <text x={x} y={y + 3} textAnchor="middle" fontSize="9" className="text-mono" fill={n.c}>
                      {n.label}
                    </text>
                  </g>
                )
              })}
            </svg>
            <div className="text-mono text-[10px] text-neutral-500 mt-2 flex justify-between">
              <span>↳ open inbound</span>
              <span className="text-viz-emerald">200 OK</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
