// Type definitions for your portfolio data

export interface Project {
  id: number
  title: string
  description: string
  image?: string
  tags: string[]
  github?: string
  demo?: string
  featured?: boolean
}

export interface Skill {
  name: string
  level: number
  category: 'frontend' | 'backend' | 'tools'
}

export interface Experience {
  id: number
  company: string
  position: string
  startDate: Date
  endDate?: Date
  description: string
  technologies: string[]
}

export interface ContactForm {
  name: string
  email: string
  message: string
}
