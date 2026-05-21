import { Github, Linkedin, Mail } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-white/5 py-8 text-mono text-[11px] text-neutral-500">
      <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-viz-emerald animate-pulse" />
          <span>© {year} · manohar reddy · all systems nominal</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://github.com/manoharreddy" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-viz-emerald">
            <Github className="w-4 h-4" />
          </a>
          <a href="https://www.linkedin.com/in/manohar-allu-2232211b7/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-viz-teal">
            <Linkedin className="w-4 h-4" />
          </a>
          <a href="mailto:manoharallu307@gmail.com" aria-label="Email" className="hover:text-viz-amber">
            <Mail className="w-4 h-4" />
          </a>
        </div>
      </div>
    </footer>
  )
}
