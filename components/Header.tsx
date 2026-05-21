'use client'

import { useEffect, useState } from 'react'

const sections = [
  { id: 'top', label: 'INDEX' },
  { id: 'impact', label: 'IMPACT' },
  { id: 'career', label: 'CAREER' },
  { id: 'projects', label: 'PROJECTS' },
  { id: 'skills', label: 'SKILLS' },
  { id: 'stack', label: 'STACK' },
  { id: 'contact', label: 'CONTACT' },
]

export default function Header() {
  const [active, setActive] = useState('top')

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY + window.innerHeight / 3
      let current = 'top'
      for (const s of sections) {
        const el = document.getElementById(s.id)
        if (el && el.offsetTop <= y) current = s.id
      }
      setActive(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-3 text-mono text-[10px]">
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="group flex items-center gap-3 justify-end"
        >
          <span
            className={`transition-all ${
              active === s.id
                ? 'text-viz-emerald opacity-100'
                : 'opacity-0 group-hover:opacity-100 text-neutral-400'
            }`}
          >
            {s.label}
          </span>
          <span
            className={`block h-px transition-all ${
              active === s.id
                ? 'w-8 bg-viz-emerald'
                : 'w-4 bg-neutral-600 group-hover:bg-neutral-300'
            }`}
          />
        </a>
      ))}
    </nav>
  )
}
