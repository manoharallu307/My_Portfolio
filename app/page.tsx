import Background from '@/components/Background'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Experience from '@/components/Experience'
import Projects from '@/components/Projects'
import Skills from '@/components/Skills'
import TechMatrix from '@/components/TechMatrix'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="relative min-h-screen text-neutral-200">
      <Background />
      <Header />
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Skills />
      <TechMatrix />
      <Contact />
      <Footer />
    </main>
  )
}
