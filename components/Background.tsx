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
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 1.25)

    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const W = () => window.innerWidth
    const H = () => window.innerHeight

    const count = Math.min(48, Math.floor((W() * H()) / 32000))
    const parts: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * W(),
      y: Math.random() * H(),
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.4 + 0.6,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
    }))

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
    }
    const onLeave = () => {
      mouse.current.x = -9999
      mouse.current.y = -9999
    }

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseleave', onLeave)

    let raf = 0
    let last = performance.now()
    let visible = true
    const onVis = () => (visible = document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onVis)

    const linkDist = 110

    const tick = (now: number) => {
      if (!visible) {
        raf = requestAnimationFrame(tick)
        last = now
        return
      }
      const dt = Math.min(2, (now - last) / 16.6) // frames-equivalent
      last = now
      const w = W(), h = H()
      ctx.clearRect(0, 0, w, h)

      // movement
      for (const p of parts) {
        const dx = mouse.current.x - p.x
        const dy = mouse.current.y - p.y
        const d2 = dx * dx + dy * dy
        if (d2 < 130 * 130) {
          const d = Math.sqrt(d2) || 1
          p.vx -= (dx / d) * 0.05 * dt
          p.vy -= (dy / d) * 0.05 * dt
        }
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.vx *= 0.985
        p.vy *= 0.985
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0
      }

      // links — coarse spatial cull
      ctx.lineWidth = 0.6
      for (let i = 0; i < parts.length; i++) {
        const a = parts[i]
        for (let j = i + 1; j < parts.length; j++) {
          const b = parts[j]
          const dx = a.x - b.x
          if (dx > linkDist || dx < -linkDist) continue
          const dy = a.y - b.y
          if (dy > linkDist || dy < -linkDist) continue
          const d2 = dx * dx + dy * dy
          if (d2 < linkDist * linkDist) {
            const alpha = 1 - Math.sqrt(d2) / linkDist
            ctx.strokeStyle = `rgba(120,200,160,${alpha * 0.1})`
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
      }
      ctx.globalAlpha = 1

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return <canvas ref={ref} className="absolute inset-0 w-full h-full opacity-70" />
}

function Blobs() {
  const blobs = useMemo(
    () => [
      { c: '#34d399', size: 560, x: '10%', y: '5%',  dur: '24s' },
      { c: '#fbbf24', size: 480, x: '78%', y: '20%', dur: '30s' },
      { c: '#fb7185', size: 440, x: '60%', y: '70%', dur: '26s' },
      { c: '#2dd4bf', size: 400, x: '8%',  y: '70%', dur: '32s' },
      { c: '#fb923c', size: 340, x: '90%', y: '92%', dur: '28s' },
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
            transform: 'translate3d(-50%,-50%,0)',
            background: `radial-gradient(circle, ${b.c}28 0%, ${b.c}0d 35%, transparent 65%)`,
            filter: 'blur(28px)',
            willChange: 'transform',
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
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute"
        style={{
          inset: '-56px',
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)
          `,
          backgroundSize: '56px 56px',
          maskImage:
            'radial-gradient(ellipse 80% 70% at 50% 30%, #000 40%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 70% at 50% 30%, #000 40%, transparent 100%)',
          animation: 'gridPanXY 50s linear infinite',
          willChange: 'transform',
        }}
      />
    </div>
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
          animation: 'sweep 10s linear infinite',
          willChange: 'transform',
        }}
      />
    </div>
  )
}

function Rings() {
  return (
    <svg
      className="absolute -right-32 top-1/3 opacity-[0.16]"
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
  const [cols, setCols] = useState<string[][]>([])
  useEffect(() => {
    const chars = '01·▮▯◆◇░▒'.split('')
    const make = () =>
      Array.from({ length: 6 }, () =>
        Array.from({ length: 28 }, () => chars[Math.floor(Math.random() * chars.length)])
      )
    setCols(make())
    const i = setInterval(() => setCols(make()), 2200)
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
        @keyframes gridPanXY {
          0%   { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(56px, 56px, 0); }
        }
        @keyframes blobDrift {
          0%, 100% { transform: translate3d(-50%, -50%, 0) scale(1); }
          33%      { transform: translate3d(-46%, -54%, 0) scale(1.06); }
          66%      { transform: translate3d(-54%, -48%, 0) scale(0.95); }
        }
        @keyframes sweep {
          0%   { transform: translate3d(0, -100%, 0); }
          100% { transform: translate3d(0, 110vh, 0); }
        }
      `}</style>
      <div
        className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
        style={{ contain: 'strict' }}
      >
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
