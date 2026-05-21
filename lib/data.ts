// Portfolio data - customize this with your own information

import { Project, Skill } from './types'

export const personalInfo = {
  name: 'Manohar Reddy',
  title: 'AI Engineer | ML Solutions Architect',
  email: 'manoharallu307@gmail.com',
  phone: '+1-940-320-9116',
  location: 'Dallas, TX, USA',
  bio: 'Senior AI/ML Engineer with 5+ years of experience building and deploying production-grade machine learning systems. Specialized in recommendation systems, fraud detection, and real-time ML pipelines.',
  social: {
    github: 'https://github.com/manoharreddy',
    linkedin: 'https://www.linkedin.com/in/manohar-allu-2232211b7/',
    twitter: 'https://twitter.com/manoharreddy',
  },
}

export const projects: Project[] = [
  {
    id: 1,
    title: 'Real-Time Recommendation Engine',
    description: 'Built scalable recommendation system using collaborative filtering with GCP Pub/Sub, Dataflow, and BigQuery. Achieved sub-120ms latency with tiered caching using Bigtable. Improved CTR by 8% through real-time feature enrichment.',
    tags: ['Python', 'GCP', 'Pub/Sub', 'Dataflow', 'Bigtable', 'TensorFlow', 'AWS SageMaker'],
    github: 'https://github.com/manoharreddy/recommendation-engine',
    demo: '',
    featured: true,
  },
  {
    id: 2,
    title: 'Fraud Detection ML Pipeline',
    description: 'Designed end-to-end fraud detection system combining rule-based and ML models for real-time payment authorization. Reduced false positives by 20% using gradient-boosted models and anomaly detection on AWS infrastructure.',
    tags: ['Python', 'XGBoost', 'AWS', 'S3', 'Glue', 'Lambda', 'API Gateway'],
    github: 'https://github.com/manoharreddy/fraud-detection',
    demo: '',
    featured: true,
  },
  {
    id: 3,
    title: 'Portfolio Risk Analytics Platform',
    description: 'Consolidated fragmented customer data across SQL schemas and built Power BI dashboards for portfolio tracking. Reduced aggregation time from 3.5 hours to 50 minutes through query optimization and indexing.',
    tags: ['SQL', 'Python', 'Power BI', 'PostgreSQL', 'Data Engineering'],
    github: 'https://github.com/manoharreddy/risk-analytics',
    demo: '',
    featured: true,
  },
  {
    id: 4,
    title: 'Real-Time Feature Store',
    description: 'Implemented streaming feature enrichment pipeline from user events using GCP Dataflow. Enabled faster model updates and improved recommendation quality in production systems.',
    tags: ['Python', 'GCP Dataflow', 'Pub/Sub', 'BigQuery', 'Feature Engineering'],
    github: 'https://github.com/manoharreddy/feature-store',
    demo: '',
    featured: false,
  },
  {
    id: 5,
    title: 'Collaborative Filtering System',
    description: 'Developed neural collaborative filtering models using TensorFlow and PyTorch. Integrated matrix factorization and deep learning approaches for personalized recommendations at scale.',
    tags: ['Python', 'TensorFlow', 'PyTorch', 'Faiss', 'LightFM'],
    github: 'https://github.com/manoharreddy/collab-filtering',
    demo: '',
    featured: false,
  },
]

export const skills: Skill[] = [
  { name: 'Python', level: 95, category: 'frontend' },
  { name: 'TensorFlow', level: 90, category: 'frontend' },
  { name: 'PyTorch', level: 88, category: 'frontend' },
  { name: 'scikit-learn', level: 92, category: 'frontend' },
  { name: 'XGBoost', level: 90, category: 'frontend' },
  { name: 'SQL', level: 90, category: 'backend' },
  { name: 'AWS', level: 88, category: 'backend' },
  { name: 'GCP', level: 85, category: 'backend' },
  { name: 'Docker', level: 82, category: 'tools' },
  { name: 'Airflow', level: 80, category: 'tools' },
  { name: 'PostgreSQL', level: 88, category: 'backend' },
  { name: 'BigQuery', level: 85, category: 'backend' },
]
