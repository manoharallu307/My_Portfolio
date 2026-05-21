'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

const COLORS = ['#34d399', '#a3e635', '#fbbf24', '#fb923c', '#fb7185', '#2dd4bf']

type Particle = { x: number; y: number; vx: number; vy: number; r: number; c: string }

function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  const mouse = useRef({ x: -9999, y: -9999 })

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = (canvas.width = window.innerWidth * devicePixelRatio)
    let h = (canvas.height = window.innerHeight * devicePixelRatio)
    canvas.style.width = window.innerWidth + 'px'
    canvas.style.height = window.innerHeight + 'px'

    const count = Math.min(80, Math.floor((window.innerWidth * window.innerHeight) / 24000))
    const parts: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25 * devicePixelRatio,
      vy: (Math.random() - 0.5) * 0.25 * devicePixelRatio,
      r: (Math.random() * 1.6 + 0.6) * devicePixelRatio,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
    }))

    const onResize = () => {
      w = canvas.width = window.innerWidth * devicePixelRatio
      h = canvas.height = window.innerHeight * devicePixelRatio
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
    }
    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX * devicePixelRatio
      mouse.current.y = e.clientY * devicePixelRatio
    }
    const onLeave = () => {
      mouse.current.x = -9999
      mouse.current.y = -9999
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)

    let raf = 0
    const linkDist = 130 * devicePixelRatio

    const tick = () => {
      ctx.clearRect(0, 0, w, h)

      for (const p of parts) {
        const dx = mouse.current.x - p.x
        const dy = mouse.current.y - p.y
        const dist2 = dx * dx + dy * dy
        const repel = 140 * devicePixelRatio
        if (dist2 < repel * repel) {
          const d = Math.sqrt(dist2) || 1
          p.vx -= (dx / d) * 0.08
          p.vy -= (dy / d) * 0.08
        }
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.985
        p.vy *= 0.985
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0
      }

      // links
      for (let i = 0; i < parts.length; i++) {
        for (let j = i + 1; j < parts.length; j++) {
          const a = parts[i], b = parts[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 < linkDist * linkDist) {
            const alpha = 1 - Math.sqrt(d2) / linkDist
            ctx.strokeStyle = `rgba(120,200,160,${alpha * 0.12})`
            ctx.lineWidth = 0.6 * devicePixelRatio
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      // dots
      for (const p of parts) {
        ctx.fillStyle = p.c
        ctx.globalAlpha = 0.55
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 0.12
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return <canvas ref={ref} className="absolute inset-0 w-full h-full opacity-70" />
}

function Blobs() {
  // procedurally placed gradient blobs that drift
  const blobs = useMemo(
    () => [
      { c: '#34d399', size: 600, x: '10%', y: '5%',  dur: '22s' },
      { c: '#fbbf24', size: 520, x: '78%', y: '20%', dur: '28s' },
      { c: '#fb7185', size: 480, x: '60%', y: '70%', dur: '24s' },
      { c: '#2dd4bf', size: 420, x: '8%',  y: '70%', dur: '30s' },
      { c: '#fb923c', size: 360, x: '90%', y: '92%', dur: '26s' },
    ],
    []
  )
  return (
    <div className="absolute inset-0 overflow-hidden">
      {blobs.map((b, i) => (
        <div
          key={i}
          className="absolute rounded-full mix-blend-screen"
          style={{
            width: b.size,
            height: b.size,
            left: b.x,
            top: b.y,
            transform: 'translate(-50%,-50%)',
            background: `radial-gradient(circle, ${b.c}33 0%, ${b.c}10 35%, transparent 65%)`,
            filter: 'blur(40px)',
            animation: `blobDrift ${b.dur} ease-in-out infinite`,
            animationDelay: `${-i * 3}s`,
          }}
        />
      ))}
    </div>
  )
}

function Grid() {
  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)
        `,
        backgroundSize: '56px 56px',
        maskImage:
          'radial-gradient(ellipse 80% 70% at 50% 30%, #000 40%, transparent 100%)',
        WebkitMaskImage:
          'radial-gradient(ellipse 80% 70% at 50% 30%, #000 40%, transparent 100%)',
        animation: 'gridPan 40s linear infinite',
      }}
    />
  )
}

function ScanSweep() {
  return (
    <div className="absolute inset-x-0 top-0 h-full overflow-hidden pointer-events-none">
      <div
        className="absolute left-0 right-0 h-32 opacity-40"
        style={{
          background:
            'linear-gradient(180deg, transparent, rgba(52,211,153,0.08), transparent)',
          animation: 'sweep 9s linear infinite',
        }}
      />
    </div>
  )
}

function Rings() {
  // distant concentric rings in the corner
  return (
    <svg
      className="absolute -right-32 top-1/3 opacity-[0.18]"
      width="600"
      height="600"
      viewBox="0 0 600 600"
    >
      {[80, 140, 200, 260, 320, 380].map((r, i) => (
        <circle
          key={r}
          cx="300"
          cy="300"
          r={r}
          fill="none"
          stroke={COLORS[i % COLORS.length]}
          strokeOpacity="0.5"
          strokeWidth="0.6"
          strokeDasharray={`${i * 3 + 4} ${i * 2 + 2}`}
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 300 300`}
            to={`${i % 2 ? 360 : -360} 300 300`}
            dur={`${30 + i * 8}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
      <circle cx="300" cy="300" r="6" fill="#34d399" />
    </svg>
  )
}

function CodeRain() {
  // very subtle ascii drift on left edge
  const [cols, setCols] = useState<string[][]>([])
  useEffect(() => {
    const chars = '01·▮▯◆◇░▒'.split('')
    const make = () =>
      Array.from({ length: 6 }, () =>
        Array.from({ length: 28 }, () => chars[Math.floor(Math.random() * chars.length)])
      )
    setCols(make())
    const i = setInterval(() => setCols(make()), 1800)
    return () => clearInterval(i)
  }, [])
  return (
    <div className="absolute left-2 top-24 hidden lg:flex gap-4 text-mono text-[9px] text-viz-emerald/15 select-none pointer-events-none">
      {cols.map((col, i) => (
        <div key={i} className="flex flex-col leading-4">
          {col.map((c, j) => (
            <span key={j} style={{ opacity: 1 - j / col.length }}>{c}</span>
          ))}
        </div>
      ))}
    </div>
  )
}

export default function Background() {
  return (
    <>
      <style jsx global>{`
        @keyframes gridPan {
          0% { background-position: 0 0; }
          100% { background-position: 56px 56px; }
        }
        @keyframes blobDrift {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          33%      { transform: translate(-46%, -54%) scale(1.08); }
          66%      { transform: translate(-54%, -48%) scale(0.94); }
        }
        @keyframes sweep {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(110vh); }
        }
      `}</style>
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-ink-950" />
        <Blobs />
        <Grid />
        <Rings />
        <CodeRain />
        <ParticleCanvas />
        <ScanSweep />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, transparent 0%, rgba(10,10,11,0.55) 60%, rgba(10,10,11,0.95) 100%)',
          }}
        />
        {/* vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)',
          }}
        />
      </div>
    </>
  )
}
